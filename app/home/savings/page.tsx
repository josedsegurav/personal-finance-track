import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import SavingsManager from "@/components/savings/savingsManager";
import {
    getUser,
    getIncome,
    getExpense,
    getSavingsAccounts,
    getSavingsPlans,
    getAllTimeSavingsContributions,
} from "@/hooks/supabaseQueries";
import { SavingsAccountWithPlan, SavingsPlan } from "@/app/types";

export default async function SavingsPage() {
    const supabase = await createClient();
    await getUser(supabase);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const [income, expenses, accounts, plans, allTimeContribs] = await Promise.all([
        getIncome(supabase),
        getExpense(supabase),
        getSavingsAccounts(supabase),
        getSavingsPlans(supabase, currentMonth, currentYear),
        getAllTimeSavingsContributions(supabase),
    ]);

    // ── Balance formula ──────────────────────────────────────────────────────
    const monthlyIncome = (income ?? [])
        .filter(i =>
            new Date(i.income_date).getMonth() === currentMonth &&
            new Date(i.income_date).getFullYear() === currentYear
        )
        .reduce((s, i) => s + parseFloat(i.net_income), 0);

    const monthlyExpenses = (expenses ?? [])
        .filter(e =>
            new Date(e.expense_date).getMonth() === currentMonth &&
            new Date(e.expense_date).getFullYear() === currentYear
        )
        .reduce((s, e) => s + parseFloat(e.total_expense), 0);

    const totalPlanned = (plans ?? [])
        .reduce((s, p) => s + p.planned_amount, 0);

    // Raw balance after expenses, before savings plans
    const rawBalance = monthlyIncome - monthlyExpenses;

    // Available = what's left after all savings plans are reserved
    const available = rawBalance - totalPlanned;

    // ── All-time saved per account ────────────────────────────────────────────
    const allTimeSavedByAccount: Record<number, number> = {};
    (allTimeContribs ?? []).forEach(c => {
        const accountId = (c.savings_plans as unknown as SavingsPlan)?.savings_account_id;
        if (accountId != null) {
            allTimeSavedByAccount[accountId] = (allTimeSavedByAccount[accountId] || 0) + c.amount;
        }
    });

    // ── Enrich accounts with this month's plan + contributions ───────────────
    const accountsWithPlan: SavingsAccountWithPlan[] = (accounts ?? []).map(account => {
        const plan = (plans ?? []).find(p => p.savings_account_id === account.id) ?? null;
        const contributions = plan ? (plan.savings_contributions ?? []) : [];
        const plannedAmount = plan?.planned_amount ?? 0;
        const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);
        const allTimeSaved = allTimeSavedByAccount[account.id] ?? 0;
        const goal = account.goal_amount;
        const progressPercent = goal && goal > 0
            ? Math.min((allTimeSaved / goal) * 100, 100)
            : 0;

        return {
            ...account,
            plan,
            contributions,
            plannedAmount,
            totalContributed,
            remaining: plannedAmount - totalContributed,
            allTimeSaved,
            progressPercent,
        } as SavingsAccountWithPlan;
    });

    const currentMonthLabel = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <>
            <SidebarNav activeMenu="savings" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-1">
                        Savings
                    </h1>
                    <p className="text-sm text-paynes-gray opacity-60 mb-6">
                        {currentMonthLabel}
                    </p>

                    {/* ── Balance summary cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xs font-medium text-paynes-gray opacity-70 mb-2">
                                Monthly Income
                            </h3>
                            <p className="text-xl font-semibold text-green-500">
                                ${monthlyIncome.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xs font-medium text-paynes-gray opacity-70 mb-2">
                                Expenses
                            </h3>
                            <p className="text-xl font-semibold text-bittersweet">
                                ${monthlyExpenses.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xs font-medium text-paynes-gray opacity-70 mb-2">
                                Planned Savings
                            </h3>
                            <p className="text-xl font-semibold text-columbia-blue">
                                ${totalPlanned.toFixed(2)}
                            </p>
                        </div>

                        <div className={`p-4 lg:p-6 rounded-lg shadow-sm border ${
                            available >= 0
                                ? "bg-white border-gray-100"
                                : "bg-bittersweet bg-opacity-5 border-bittersweet border-opacity-30"
                        }`}>
                            <h3 className="text-xs font-medium text-paynes-gray opacity-70 mb-2">
                                Available
                            </h3>
                            <p className={`text-xl font-semibold ${
                                available >= 0 ? "text-paynes-gray" : "text-bittersweet"
                            }`}>
                                ${available.toFixed(2)}
                            </p>
                            <p className="text-xs text-paynes-gray opacity-50 mt-1">
                                {available < 0 ? "Over-allocated — adjust plans below" : "Unallocated"}
                            </p>
                        </div>
                    </div>

                    <SavingsManager
                        accounts={accountsWithPlan}
                        available={available}
                        rawBalance={rawBalance}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </div>
            </div>
        </>
    );
}