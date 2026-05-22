"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet, SheetClose, SheetContent, SheetDescription,
    SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { upsertBudget, deleteBudget, copyBudgetsFromPreviousMonth } from "@/app/home/budget/actions";
import { BudgetWithSpent, Category, SavingsAccount, SettlementRow } from "@/app/types";
import SettlementBanner from "@/components/budget/SettlementBanner";
import SettlementSheet from "@/components/budget/SettlementSheet";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface Props {
    budgets: BudgetWithSpent[];
    categories: Category[];
    savingsAccounts: SavingsAccount[];
    currentMonth: number;
    currentYear: number;
    selectedMonth: number;
    selectedYear: number;
    unsettledMonth: { month: number; year: number } | null;
    settlementRows: SettlementRow[];
}

// Temperature color scale: deep crimson → rose → neutral → light blue → electric blue
// ratio = carryover / base_amount, clamped to [-1, 1]
function carryoverBadgeClasses(carryover: number, base: number): string {
    if (carryover === 0) return "";
    const ratio = base !== 0
        ? Math.max(-1, Math.min(1, carryover / base))
        : carryover > 0 ? 1 : -1;

    if (ratio < -0.5) return "bg-red-800 text-white";
    if (ratio < -0.25) return "bg-red-500 text-white";
    if (ratio < -0.05) return "bg-rose-400 text-white";
    if (ratio < 0) return "bg-rose-200 text-rose-800";
    if (ratio < 0.05) return "bg-sky-100 text-sky-700";
    if (ratio < 0.25) return "bg-sky-300 text-sky-900";
    if (ratio < 0.5) return "bg-blue-400 text-white";
    return "bg-blue-600 text-white";
}

export default function BudgetManager({
    budgets,
    categories,
    savingsAccounts,
    currentMonth,
    currentYear,
    selectedMonth,
    selectedYear,
    unsettledMonth,
    settlementRows,
}: Props) {
    const router = useRouter();
    const [isCopying, startCopyTransition] = useTransition();
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [amount, setAmount] = useState("");

    // ── Month navigation ──────────────────────────────────────────────────────
    function navigateTo(month: number, year: number) {
        router.push(`/home/budget?month=${month}&year=${year}`);
    }
    function goPrev() {
        navigateTo(
            selectedMonth === 0 ? 11 : selectedMonth - 1,
            selectedMonth === 0 ? selectedYear - 1 : selectedYear,
        );
    }
    function goNext() {
        navigateTo(
            selectedMonth === 11 ? 0 : selectedMonth + 1,
            selectedMonth === 11 ? selectedYear + 1 : selectedYear,
        );
    }

    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const isPastMonth =
        selectedYear < currentYear ||
        (selectedYear === currentYear && selectedMonth < currentMonth);

    // ── Settlement target month ───────────────────────────────────────────────
    const settlementToMonth = unsettledMonth
        ? (unsettledMonth.month === 11 ? 0 : unsettledMonth.month + 1)
        : currentMonth;
    const settlementToYear = unsettledMonth
        ? (unsettledMonth.month === 11 ? unsettledMonth.year + 1 : unsettledMonth.year)
        : currentYear;

    // ── Category availability for Add Budget sheet ────────────────────────────
    // Exclude carryover-only phantom rows (id === 0) from blocking the add dropdown
    const baseBudgetCategoryIds = new Set(
        budgets.filter((b) => b.id !== 0).map((b) => b.category_id)
    );
    const availableCategories = categories.filter((c) => !baseBudgetCategoryIds.has(c.id));

    // ── Copy from previous month ──────────────────────────────────────────────
    function handleCopyPrevious() {
        startCopyTransition(async () => {
            await copyBudgetsFromPreviousMonth(selectedMonth, selectedYear);
        });
    }

    const showBanner = !!unsettledMonth && !bannerDismissed;
    const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

    return (
        <div className="space-y-6">

            {/* ── Month navigation ── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goPrev}
                    className="text-sm text-paynes-gray opacity-50 hover:opacity-100 transition-opacity px-2 py-1"
                >
                    ← {MONTH_NAMES[prevMonth]} {prevYear}
                </button>
                <h2 className="text-base font-semibold text-paynes-gray">
                    {MONTH_NAMES[selectedMonth]} {selectedYear}
                    {isCurrentMonth && (
                        <span className="ml-2 text-xs font-normal opacity-40">current</span>
                    )}
                </h2>
                <button
                    onClick={goNext}
                    className="text-sm text-paynes-gray opacity-50 hover:opacity-100 transition-opacity px-2 py-1"
                >
                    {MONTH_NAMES[nextMonth]} {nextYear} →
                </button>
            </div>

            {/* ── Settlement banner ── */}
            {showBanner && unsettledMonth && (
                <SettlementBanner
                    fromMonth={unsettledMonth.month}
                    fromYear={unsettledMonth.year}
                    onReview={() => setSettlementOpen(true)}
                    onDismiss={() => setBannerDismissed(true)}
                />
            )}

            {/* ── Add Budget sheet trigger ── */}
            {!isPastMonth && (
                <div className="flex justify-end">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">+ Add Budget</Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                                <SheetTitle>Set Category Budget</SheetTitle>
                                <SheetDescription>
                                    Allocate a spending limit for a category in{" "}
                                    {MONTH_NAMES[selectedMonth]} {selectedYear}.
                                </SheetDescription>
                            </SheetHeader>
                            <form action={upsertBudget} className="grid gap-4 py-4">
                                <input type="hidden" name="month" value={selectedMonth} />
                                <input type="hidden" name="year" value={selectedYear} />
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Category</Label>
                                    <select
                                        name="category_id"
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        className="col-span-3 px-4 py-2 border border-gray-200 rounded-lg"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {availableCategories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.category_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Amount ($)</Label>
                                    <Input
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button type="submit">Save Budget</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            )}

            {budgets.filter((b) => b.id !== 0).length === 0 ? (
                <div className="text-center py-12 space-y-3">
                    <p className="text-paynes-gray opacity-60">
                        No budgets set for {MONTH_NAMES[selectedMonth]} {selectedYear}.
                    </p>
                    {!isPastMonth && (
                        <>
                            <p className="text-sm text-paynes-gray opacity-40">
                                Copy base amounts from {MONTH_NAMES[prevMonth]} {prevYear} as a starting point,
                                or add them individually above.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPrevious}
                                disabled={isCopying}
                            >
                                {isCopying ? "Copying…" : `Copy from ${MONTH_NAMES[prevMonth]}`}
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => {
                        const categoryName =
                            (budget.categories as unknown as Category)?.category_name
                            ?? `Category ${budget.category_id}`;
                        const isCarryoverOnly = budget.id === 0;
                        const hasCarryover = budget.carryover !== 0;
                        const badgeClasses = carryoverBadgeClasses(budget.carryover, budget.amount);

                        return (
                            <div
                                key={`${budget.category_id}-${budget.id}`}
                                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-paynes-gray">{categoryName}</h3>
                                    {!isCarryoverOnly && !isPastMonth && (
                                        <button
                                            onClick={() => deleteBudget(budget.id)}
                                            className="text-xs text-gray-400 hover:text-bittersweet transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* Tier 1 — effective amount (primary) */}
                                <div>
                                    <p className="text-2xl font-semibold text-paynes-gray">
                                        ${budget.effective_amount.toFixed(2)}
                                    </p>

                                    {/* Tier 2 — base amount + Tier 3 — carryover badge */}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {!isCarryoverOnly && (
                                            <p className="text-xs text-paynes-gray opacity-50">
                                                Base ${budget.amount.toFixed(2)}
                                            </p>
                                        )}
                                        {hasCarryover && (
                                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badgeClasses}`}>
                                                {budget.carryover > 0 ? "+" : ""}
                                                ${budget.carryover.toFixed(2)} carried
                                            </span>
                                        )}
                                        {isCarryoverOnly && !hasCarryover && (
                                            <span className="text-xs text-paynes-gray opacity-40">
                                                carryover only
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${budget.percentage >= 100 ? "bg-bittersweet" :
                                            budget.percentage >= 80 ? "bg-yellow-400" :
                                                "bg-columbia-blue"
                                            }`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    />
                                </div>

                                {/* Spent / remaining */}
                                <div className="flex justify-between text-xs text-paynes-gray opacity-70">
                                    <span>${budget.spent.toFixed(2)} spent</span>
                                    <span>{budget.percentage.toFixed(0)}% used</span>
                                </div>

                                <p className={`text-sm font-medium ${budget.remaining >= 0 ? "text-columbia-blue" : "text-bittersweet"
                                    }`}>
                                    {budget.remaining >= 0
                                        ? `$${budget.remaining.toFixed(2)} remaining`
                                        : `$${Math.abs(budget.remaining).toFixed(2)} over budget`}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Settlement sheet ── */}
            {unsettledMonth && (
                <SettlementSheet
                    key={`${unsettledMonth.month}-${unsettledMonth.year}`}
                    open={settlementOpen}
                    onOpenChange={setSettlementOpen}
                    fromMonth={unsettledMonth.month}
                    fromYear={unsettledMonth.year}
                    toMonth={settlementToMonth}
                    toYear={settlementToYear}
                    settlementRows={settlementRows}
                    categories={categories}
                    savingsAccounts={savingsAccounts}
                />
            )}
        </div>
    );
}