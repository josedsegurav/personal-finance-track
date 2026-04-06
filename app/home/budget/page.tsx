import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import BudgetManager from "@/components/budget/budgetManager";
import { getBudgets, getCategories, getPurchases, getUser } from "@/hooks/supabaseQueries";
import { BudgetWithSpent, Category } from "@/app/types";

export default async function BudgetPage() {
    const supabase = await createClient();
    await getUser(supabase);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const [budgets, categories, purchases] = await Promise.all([
        getBudgets(supabase, currentMonth, currentYear),
        getCategories(supabase),
        getPurchases(supabase),
    ]);

    // Compute spent per category for the current month/year
    const spentByCategory: Record<number, number> = {};
    purchases?.forEach((purchase) => {
        const purchaseDate = purchase.expenses?.[0]?.expense_date
            ? new Date(purchase.expenses[0].expense_date)
            : null;
        if (
            purchaseDate &&
            purchaseDate.getMonth() === currentMonth &&
            purchaseDate.getFullYear() === currentYear
        ) {
            const catId = (purchase.categories as unknown as Category)?.id;
            if (catId) {
                spentByCategory[catId] = (spentByCategory[catId] || 0) + (purchase.amount + purchase.taxes);
            }
        }
    });

    const budgetsWithSpent: BudgetWithSpent[] = (budgets ?? [])
        .filter((b) => b.month === currentMonth && b.year === currentYear)
        .map((b) => {
            const spent = spentByCategory[b.category_id] || 0;
            const remaining = b.amount - spent;
            const percentage = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
            return { ...b, spent, remaining, percentage } as unknown as BudgetWithSpent;
        });

    const totalBudgeted = budgetsWithSpent.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;

    return (
        <>
            <SidebarNav activeMenu="budget" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-4 lg:mb-6">
                        Budget
                    </h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">Total Budgeted</h3>
                            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">${totalBudgeted.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">Total Spent</h3>
                            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">Remaining</h3>
                            <p className={`text-xl lg:text-2xl font-semibold ${totalRemaining >= 0 ? "text-columbia-blue" : "text-bittersweet"}`}>
                                ${totalRemaining.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <BudgetManager
                        budgets={budgetsWithSpent}
                        categories={categories ?? []}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </div>
            </div>
        </>
    );
}