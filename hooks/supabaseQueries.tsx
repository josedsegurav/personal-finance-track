import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getUser(supabase: Awaited<ReturnType<typeof createClient>>) {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    return user;
}

export async function getCategories(supabase: Awaited<ReturnType<typeof createClient>>) {

    const { data, error } = await supabase.from("categories").select("*");

    if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
}

export async function getStores(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.from("stores").select("*");

    if (error) {
        throw new Error(`Failed to fetch stores: ${error.message}`);
    }

    return data;
}

export async function getIncome(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.from("income").select(`*`);

    if (error) {
        throw new Error(`Failed to fetch income: ${error.message}`);
    }

    return data;
}

export async function getExpense(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.from("expenses").select(`*`);

    if (error) {
        throw new Error(`Failed to fetch expense: ${error.message}`);
    }

    return data;
}

export async function getExpenseDetailed(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.from("expenses").select(`
        id,
        created_at,
        amount,
        description,
        stores (id, store_name),
        payment_method,
        expense_date,
        user_id,
        total_expense
    `);

    if (error) {
        throw new Error(`Failed to fetch expense: ${error.message}`);
    }

    return data;
}

export async function getPurchases(supabase: Awaited<ReturnType<typeof createClient>>) {

    const { data, error } = await supabase.from("purchases").select(`
    id,
    created_at,
    item,
    categories (id, category_name),
    amount,
    taxes,
    notes,
    user_id,
    expenses (
      id,
      expense_date,
      stores (
        id,
        store_name
      )
    )
  `);

    if (error) {
        throw new Error(`Failed to fetch purchases: ${error.message}`);
    }

    return data;

}

export async function getBudgets(
    supabase: Awaited<ReturnType<typeof createClient>>,
    month: number,
    year: number
) {
    const { data, error } = await supabase
        .from("budgets")
        .select(`id, category_id, categories (id, category_name), amount, month, year`)
        .eq("month", month)
        .eq("year", year);

    if (error) return []; // graceful fallback if budget feature not yet migrated
    return data ?? [];
}

export async function getSavingsAccounts(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase
        .from("savings_accounts")
        .select(`
            id, user_id, name, description, goal_amount,
            color, is_active, is_recurring, created_at
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch savings accounts: ${error.message}`);
    return data;
}

export async function getSavingsPlans(
    supabase: Awaited<ReturnType<typeof createClient>>,
    month: number,
    year: number
) {
    const { data, error } = await supabase
        .from("savings_plans")
        .select(`
            id, savings_account_id, planned_amount, month, year,
            savings_contributions (id, amount, note, contribution_date, created_at)
        `)
        .eq("month", month)
        .eq("year", year);

    if (error) throw new Error(`Failed to fetch savings plans: ${error.message}`);
    return data;
}

export async function getAllTimeSavingsContributions(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase
        .from("savings_contributions")
        .select(`amount, savings_plans (savings_account_id)`);

    if (error) throw new Error(`Failed to fetch all-time contributions: ${error.message}`);
    return data;
}

export async function getSavingsAllPlans(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase
        .from("savings_plans")
        .select(`id, savings_account_id, planned_amount, month, year`);

    if (error) return [];
    return data ?? [];
}

export async function getBudgetCarryovers(
    supabase: Awaited<ReturnType<typeof createClient>>,
    toMonth: number,
    toYear: number
) {
    const { data, error } = await supabase
        .from("budget_carryovers")
        .select(`
            id, category_id, from_month, from_year,
            to_month, to_year, delta_amount, disposition,
            target_category_id, target_savings_account_id, settled_at
        `)
        .eq("to_month", toMonth)
        .eq("to_year", toYear);

    if (error) return [];
    return data ?? [];
}

export async function getExpectedIncome(
    supabase: Awaited<ReturnType<typeof createClient>>
) {
    const { data, error } = await supabase
        .from("expected_income")
        .select("id, user_id, amount, updated_at")
        .maybeSingle();

    if (error) return null; // graceful fallback if table not migrated
    return data ?? null;
}

export async function getUnsettledMonth(
    supabase: Awaited<ReturnType<typeof createClient>>,
    currentMonth: number,
    currentYear: number
): Promise<{ month: number; year: number } | null> {
    // Compute the previous calendar month relative to what's passed in.
    // currentMonth is 0-indexed (getMonth()), so January = 0 → prevMonth = 11.
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear  = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Check if any budgets exist for that previous month
    const { data: prevBudgets } = await supabase
        .from("budgets")
        .select("id")
        .eq("month", prevMonth)
        .eq("year", prevYear)
        .limit(1);

    if (!prevBudgets || prevBudgets.length === 0) return null;

    // Check if carryovers have already been settled FROM that month
    const { data: existingCarryovers } = await supabase
        .from("budget_carryovers")
        .select("id")
        .eq("from_month", prevMonth)
        .eq("from_year", prevYear)
        .limit(1);

    if (existingCarryovers && existingCarryovers.length > 0) return null;

    return { month: prevMonth, year: prevYear };
}