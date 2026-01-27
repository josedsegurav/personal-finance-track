export interface Supabase {
    data: Array<object>
    error: string;
}

export interface Category {
    id: number;
    category_name: string;
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

