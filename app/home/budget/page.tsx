import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import BudgetManager from "@/components/budget/budgetManager";
import {
    getBudgets,
    getCategories,
    getPurchases,
    getUser,
    getBudgetCarryovers,
    getUnsettledMonth,
    getSavingsAccounts,
    getExpectedIncome,
} from "@/hooks/supabaseQueries";
import { BudgetWithSpent, BudgetCarryover, Category, SettlementRow  } from "@/app/types";
import ExpectedIncomeCard from "@/components/budget/ExpectedIncomeCard";
import { unallocatedFromExpected } from "@/lib/budget";

export default async function BudgetPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>;
}) {
    const supabase = await createClient();
    await getUser(supabase);

    const params = await searchParams;
    const today        = new Date();
    const todayMonth   = today.getMonth();    // 0-indexed, matches budgets table
    const todayYear    = today.getFullYear();

    const selectedMonth = params.month != null ? Number(params.month) : todayMonth;
    const selectedYear  = params.year  != null ? Number(params.year)  : todayYear;

    const [budgets, categories, purchases, carryovers, unsettledMonth, savingsAccounts, expectedIncome] =
        await Promise.all([
            getBudgets(supabase, selectedMonth, selectedYear),
            getCategories(supabase),
            getPurchases(supabase),
            getBudgetCarryovers(supabase, selectedMonth, selectedYear),
            getUnsettledMonth(supabase, todayMonth, todayYear),
            getSavingsAccounts(supabase),
            getExpectedIncome(supabase),
        ]);

        // Fetch settlement data only when a previous month needs settling
let settlementRows: SettlementRow[] = [];
if (unsettledMonth) {
    const [prevBudgets, prevIncomingCarryovers] = await Promise.all([
        getBudgets(supabase, unsettledMonth.month, unsettledMonth.year),
        getBudgetCarryovers(supabase, unsettledMonth.month, unsettledMonth.year),
    ]);

    // Carryovers that came INTO the unsettled month (already settled earlier)
    const prevCarryoverByCategory: Record<number, number> = {};
    (prevIncomingCarryovers as BudgetCarryover[]).forEach((c) => {
        if (c.disposition === "same_category") {
            prevCarryoverByCategory[c.category_id] =
                (prevCarryoverByCategory[c.category_id] ?? 0) + c.delta_amount;
        } else if (c.disposition === "other_category" && c.target_category_id != null) {
            prevCarryoverByCategory[c.target_category_id] =
                (prevCarryoverByCategory[c.target_category_id] ?? 0) + c.delta_amount;
        }
    });

    // Spending in the unsettled month — reuse the already-fetched purchases
    const prevSpentByCategory: Record<number, number> = {};
    purchases?.forEach((purchase) => {
        const raw = (purchase.expenses as unknown as { expense_date?: string } | null);
        const d = raw?.expense_date ? new Date(raw.expense_date) : null;
        if (
            d &&
            d.getMonth()    === unsettledMonth.month &&
            d.getFullYear() === unsettledMonth.year
        ) {
            const catId = (purchase.categories as unknown as Category)?.id;
            if (catId) {
                prevSpentByCategory[catId] =
                    (prevSpentByCategory[catId] ?? 0) + ((purchase.amount ?? 0) + (purchase.taxes ?? 0));
            }
        }
    });

    settlementRows = (prevBudgets ?? []).map((b) => {
        const carryoverIn      = prevCarryoverByCategory[b.category_id] ?? 0;
        const effective_amount = b.amount + carryoverIn;
        const spent            = prevSpentByCategory[b.category_id] ?? 0;
        return {
            category_id:      b.category_id,
            category_name:    (b.categories as unknown as Category)?.category_name
                                ?? `Category ${b.category_id}`,
            base_amount:      b.amount,
            effective_amount,
            spent,
            delta:            effective_amount - spent,
        };
    });
}

    // Build carryover delta map keyed by the category that receives the adjustment
    // same_category  → delta applies to category_id
    // other_category → delta applies to target_category_id
    // savings/discard → no budget effect
    const carryoverByCategory: Record<number, number> = {};
    (carryovers as BudgetCarryover[]).forEach((c) => {
        if (c.disposition === "same_category") {
            carryoverByCategory[c.category_id] =
                (carryoverByCategory[c.category_id] ?? 0) + c.delta_amount;
        } else if (c.disposition === "other_category" && c.target_category_id != null) {
            carryoverByCategory[c.target_category_id] =
                (carryoverByCategory[c.target_category_id] ?? 0) + c.delta_amount;
        }
    });

    // Compute spent per category for the selected month/year
    // expenses is a single object on each purchase, not an array
    const spentByCategory: Record<number, number> = {};
    purchases?.forEach((purchase) => {
        const raw = (purchase.expenses as unknown as { expense_date?: string } | null);
        const purchaseDate = raw?.expense_date ? new Date(raw.expense_date) : null;
        if (
            purchaseDate &&
            purchaseDate.getMonth()    === selectedMonth &&
            purchaseDate.getFullYear() === selectedYear
        ) {
            const catId = (purchase.categories as unknown as Category)?.id;
            if (catId) {
                spentByCategory[catId] =
                    (spentByCategory[catId] ?? 0) + ((purchase.amount ?? 0) + (purchase.taxes ?? 0));
            }
        }
    });

    // Core budget rows with carryover folded in
    const budgetsWithSpent: BudgetWithSpent[] = (budgets ?? []).map((b) => {
        const carryover        = carryoverByCategory[b.category_id] ?? 0;
        const effective_amount = b.amount + carryover;
        const spent            = spentByCategory[b.category_id] ?? 0;
        const remaining        = effective_amount - spent;
        const percentage       = effective_amount > 0 ? (spent / effective_amount) * 100 : 0;
        return {
            ...b,
            spent,
            remaining,
            percentage,
            carryover,
            effective_amount,
        } as unknown as BudgetWithSpent;
    });

    // Carryover-only rows: categories with an incoming carryover but no budget row
    // (happens when 'other_category' disposition targets a category with no base budget)
    const budgetedCategoryIds = new Set(budgetsWithSpent.map((b) => b.category_id));
    const carryoverOnlyRows: BudgetWithSpent[] = Object.entries(carryoverByCategory)
        .filter(([catId]) => !budgetedCategoryIds.has(Number(catId)))
        .map(([catId, delta]) => {
            const category  = (categories ?? []).find((c) => c.id === Number(catId));
            const spent     = spentByCategory[Number(catId)] ?? 0;
            const remaining = delta - spent;
            const percentage = delta > 0 ? (spent / delta) * 100 : 0;
            return {
                id:               0,
                user_id:          "",
                category_id:      Number(catId),
                categories:       category,
                amount:           0,
                month:            selectedMonth,
                year:             selectedYear,
                created_at:       new Date(),
                spent,
                remaining,
                percentage,
                carryover:        delta,
                effective_amount: delta,
            } as unknown as BudgetWithSpent;
        });

    const allBudgets     = [...budgetsWithSpent, ...carryoverOnlyRows];
    const totalBase      = budgetsWithSpent.reduce((s, b) => s + b.amount, 0);
    const totalEffective = allBudgets.reduce((s, b) => s + b.effective_amount, 0);
    const totalSpent     = allBudgets.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalEffective - totalSpent;

    return (
        <>
            <SidebarNav activeMenu="budget" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-4 lg:mb-6">
                        Budget
                    </h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <ExpectedIncomeCard expectedIncome={expectedIncome} />

                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-1">
                                Total Budgeted
                            </h3>
                            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
                                ${totalEffective.toFixed(2)}
                            </p>
                            {totalBase !== totalEffective && (
                                <p className="text-xs text-paynes-gray opacity-50 mt-0.5">
                                    Base ${totalBase.toFixed(2)}
                                </p>
                            )}
                        </div>
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
                                Total Spent
                            </h3>
                            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">
                                ${totalSpent.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
                                Remaining
                            </h3>
                            <p className={`text-xl lg:text-2xl font-semibold ${
                                totalRemaining >= 0 ? "text-columbia-blue" : "text-bittersweet"
                            }`}>
                                ${totalRemaining.toFixed(2)}
                            </p>
                        </div>

                        {(() => {
                            const unallocated = unallocatedFromExpected(
                                expectedIncome?.amount ?? null,
                                totalEffective
                            );
                            if (unallocated == null) return null;
                            return (
                                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
                                        Unallocated
                                    </h3>
                                    <p className={`text-xl lg:text-2xl font-semibold ${
                                        unallocated >= 0 ? "text-glaucous" : "text-bittersweet"
                                    }`}>
                                        {unallocated >= 0
                                            ? `$${unallocated.toFixed(2)}`
                                            : `-$${Math.abs(unallocated).toFixed(2)}`}
                                    </p>
                                    <p className="text-xs text-paynes-gray opacity-50 mt-0.5">
                                        {unallocated >= 0 ? "Available to allocate" : "Over budgeted"}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>

                    <BudgetManager
                        budgets={allBudgets}
                        categories={categories ?? []}
                        savingsAccounts={savingsAccounts ?? []}
                        currentMonth={todayMonth}
                        currentYear={todayYear}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        unsettledMonth={unsettledMonth}
                        settlementRows={settlementRows}
                    />
                </div>
            </div>
        </>
    );
}