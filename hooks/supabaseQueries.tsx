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