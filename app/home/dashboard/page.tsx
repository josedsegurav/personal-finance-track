import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import ChatBot from "@/components/chatbot/chatBot";
import Transactions from "@/components/dashboard/transactions";
import TrendChart from "@/components/dashboard/TrendChart";
import CategoryDonut from "@/components/dashboard/CategoryDonut";
import BudgetStrip from "@/components/dashboard/BudgetStrip";
import SavingsSnapshot from "@/components/dashboard/SavingsSnapshot";
import {
    getIncome,
    getExpense,
    getPurchases,
    getUser,
    getSavingsAccounts,
    getSavingsPlans,
    getSavingsAllPlans,
    getAllTimeSavingsContributions,
    getBudgets,
    getCategories,
    getStores,
} from "@/hooks/supabaseQueries";
import Link from "next/link";
import { Budget, Category, Expense, Income, SavingsPlan } from "@/app/types";
import { redirect } from "next/navigation";

export default async function Page() {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const demoAccount = user.email === "lacimaonline@gmail.com";

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear  = currentDate.getFullYear();

    // ── Fetch all data in parallel ──────────────────────────────────────────
    const [
        income,
        expenses,
        purchases,
        savingsAccounts,
        allTimeContribs,
        savingsPlansThisMonth,
        allSavingsPlans,
        budgets,
        categories,
        stores,
    ] = await Promise.all([
        getIncome(supabase),
        getExpense(supabase),
        getPurchases(supabase),
        getSavingsAccounts(supabase),
        getAllTimeSavingsContributions(supabase),
        getSavingsPlans(supabase, currentMonth, currentYear),
        getSavingsAllPlans(supabase),
        getBudgets(supabase, currentMonth, currentYear),
        getCategories(supabase),
        getStores(supabase),
    ]);

    if (categories.length === 0 || stores.length === 0) {
        redirect("/home/onboarding");
    }

    // ── Helper: filter records to a given month/year ─────────────────────────
    // Parse date strings as local time by splitting on "T" and using the
    // YYYY-MM-DD parts directly — avoids UTC-offset bugs where e.g.
    // "2026-04-01" becomes March 31 at UTC-5.
    function parseLocalDate(dateStr: string): Date {
        const [datePart] = dateStr.split("T");
        const [y, m, d] = datePart.split("-").map(Number);
        return new Date(y, m - 1, d);
    }

    function forMonth(arr: Income[] | Expense[], dateKey: string, m: number, y: number) {
        return (arr ?? []).filter(item => {
            const raw = (item as unknown as Record<string, string>)[dateKey];
            if (!raw) return false;
            const d = parseLocalDate(raw);
            return d.getMonth() === m && d.getFullYear() === y;
        });
    }

    // ── Current month totals ─────────────────────────────────────────────────
    const monthIncome = forMonth(income ?? [], "income_date", currentMonth, currentYear)
        .reduce((s, i) => s + parseFloat((i as unknown as Income).net_income as unknown as string), 0);

    const monthExpenses = forMonth(expenses ?? [], "expense_date", currentMonth, currentYear)
        .reduce((s, e) => s + parseFloat((e as unknown as Expense).total_expense), 0);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear  = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevIncome   = forMonth(income   ?? [], "income_date",  prevMonth, prevYear).reduce((s, i) => s + parseFloat((i as unknown as Income).net_income as unknown as string),    0);
    const prevExpenses = forMonth(expenses ?? [], "expense_date", prevMonth, prevYear).reduce((s, e) => s + parseFloat((e as unknown as Expense).total_expense as unknown as string),  0);

    const balance     = monthIncome - monthExpenses;
    const incomeDiff  = prevIncome   > 0 ? ((monthIncome   - prevIncome)   / prevIncome)   * 100 : 0;
    const expenseDiff = prevExpenses > 0 ? ((monthExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    // ── Savings ──────────────────────────────────────────────────────────────
    const totalSavedAllTime = (allTimeContribs ?? []).reduce((s, c) => s + c.amount, 0);
    const plannedSavingsThisMonth = (savingsPlansThisMonth ?? []).reduce((s, p) => s + p.planned_amount, 0);
    const savingsRate = monthIncome > 0 ? Math.round((plannedSavingsThisMonth / monthIncome) * 100) : 0;

    // ── Purchases this month (for budget + donut) ────────────────────────────
    // Note: the Supabase join returns `expenses` as a single object, not an array.
    const purchasesThisMonth = (purchases ?? []).filter(p => {
        const expense = p.expenses as unknown as { expense_date: string } | null;
        const dateStr = expense?.expense_date;
        if (!dateStr) return false;
        const d = parseLocalDate(dateStr);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const spentByCategoryId: Record<number, number> = {};
    purchasesThisMonth.forEach(p => {
        const catId = (p.categories as unknown as Category)?.id;
        if (catId != null) spentByCategoryId[catId] = (spentByCategoryId[catId] || 0) + p.amount + p.taxes;
    });

    // ── Budget health ────────────────────────────────────────────────────────
    const totalBudgeted    = (budgets as unknown as Budget[]).reduce((s, b) => s + b.amount, 0);
    const totalBudgetSpent = Object.values(spentByCategoryId).reduce((s, v) => s + v, 0);
    const budgetHealthPct  = totalBudgeted > 0 ? Math.min(Math.round((totalBudgetSpent / totalBudgeted) * 100), 100) : -1;

    // ── Budget strip rows ─────────────────────────────────────────────────────
    const budgetStripData = (budgets as unknown as Budget[]).map(b => {
        const catId = (b.categories as unknown as Category)?.id ?? b.category_id;
        const spent = spentByCategoryId[catId] ?? 0;
        return {
            category_name: (b.categories as unknown as Category)?.category_name ?? "Unknown",
            planned: b.amount as number,
            spent,
            percentage: b.amount > 0 ? Math.min((spent / b.amount) * 100, 150) : 0,
        };
    }).sort((a, b) => b.percentage - a.percentage);

    // ── Category donut ────────────────────────────────────────────────────────
    const DONUT_COLORS = ["#577399","#BDD5EA","#22c55e","#f59e0b","#a78bfa","#f97316","#14b8a6","#ec4899"];
    const catTotals: Record<string, number> = {};
    purchasesThisMonth.forEach(p => {
        const name = (p.categories as unknown as Category)?.category_name ?? "Uncategorized";
        catTotals[name] = (catTotals[name] || 0) + p.amount + p.taxes;
    });
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCats    = sortedCats.slice(0, 5);
    const otherTotal = sortedCats.slice(5).reduce((s, [, v]) => s + v, 0);
    const categoryData = [
        ...topCats.map(([name, value], i) => ({ name, value: parseFloat(value.toFixed(2)), fill: DONUT_COLORS[i] })),
        ...(otherTotal > 0 ? [{ name: "Other", value: parseFloat(otherTotal.toFixed(2)), fill: "#d1d5db" }] : []),
    ];
    const totalCategorySpend = categoryData.reduce((s, c) => s + c.value, 0);

    // ── 6-month trend ─────────────────────────────────────────────────────────
    const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trendData = Array.from({ length: 6 }, (_, idx) => {
        const offset = 5 - idx;
        const d = new Date(currentYear, currentMonth - offset, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        return {
            monthLabel: MONTHS_SHORT[m],
            income:   parseFloat(forMonth(income   ?? [], "income_date",  m, y).reduce((s, i) => s + parseFloat((i as unknown as Income).net_income as unknown as string),   0).toFixed(2)),
            expenses: parseFloat(forMonth(expenses ?? [], "expense_date", m, y).reduce((s, e) => s + parseFloat((e as unknown as Expense).total_expense as unknown as string), 0).toFixed(2)),
            savings:  parseFloat(((allSavingsPlans ?? []).filter(p => p.month === m && p.year === y).reduce((s, p) => s + p.planned_amount, 0)).toFixed(2)),
        };
    });

    // ── Savings snapshot ──────────────────────────────────────────────────────
    const allTimeSavedByAccount: Record<number, number> = {};
    (allTimeContribs ?? []).forEach(c => {
        const accId = (c.savings_plans as unknown as SavingsPlan)?.savings_account_id;
        if (accId != null) allTimeSavedByAccount[accId] = (allTimeSavedByAccount[accId] || 0) + c.amount;
    });
    const savingsSnapshotData = (savingsAccounts ?? []).slice(0, 4).map(acc => {
        const plan         = (savingsPlansThisMonth ?? []).find(p => p.savings_account_id === acc.id);
        const allTimeSaved = allTimeSavedByAccount[acc.id] ?? 0;
        return {
            id:               acc.id,
            name:             acc.name,
            color:            acc.color,
            plannedAmount:    plan?.planned_amount ?? 0,
            totalContributed: (plan?.savings_contributions ?? []).reduce((s, c) => s + c.amount, 0),
            allTimeSaved,
            goal_amount:      acc.goal_amount ?? null,
            progressPercent:  acc.goal_amount && acc.goal_amount > 0 ? Math.min((allTimeSaved / acc.goal_amount) * 100, 100) : 0,
        };
    });

    return (
        <>
            <SidebarNav activeMenu="dashboard" />
            <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
                <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-6">Dashboard</h1>

                {/* ── Summary Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">

                    {/* Income */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Income</span>
                            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-paynes-gray">${monthIncome.toFixed(2)}</p>
                        <p className={`text-xs mt-1 font-medium ${incomeDiff >= 0 ? "text-green-500" : "text-bittersweet"}`}>
                            {incomeDiff >= 0 ? "▲" : "▼"} {Math.abs(incomeDiff).toFixed(0)}% vs last month
                        </p>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Expenses</span>
                            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-bittersweet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-paynes-gray">${monthExpenses.toFixed(2)}</p>
                        <p className={`text-xs mt-1 font-medium ${expenseDiff <= 0 ? "text-green-500" : "text-bittersweet"}`}>
                            {expenseDiff >= 0 ? "▲" : "▼"} {Math.abs(expenseDiff).toFixed(0)}% vs last month
                        </p>
                    </div>

                    {/* Balance */}
                    <div className={`p-4 lg:p-5 rounded-xl shadow-sm border ${balance >= 0 ? "bg-white border-gray-100" : "bg-red-50 border-red-100"}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Balance</span>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${balance >= 0 ? "bg-blue-50" : "bg-red-100"}`}>
                                <svg className={`w-3.5 h-3.5 ${balance >= 0 ? "text-glaucous" : "text-bittersweet"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className={`text-lg lg:text-xl font-bold ${balance >= 0 ? "text-paynes-gray" : "text-bittersweet"}`}>
                            ${balance.toFixed(2)}
                        </p>
                        <p className={`text-xs mt-1 font-medium ${balance >= 0 ? "text-glaucous" : "text-bittersweet"}`}>
                            {balance >= 0 ? "Positive" : "Negative"} balance
                        </p>
                    </div>

                    {/* Total Saved */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Saved</span>
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-glaucous" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-paynes-gray">${totalSavedAllTime.toFixed(2)}</p>
                        <p className="text-xs mt-1 font-medium text-glaucous">
                            {savingsAccounts?.length ?? 0} active goal{(savingsAccounts?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Savings Rate */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Savings Rate</span>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${savingsRate >= 20 ? "bg-green-50" : savingsRate >= 10 ? "bg-yellow-50" : "bg-red-50"}`}>
                                <svg className={`w-3.5 h-3.5 ${savingsRate >= 20 ? "text-green-500" : savingsRate >= 10 ? "text-yellow-500" : "text-bittersweet"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <p className={`text-lg lg:text-xl font-bold ${savingsRate >= 20 ? "text-green-500" : savingsRate >= 10 ? "text-yellow-500" : plannedSavingsThisMonth === 0 ? "text-paynes-gray opacity-40" : "text-bittersweet"}`}>
                            {plannedSavingsThisMonth === 0 ? "—" : `${savingsRate}%`}
                        </p>
                        <p className="text-xs mt-1 text-paynes-gray opacity-50">
                            {savingsRate >= 20 ? "Excellent" : savingsRate >= 10 ? "On track" : plannedSavingsThisMonth === 0 ? "No plan set" : "Below 10%"}
                        </p>
                    </div>

                    {/* Budget Health */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-paynes-gray opacity-60 uppercase tracking-wide">Budget</span>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${budgetHealthPct < 0 ? "bg-gray-50" : budgetHealthPct >= 90 ? "bg-red-50" : "bg-green-50"}`}>
                                <svg className={`w-3.5 h-3.5 ${budgetHealthPct < 0 ? "text-gray-400" : budgetHealthPct >= 90 ? "text-bittersweet" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        {budgetHealthPct < 0 ? (
                            <>
                                <p className="text-lg lg:text-xl font-bold text-paynes-gray opacity-40">—</p>
                                <Link href="/home/budget" className="text-xs mt-1 text-columbia-blue hover:opacity-70 block">
                                    Set a budget →
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className={`text-lg lg:text-xl font-bold ${budgetHealthPct >= 90 ? "text-bittersweet" : "text-paynes-gray"}`}>
                                    {budgetHealthPct}%
                                </p>
                                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full ${budgetHealthPct >= 90 ? "bg-bittersweet" : budgetHealthPct >= 70 ? "bg-yellow-400" : "bg-green-400"}`}
                                        style={{ width: `${budgetHealthPct}%` }}
                                    />
                                </div>
                                <p className="text-xs mt-1 text-paynes-gray opacity-50">
                                    ${totalBudgetSpent.toFixed(0)} of ${totalBudgeted.toFixed(0)}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Charts row ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                    <div className="lg:col-span-3">
                        <TrendChart trendData={trendData} />
                    </div>
                    <div className="lg:col-span-2">
                        <CategoryDonut categoryData={categoryData} totalSpent={totalCategorySpend} />
                    </div>
                </div>

                {/* ── Budget strip + Savings snapshot ────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <BudgetStrip budgets={budgetStripData} />
                    <SavingsSnapshot accounts={savingsSnapshotData} totalCount={savingsAccounts?.length ?? 0} />
                </div>

                {/* ── Recent Transactions ─────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <Transactions
                        totalExpenses={monthExpenses}
                        totalNetIncome={monthIncome}
                        income={income}
                        expenses={expenses}
                    />
                </div>
            </div>
            <ChatBot account={demoAccount} data={[income, expenses]} />
        </>
    );
}