"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { redirect } from "next/navigation";

export interface OnboardingBudget {
    categoryName: string; // matched to inserted category by name
    amount: number;
}

export interface OnboardingSavings {
    name: string;
    goalAmount: string;
    color: string;
}

export interface OnboardingPayload {
    categories: string[];
    stores: string[];
    budgets: OnboardingBudget[];     // amount per category name
    savings: OnboardingSavings[];
}

export async function submitOnboarding(payload: OnboardingPayload) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear  = currentDate.getFullYear();

    // ── 1. Insert categories ─────────────────────────────────────────────────
    const { data: insertedCategories, error: catError } = await supabase
        .from("categories")
        .insert(payload.categories.map((name) => ({ category_name: name })))
        .select("id, category_name");

    if (catError) throw new Error(`Failed to save categories: ${catError.message}`);

    // ── 2. Insert stores ─────────────────────────────────────────────────────
    const { error: storeError } = await supabase
        .from("stores")
        .insert(payload.stores.map((name) => ({ store_name: name })));

    if (storeError) throw new Error(`Failed to save stores: ${storeError.message}`);

    // ── 3. Insert budgets (map category name → id) ───────────────────────────
    if (payload.budgets.length > 0 && insertedCategories) {
        const nameToId = Object.fromEntries(
            insertedCategories.map((c) => [c.category_name, c.id])
        );

        const budgetRows = payload.budgets
            .map((b) => ({
                user_id:     user.id,
                category_id: nameToId[b.categoryName],
                amount:      b.amount,
                month:       currentMonth,
                year:        currentYear,
            }))
            .filter((b) => b.category_id != null && b.amount > 0);

        if (budgetRows.length > 0) {
            const { error: budgetError } = await supabase
                .from("budgets")
                .insert(budgetRows);

            if (budgetError) throw new Error(`Failed to save budgets: ${budgetError.message}`);
        }
    }

    // ── 4. Insert savings accounts ───────────────────────────────────────────
    if (payload.savings.length > 0) {
        const savingsRows = payload.savings.map((s) => ({
            user_id:      user.id,
            name:         s.name,
            goal_amount:  s.goalAmount ? parseFloat(s.goalAmount) : null,
            color:        s.color,
            is_active:    true,
            is_recurring: false,
        }));

        const { error: savingsError } = await supabase
            .from("savings_accounts")
            .insert(savingsRows);

        if (savingsError) throw new Error(`Failed to save savings goals: ${savingsError.message}`);
    }

    redirect("/home/dashboard");
}