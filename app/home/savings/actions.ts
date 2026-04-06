"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser, getIncome, getExpense, getSavingsPlans } from "@/hooks/supabaseQueries";
import { revalidatePath } from "next/cache";

// ─── Helper: recompute available-to-save server-side (tamper-proof) ──────────
async function computeAvailable(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    month: number,
    year: number,
    excludePlanId?: number
): Promise<number> {
    const [income, expenses, plans] = await Promise.all([
        getIncome(supabase),
        getExpense(supabase),
        getSavingsPlans(supabase, month, year),
    ]);

    const monthlyIncome = (income ?? [])
        .filter(i => new Date(i.income_date).getMonth() === month &&
                     new Date(i.income_date).getFullYear() === year)
        .reduce((s, i) => s + parseFloat(i.net_income), 0);

    const monthlyExpenses = (expenses ?? [])
        .filter(e => new Date(e.expense_date).getMonth() === month &&
                     new Date(e.expense_date).getFullYear() === year)
        .reduce((s, e) => s + parseFloat(e.total_expense), 0);

    const totalPlanned = (plans ?? [])
        .filter(p => p.id !== excludePlanId)
        .reduce((s, p) => s + p.planned_amount, 0);

    return monthlyIncome - monthlyExpenses - totalPlanned;
}

// ─── Savings Accounts ────────────────────────────────────────────────────────

export async function createSavingsAccount(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const goal_amount = formData.get("goal_amount");

    const { error } = await supabase.from("savings_accounts").insert({
        user_id: user.id,
        name: formData.get("name"),
        description: formData.get("description") || null,
        goal_amount: goal_amount ? parseFloat(goal_amount as string) : null,
        color: formData.get("color") || "#BDD5EA",
        is_recurring: formData.get("is_recurring") === "true",
    });

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}

export async function archiveSavingsAccount(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("savings_accounts")
        .update({ is_active: false })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}

// ─── Savings Plans ───────────────────────────────────────────────────────────

export async function upsertSavingsPlan(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const savings_account_id = Number(formData.get("savings_account_id"));
    const planned_amount = parseFloat(formData.get("planned_amount") as string);
    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));
    const existing_plan_id = formData.get("existing_plan_id")
        ? Number(formData.get("existing_plan_id"))
        : undefined;

    // Recompute available server-side, excluding current plan if editing
    const available = await computeAvailable(supabase, user.id, month, year, existing_plan_id);

    // Allow over-allocation — only warn, don't block (handled in UI)
    // But we do prevent negative planned amounts
    if (planned_amount < 0) {
        throw new Error("Planned amount cannot be negative.");
    }

    const { error } = await supabase
        .from("savings_plans")
        .upsert(
            {
                user_id: user.id,
                savings_account_id,
                planned_amount,
                month,
                year,
            },
            { onConflict: "savings_account_id,month,year" }
        );

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}

export async function deleteSavingsPlan(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("savings_plans")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}

// ─── Savings Contributions ───────────────────────────────────────────────────

export async function addContribution(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const savings_plan_id = Number(formData.get("savings_plan_id"));
    const amount = parseFloat(formData.get("amount") as string);
    const note = formData.get("note") as string | null;
    const contribution_date = formData.get("contribution_date") as string;

    if (amount <= 0) throw new Error("Contribution amount must be positive.");

    // Verify plan exists and belongs to user
    const { data: plan, error: planError } = await supabase
        .from("savings_plans")
        .select("id, planned_amount, savings_contributions(amount)")
        .eq("id", savings_plan_id)
        .single();

    if (planError || !plan) throw new Error("Savings plan not found.");

    const { error } = await supabase.from("savings_contributions").insert({
        user_id: user.id,
        savings_plan_id,
        amount,
        note: note || null,
        contribution_date,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}

export async function deleteContribution(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("savings_contributions")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/home/savings");
}