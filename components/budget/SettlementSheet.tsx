"use client";

import { useState, useTransition } from "react";
import {
    Sheet, SheetContent, SheetDescription,
    SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { settlePreviousMonth } from "@/app/home/budget/actions";
import type {
    CarryoverDispositionEntry,
    CarryoverDisposition,
    Category,
    SavingsAccount,
    SettlementRow,
} from "@/app/types";

interface Props {
    open:           boolean;
    onOpenChange:   (open: boolean) => void;
    fromMonth:      number;
    fromYear:       number;
    toMonth:        number;
    toYear:         number;
    settlementRows: SettlementRow[];
    categories:     Category[];
    savingsAccounts: SavingsAccount[];
}

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

// Temperature color scale: deep crimson → rose → neutral → light blue → electric blue
// ratio = delta / effective_amount, clamped to [-1, 1]
function carryoverColorClasses(delta: number, effective: number): string {
    if (effective === 0 && delta === 0) return "bg-gray-100 text-gray-500";
    const ratio = effective !== 0
        ? Math.max(-1, Math.min(1, delta / effective))
        : delta > 0 ? 1 : -1;

    if (ratio < -0.5)  return "bg-red-800 text-white";
    if (ratio < -0.25) return "bg-red-500 text-white";
    if (ratio < -0.05) return "bg-rose-400 text-white";
    if (ratio < 0)     return "bg-rose-200 text-rose-800";
    if (ratio === 0)   return "bg-gray-100 text-gray-500";
    if (ratio < 0.05)  return "bg-sky-100 text-sky-700";
    if (ratio < 0.25)  return "bg-sky-300 text-sky-900";
    if (ratio < 0.5)   return "bg-blue-400 text-white";
    return "bg-blue-600 text-white";
}

function buildInitialDispositions(
    rows: SettlementRow[]
): Record<number, CarryoverDispositionEntry> {
    const map: Record<number, CarryoverDispositionEntry> = {};
    rows.forEach((row) => {
        map[row.category_id] = {
            category_id:               row.category_id,
            delta_amount:              row.delta,
            disposition:               "same_category",
            target_category_id:        null,
            target_savings_account_id: null,
        };
    });
    return map;
}

export default function SettlementSheet({
    open, onOpenChange,
    fromMonth, fromYear,
    toMonth, toYear,
    settlementRows,
    categories,
    savingsAccounts,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [dispositions, setDispositions] = useState<Record<number, CarryoverDispositionEntry>>(
        () => buildInitialDispositions(settlementRows)
    );

    function updateDisposition(categoryId: number, patch: Partial<CarryoverDispositionEntry>) {
        setDispositions((prev) => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], ...patch },
        }));
    }

    function handleConfirm() {
        startTransition(async () => {
            await settlePreviousMonth(
                Object.values(dispositions),
                fromMonth,
                fromYear,
                toMonth,
                toYear,
            );
            onOpenChange(false);
        });
    }

    const totalSurplus = settlementRows
        .filter((r) => r.delta > 0)
        .reduce((s, r) => s + r.delta, 0);
    const totalOverage = settlementRows
        .filter((r) => r.delta < 0)
        .reduce((s, r) => s + r.delta, 0);

    // Validate: 'other_category' rows must have a target selected
    const isValid = Object.values(dispositions).every((d) => {
        if (d.disposition === "other_category") return d.target_category_id != null;
        if (d.disposition === "savings")        return d.target_savings_account_id != null;
        return true;
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle>
                        Settle {MONTH_NAMES[fromMonth]} {fromYear}
                    </SheetTitle>
                    <SheetDescription>
                        Review each category`&apos;`s budget difference and choose what to do with it.
                        These adjustments will carry into {MONTH_NAMES[toMonth]} {toYear}.
                    </SheetDescription>
                </SheetHeader>

                {/* Totals summary */}
                {(totalSurplus > 0 || totalOverage < 0) && (
                    <div className="flex gap-3 mb-5">
                        {totalSurplus > 0 && (
                            <div className="flex-1 rounded-lg bg-sky-50 border border-sky-100 p-3 text-center">
                                <p className="text-xs text-sky-600 font-medium mb-0.5">Total Surplus</p>
                                <p className="text-lg font-semibold text-sky-700">
                                    +${totalSurplus.toFixed(2)}
                                </p>
                            </div>
                        )}
                        {totalOverage < 0 && (
                            <div className="flex-1 rounded-lg bg-rose-50 border border-rose-100 p-3 text-center">
                                <p className="text-xs text-rose-600 font-medium mb-0.5">Total Overage</p>
                                <p className="text-lg font-semibold text-rose-700">
                                    ${totalOverage.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Per-category rows */}
                <div className="space-y-3 mb-6">
                    {settlementRows.map((row) => {
                        const entry      = dispositions[row.category_id];
                        const colorCls   = carryoverColorClasses(row.delta, row.effective_amount);
                        const isNegative = row.delta < 0;

                        return (
                            <div
                                key={row.category_id}
                                className="rounded-lg border border-gray-100 bg-white p-4 space-y-3"
                            >
                                {/* Category name + delta badge */}
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-paynes-gray text-sm">
                                        {row.category_name}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls}`}>
                                        {row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)}
                                    </span>
                                </div>

                                {/* Spent / effective summary */}
                                <div className="flex gap-4 text-xs text-paynes-gray opacity-60">
                                    <span>Spent ${row.spent.toFixed(2)}</span>
                                    <span>Budget ${row.effective_amount.toFixed(2)}</span>
                                    {row.base_amount !== row.effective_amount && (
                                        <span>Base ${row.base_amount.toFixed(2)}</span>
                                    )}
                                </div>

                                {/* Disposition selector */}
                                <div className="space-y-2">
                                    <p className="text-xs text-paynes-gray opacity-70 font-medium">
                                        Apply difference to
                                    </p>
                                    <select
                                        value={entry?.disposition ?? "same_category"}
                                        onChange={(e) =>
                                            updateDisposition(row.category_id, {
                                                disposition:               e.target.value as CarryoverDisposition,
                                                target_category_id:        null,
                                                target_savings_account_id: null,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-paynes-gray focus:outline-none focus:ring-2 focus:ring-columbia-blue/30"
                                    >
                                        <option value="same_category">Same category next month</option>
                                        {!isNegative && (
                                            <option value="other_category">Another budget category</option>
                                        )}
                                        {!isNegative && savingsAccounts.length > 0 && (
                                            <option value="savings">Move to savings</option>
                                        )}
                                        <option value="discard">Discard (reset to base)</option>
                                    </select>

                                    {/* Secondary: target category picker */}
                                    {entry?.disposition === "other_category" && (
                                        <select
                                            value={entry.target_category_id ?? ""}
                                            onChange={(e) =>
                                                updateDisposition(row.category_id, {
                                                    target_category_id: Number(e.target.value) || null,
                                                })
                                            }
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-paynes-gray focus:outline-none focus:ring-2 focus:ring-columbia-blue/30"
                                        >
                                            <option value="">Select a category</option>
                                            {categories
                                                .filter((c) => c.id !== row.category_id)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.category_name}
                                                    </option>
                                                ))}
                                        </select>
                                    )}

                                    {/* Secondary: savings account picker */}
                                    {entry?.disposition === "savings" && (
                                        <select
                                            value={entry.target_savings_account_id ?? ""}
                                            onChange={(e) =>
                                                updateDisposition(row.category_id, {
                                                    target_savings_account_id: Number(e.target.value) || null,
                                                })
                                            }
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-paynes-gray focus:outline-none focus:ring-2 focus:ring-columbia-blue/30"
                                        >
                                            <option value="">Select a savings account</option>
                                            {savingsAccounts.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Button
                    onClick={handleConfirm}
                    disabled={isPending || !isValid}
                    className="w-full"
                >
                    {isPending
                        ? "Saving…"
                        : `Confirm Rollover to ${MONTH_NAMES[toMonth]} ${toYear}`}
                </Button>
            </SheetContent>
        </Sheet>
    );
}