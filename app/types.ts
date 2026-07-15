export interface Supabase {
    data: Array<object>
    error: string;
}

export interface Category {
    id: number;
    category_name: string;
}

// After the Category interface:
export interface Budget {
    id: number;
    user_id: string;
    category_id: number;
    categories?: Category;
    amount: number;
    month: number;
    year: number;
    created_at: Date;
}

export interface BudgetWithSpent extends Budget {
    spent: number;
    remaining: number;
    percentage: number;
    carryover: number;
    effective_amount: number;
}

export interface Store {
    id: number;
    store_name: string;
}

export interface Income {
    id: number;
    created_at: Date;
    description: string;
    gross_income: number;
    net_income: number;
    income_date: string;
}

export interface Expense {
    id: number;
    created_at: Date;
    description: string;
    store_id: number;
    payment_method: string;
    amount: string;
    expense_date: Date;
    total_expense: string;
}

export interface ExpenseDetailed {
    id: number;
    created_at: Date;
    description: string;
    stores: Store;
    payment_method: string;
    amount: string;
    expense_date: string;
    total_expense: number;
}

export interface ExpenseInPurchase {
    id: number;
    expense_date: Date;
    stores: Array<Store>;
}

export interface PurchaseDetailed {
    id: number;
    created_at: Date;
    item: string;
    categories: Category;
    amount: number;
    taxes: number;
    notes: string;
    user_id: number;
    expenses: Array<ExpenseInPurchase>;
}

export interface PurchaseDialog {
    id: number;
    created_at: Date;
    item: string;
    categories: Category;
    amount: number;
    taxes: number;
    notes: string;
}

export interface SavingsAccount {
    id:           number;
    user_id:      string;
    name:         string;
    description?: string | null;
    goal_amount?: number | null;
    color?:       string | null;
    is_active?:   boolean | null;
    is_recurring?: boolean | null;
    created_at?:  string | null;
}

export interface SavingsPlan {
    id: number;
    user_id: string;
    savings_account_id: number;
    planned_amount: number;
    month: number;
    year: number;
    created_at: Date;
}

export interface SavingsContribution {
    id: number;
    savings_plan_id: number;
    amount: number;
    note?: string;
    contribution_date: string;
    created_at: Date;
}

export interface SavingsAccountWithPlan extends SavingsAccount {
    plan: SavingsPlan | null;
    contributions: SavingsContribution[];
    plannedAmount: number;
    totalContributed: number;
    remaining: number;               // plannedAmount - totalContributed
    allTimeSaved: number;
    progressPercent: number;         // allTimeSaved / goal_amount
}

export interface CategoryBudgetRow {
    id: number;
    category_id: number;
    category_name: string;
    allocated_amount: number;
}

export interface CategoryBudgetStatus {
    categoryId: number;
    categoryName: string;
    budgetRowId: number | null;
}

export type CarryoverDisposition = 'same_category' | 'other_category' | 'savings' | 'discard';

export interface BudgetCarryover {
    id: number;
    user_id: string;
    category_id: number;
    from_month: number;
    from_year: number;
    to_month: number;
    to_year: number;
    delta_amount: number;
    disposition: CarryoverDisposition;
    target_category_id?: number | null;
    target_savings_account_id?: number | null;
    settled_at: string;
}

export interface CarryoverDispositionEntry {
    category_id: number;
    delta_amount: number;
    disposition: CarryoverDisposition;
    target_category_id?: number | null;
    target_savings_account_id?: number | null;
}

export interface SettlementRow {
    category_id: number;
    category_name: string;
    base_amount: number;
    effective_amount: number;
    spent: number;
    delta: number; // effective_amount - spent; positive = surplus, negative = overspent
}

export interface ExpectedIncome {
    id: string;
    user_id: string;
    amount: number;
    updated_at: string;
}

