"use client";

import { useEffect, useState } from "react";
import Chart from "./chart";

function formatDayLabel(dateStr) {
    // Append T00:00:00 to prevent UTC timezone shifting the day
    const date = new Date(dateStr + "T00:00:00");
    const today     = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString())     return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function Transactions({ totalExpenses, totalNetIncome, income, expenses }) {
    const [groupedByDate, setGroupedByDate] = useState({});
    const [sortedDates,   setSortedDates]   = useState([]);

    useEffect(() => {
        const incomeRows = (income ?? []).map(i => ({
            id:          "income-" + i.id,
            date:        i.income_date,
            description: i.description,
            type:        "income",
            amount:      parseFloat(i.net_income),
        }));

        const expenseRows = (expenses ?? []).map(e => ({
            id:          "expense-" + e.id,
            date:        e.expense_date,
            description: e.description,
            type:        "expense",
            amount:      parseFloat(e.total_expense),
        }));

        // Take last 30 combined, sorted newest first
        const all = [...incomeRows, ...expenseRows]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 30);

        // Group by date string
        const groups = {};
        all.forEach(t => {
            const day = t.date.slice(0, 10); // "YYYY-MM-DD"
            if (!groups[day]) groups[day] = [];
            groups[day].push(t);
        });

        const dates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        setGroupedByDate(groups);
        setSortedDates(dates);
    }, [income, expenses]);

    const isEmpty = sortedDates.length === 0;

    return (
        <>
            {/* Chart */}
            <Chart totalExpenses={totalExpenses} totalNetIncome={totalNetIncome} />

            {/* Transactions grouped by day */}
            <div className="p-4 lg:p-6">
                <h2 className="text-base font-semibold text-paynes-gray mb-4">Recent Transactions</h2>

                {isEmpty ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-paynes-gray">No transactions yet</p>
                        <p className="text-xs text-paynes-gray opacity-50 mt-1">Your recent activity will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {sortedDates.map(dateKey => (
                            <div key={dateKey}>
                                {/* Day heading */}
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-semibold text-paynes-gray opacity-50 uppercase tracking-wide">
                                        {formatDayLabel(dateKey)}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                    <span className="text-xs text-paynes-gray opacity-40">
                                        {new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>

                                {/* Transactions for this day */}
                                <div className="space-y-2">
                                    {groupedByDate[dateKey].map(t => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Type icon */}
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    t.type === "income" ? "bg-green-50" : "bg-red-50"
                                                }`}>
                                                    {t.type === "income" ? (
                                                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5 text-bittersweet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-paynes-gray truncate">{t.description}</p>
                                                    <span className={`text-xs font-medium ${t.type === "income" ? "text-green-500" : "text-bittersweet"}`}>
                                                        {t.type === "income" ? "Income" : "Expense"}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold flex-shrink-0 ml-4 ${
                                                t.type === "income" ? "text-green-500" : "text-bittersweet"
                                            }`}>
                                                {t.type === "income" ? "+" : "−"}${t.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}