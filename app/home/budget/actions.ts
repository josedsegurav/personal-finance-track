"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { revalidatePath } from "next/cache";
import type { CarryoverDispositionEntry } from "@/app/types";

export async function upsertBudget(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const category_id = Number(formData.get("category_id"));
    const amount = parseFloat(formData.get("amount") as string);
    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));

    const { error } = await supabase
        .from("budgets")
        .upsert(
            { user_id: user.id, category_id, amount, month, year },
            { onConflict: "user_id,category_id,month,year" }
        );

    if (error) throw new Error(error.message);

    revalidatePath("/home/budget");
}

export async function deleteBudget(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/home/budget");
}

export async function settlePreviousMonth(
    dispositions: CarryoverDispositionEntry[],
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!dispositions.length) return;

    // Build carryover rows — every category gets a row so the month is
    // marked as settled even when the disposition is 'discard'
    const carryoverRows = dispositions.map((d) => ({
        user_id:                   user.id,
        category_id:               d.category_id,
        from_month:                fromMonth,
        from_year:                 fromYear,
        to_month:                  toMonth,
        to_year:                   toYear,
        delta_amount:              d.delta_amount,
        disposition:               d.disposition,
        target_category_id:        d.target_category_id    ?? null,
        target_savings_account_id: d.target_savings_account_id ?? null,
    }));

    const { error: carryoverError } = await supabase
        .from("budget_carryovers")
        .insert(carryoverRows);

    if (carryoverError) throw new Error(carryoverError.message);

    // Handle savings dispositions — only positive deltas can go to savings
    const savingsEntries = dispositions.filter(
        (d) => d.disposition === "savings" &&
               d.target_savings_account_id != null &&
               d.delta_amount > 0
    );

    for (const entry of savingsEntries) {
        const accountId = entry.target_savings_account_id as number;

        // Find an existing savings plan for this account in the target month
        const { data: existingPlan } = await supabase
            .from("savings_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("savings_account_id", accountId)
            .eq("month", toMonth)
            .eq("year", toYear)
            .maybeSingle();

        let planId: number;

        if (existingPlan) {
            planId = existingPlan.id;
        } else {
            // Create a new plan for this account/month with the carryover as planned amount
            const { data: newPlan, error: planError } = await supabase
                .from("savings_plans")
                .insert({
                    user_id:            user.id,
                    savings_account_id: accountId,
                    planned_amount:     entry.delta_amount,
                    month:              toMonth,
                    year:               toYear,
                })
                .select("id")
                .single();

            if (planError || !newPlan) throw new Error(planError?.message ?? "Failed to create savings plan");
            planId = newPlan.id;
        }

        // Record the contribution against the plan
        const { error: contribError } = await supabase
            .from("savings_contributions")
            .insert({
                user_id:           user.id,
                savings_plan_id:   planId,
                amount:            entry.delta_amount,
                note:              `Budget surplus rollover from ${fromMonth}/${fromYear}`,
                contribution_date: `${toYear}-${String(toMonth).padStart(2, "0")}-01`,
            });

        if (contribError) throw new Error(contribError.message);
    }

    revalidatePath("/home/budget");
    revalidatePath("/home/savings");
    revalidatePath("/home/dashboard");
}

export async function copyBudgetsFromPreviousMonth(
    toMonth: number,
    toYear: number
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const prevMonth = toMonth === 1 ? 12 : toMonth - 1;
    const prevYear  = toMonth === 1 ? toYear - 1 : toYear;

    // Fetch previous month's budgets
    const { data: prevBudgets, error: prevError } = await supabase
        .from("budgets")
        .select("category_id, amount")
        .eq("user_id", user.id)
        .eq("month", prevMonth)
        .eq("year", prevYear);

    if (prevError || !prevBudgets?.length) return;

    // Fetch categories already set for the target month to avoid duplicates
    const { data: existing } = await supabase
        .from("budgets")
        .select("category_id")
        .eq("user_id", user.id)
        .eq("month", toMonth)
        .eq("year", toYear);

    const existingCategoryIds = new Set((existing ?? []).map((b) => b.category_id));

    const newRows = prevBudgets
        .filter((b) => !existingCategoryIds.has(b.category_id))
        .map((b) => ({
            user_id:     user.id,
            category_id: b.category_id,
            amount:      b.amount,
            month:       toMonth,
            year:        toYear,
        }));

    if (!newRows.length) return;

    const { error: insertError } = await supabase
        .from("budgets")
        .insert(newRows);

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/home/budget");
}

export async function updateExpectedIncome(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const amount = parseFloat(formData.get("amount") as string);
    if (isNaN(amount) || amount < 0) {
        throw new Error("Expected income must be a valid amount >= 0");
    }

    const { error } = await supabase
        .from("expected_income")
        .upsert(
            { user_id: user.id, amount, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
        );

    if (error) throw new Error(error.message);

    revalidatePath("/home/budget");
    revalidatePath("/home/dashboard");
    revalidatePath("/home/savings");
}

export async function resetCategoryCarryover(
    categoryId: number,
    month: number,
    year: number
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    // Fetch all carryovers for the target month to recompute net carryover server-side
    const { data: carryovers, error: fetchError } = await supabase
        .from("budget_carryovers")
        .select("category_id, delta_amount, disposition, target_category_id")
        .eq("user_id", user.id)
        .eq("to_month", month)
        .eq("to_year", year);

    if (fetchError) throw new Error(fetchError.message);
    if (!carryovers?.length) return; // nothing to reset

    // Recompute net carryover for this category, matching the aggregation logic
    // in app/home/budget/page.tsx (carryoverByCategory build).
    let netTotal = 0;
    for (const c of carryovers) {
        if (c.disposition === "same_category" && c.category_id === categoryId) {
            netTotal += c.delta_amount;
        } else if (
            c.disposition === "other_category" &&
            c.target_category_id != null &&
            c.target_category_id === categoryId
        ) {
            netTotal += c.delta_amount;
        }
    }

    if (netTotal === 0) return; // no-op

    // Insert a corrective row that cancels out the net carryover.
    // Using same month/year for from/to — this is a same-month correction,
    // not the output of settling a previous month.
    const { error: insertError } = await supabase
        .from("budget_carryovers")
        .insert({
            user_id:                   user.id,
            category_id:               categoryId,
            from_month:                month,
            from_year:                 year,
            to_month:                  month,
            to_year:                   year,
            delta_amount:              -netTotal,
            disposition:               "same_category",
            target_category_id:        null,
            target_savings_account_id: null,
        });

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/home/budget");
    revalidatePath("/home/dashboard");
}