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
    stores: Store | Store[];
    payment_method: string;
    amount: string;
    expense_date: string;
    total_expense: number;
}

export interface ExpenseInPurchase {
    id: number;
    expense_date: Date;
    stores: Store | Store[];
}

export interface PurchaseDetailed {
    id: number;
    created_at: Date;
    item: string;
    categories: Category | Category[];
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

export interface UserSettings {
    id: string;
    user_id: string;
    base_currency: string;
    budgeting_fx_rate: number | null;
    updated_at: Date;
}

export interface LoanExtra {
    label: string;
    amount: number | string | null;
}

export interface Loan {
    id: string;
    user_id: string;
    name: string;
    lender: string | null;
    principal: number;
    interest_rate: number | null;
    term_months: number | null;
    start_date: string | null;
    currency: string;
    status: "active" | "paid_off" | "archived";
    amortization_system: "french" | "german" | "unknown";
    extras: LoanExtra[];
    source_document_note: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface LoanScheduledPayment {
    id: string;
    loan_id: string;
    user_id: string;
    due_date: string;
    capital: number | null;
    interest: number | null;
    total_payment: number | null;
    balance_after: number | null;
    extras: LoanExtra[];
    source: "extracted" | "generated" | "manual";
    row_flag: string | null;
    created_at: Date;
}

export interface LoanActualPayment {
    id: string;
    loan_id: string;
    user_id: string;
    scheduled_payment_id: string | null;
    paid_date: string;
    amount_owed_loan_currency: number;
    amount_paid_base_currency: number;
    linked_expense_id: number | null;
    notes: string | null;
    created_at: Date;
}

export interface LoanScenario {
    id: string;
    loan_id: string;
    user_id: string;
    name: string;
    extra_monthly: number;
    lump_sum: number;
    lump_sum_date: string | null;
    strategy: "reduce_term" | "reduce_payment";
    result_payoff_date: string | null;
    result_months_saved: number | null;
    result_interest_saved: number | null;
    created_at: Date;
}

export interface LoanDocumentUnderstanding {
    has_schedule_table: boolean;
    currency: string;
    date_format: string;
    number_format: string;
    column_labels: string[];
    notes: string;
}

export interface LoanExtractionResult {
    loan: Partial<Loan>;
    schedule: Array<Partial<LoanScheduledPayment>>;
    flags: {
        schedule_found: boolean;
        unmapped_columns: string[];
        row_issues: Array<{ row_index: number; issue: string }>;
    };
}

