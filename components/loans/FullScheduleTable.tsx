"use client";

import { useState, useEffect, useRef } from "react";
import type { LoanScheduledPayment } from "@/app/types";
import PaidStatusCell from "./PaidStatusCell";
import { Settings2 } from "lucide-react";

interface Props {
    loanId: string;
    loanCurrency: string;
    baseCurrency: string;
    schedule: LoanScheduledPayment[];
    extraLabels: string[];
    actualPaymentIdsByScheduledId: Map<string, string[]>;
    paidScheduledIds: Set<string>;
}

type ToggleableColumn = string;

const CANONICAL_STATIC_LABELS = ["Due Date", "Capital", "Interest", "Total", "Balance"];
const TOGGLEABLE_STATIC = ["Source", "Flag"];

function getDefaultHidden(extraLabels: string[]): Set<string> {
    const hidden = new Set<string>();
    // Hide ESTADO by default (low value, duplicates Paid)
    if (extraLabels.includes("ESTADO")) hidden.add("ESTADO");
    // Hide Source/Flag by default (often empty / default)
    hidden.add("Source");
    hidden.add("Flag");
    return hidden;
}

export default function FullScheduleTable({
    loanId,
    loanCurrency,
    baseCurrency,
    schedule,
    extraLabels,
    actualPaymentIdsByScheduledId,
    paidScheduledIds,
}: Props) {
    const storageKey = `loanFullScheduleHidden:${loanId}`;

    const [hidden, setHidden] = useState<Set<string>>(() => getDefaultHidden(extraLabels));
    const [hydrated, setHydrated] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed: string[] = JSON.parse(saved);
                setHidden(new Set(parsed));
            } catch {
                // keep default
            }
        }
        setHydrated(true);
    }, [storageKey]);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(hidden)));
    }, [hidden, hydrated, storageKey]);

    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [menuOpen]);

    // Re-sync default if extraLabels change (e.g., new loan) and no saved prefs yet
    // Keep existing hidden for other labels, but ensure ESTADO logic applies if not explicitly saved?
    // We already handle via initial load; no extra effect needed.

    const isVisible = (col: string) => !hidden.has(col);

    const toggle = (col: ToggleableColumn, visible: boolean) => {
        setHidden((prev) => {
            const next = new Set(prev);
            if (visible) next.delete(col);
            else next.add(col);
            return next;
        });
    };

    const visibleExtraLabels = extraLabels.filter((l) => isVisible(l));
    const showSource = isVisible("Source");
    const showFlag = isVisible("Flag");

    const allToggleable: ToggleableColumn[] = [...extraLabels, ...TOGGLEABLE_STATIC];
    const hiddenCount = Array.from(hidden).filter((h) => allToggleable.includes(h)).length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-paynes-gray">
                    Full Schedule ({schedule.length} payments)
                </h2>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="inline-flex items-center h-7 px-3 py-1 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Settings2 className="mr-1 h-3 w-3" />
                        Columns {hiddenCount > 0 ? `(${hiddenCount} hidden)` : ""}
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-56 rounded-md border bg-white p-2 shadow-md z-50 max-h-80 overflow-y-auto">
                            <div className="px-2 py-1 text-sm font-semibold">Toggle columns</div>
                            <div className="h-px bg-gray-200 -mx-1 my-1" />
                            {/* Canonical always visible - show disabled checked */}
                            {CANONICAL_STATIC_LABELS.map((label) => (
                                <label key={label} className="flex items-center gap-2 px-2 py-1.5 text-sm opacity-60 cursor-not-allowed">
                                    <input type="checkbox" checked disabled className="h-3.5 w-3.5 rounded border-gray-300" />
                                    {label} (always)
                                </label>
                            ))}
                            <label className="flex items-center gap-2 px-2 py-1.5 text-sm opacity-60 cursor-not-allowed">
                                <input type="checkbox" checked disabled className="h-3.5 w-3.5 rounded border-gray-300" />
                                Paid (always)
                            </label>
                            {(extraLabels.length > 0 || TOGGLEABLE_STATIC.length > 0) && <div className="h-px bg-gray-200 -mx-1 my-1" />}
                            {extraLabels.length > 0 && (
                                <>
                                    <div className="px-2 py-1 text-xs opacity-60">Extras</div>
                                    {extraLabels.map((label) => (
                                        <label
                                            key={label}
                                            className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isVisible(label)}
                                                onChange={(e) => toggle(label, e.target.checked)}
                                                className="h-3.5 w-3.5 rounded border-gray-300 text-glaucous focus:ring-glaucous"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </>
                            )}
                            <div className="px-2 py-1 text-xs opacity-60">Other</div>
                            {TOGGLEABLE_STATIC.map((label) => (
                                <label
                                    key={label}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isVisible(label)}
                                        onChange={(e) => toggle(label, e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-glaucous focus:ring-glaucous"
                                    />
                                    {label}
                                </label>
                            ))}
                            {hiddenCount > 0 && (
                                <>
                                    <div className="h-px bg-gray-200 -mx-1 my-1" />
                                    <div className="px-2 py-1">
                                        <button
                                            onClick={() => setHidden(new Set())}
                                            className="text-xs text-glaucous hover:underline"
                                        >
                                            Show all
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-white">
                        <tr className="bg-gray-50">
                            <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">#</th>
                            <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">Due Date</th>
                            <th className="px-2 py-1.5 text-right text-paynes-gray font-medium border border-gray-200">Capital</th>
                            <th className="px-2 py-1.5 text-right text-paynes-gray font-medium border border-gray-200">Interest</th>
                            <th className="px-2 py-1.5 text-right text-paynes-gray font-medium border border-gray-200">Total</th>
                            <th className="px-2 py-1.5 text-right text-paynes-gray font-medium border border-gray-200">Balance</th>
                            {visibleExtraLabels.map((label) => (
                                <th
                                    key={label}
                                    className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200"
                                >
                                    {label}
                                </th>
                            ))}
                            {showSource && <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">Source</th>}
                            {showFlag && <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">Flag</th>}
                            <th className="px-2 py-1.5 text-center text-paynes-gray font-medium border border-gray-200">Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((p, i) => {
                            const isPaid = paidScheduledIds.has(p.id);
                            return (
                                <tr key={p.id} className={`hover:bg-gray-50 ${isPaid ? "bg-green-50" : ""}`}>
                                    <td className="px-2 py-1 border border-gray-200 text-paynes-gray opacity-60">{i + 1}</td>
                                    <td className="px-2 py-1 border border-gray-200">{p.due_date}</td>
                                    <td className="px-2 py-1 border border-gray-200 text-right">{p.capital?.toFixed(2) ?? "-"}</td>
                                    <td className="px-2 py-1 border border-gray-200 text-right">{p.interest?.toFixed(2) ?? "-"}</td>
                                    <td className="px-2 py-1 border border-gray-200 text-right font-medium">{p.total_payment?.toFixed(2) ?? "-"}</td>
                                    <td className="px-2 py-1 border border-gray-200 text-right">{p.balance_after?.toFixed(2) ?? "-"}</td>
                                    {visibleExtraLabels.map((label) => {
                                        const match = p.extras?.find((e: { label: string }) => e.label === label);
                                        const value = match?.amount as unknown as number | string | null | undefined;
                                        let display = "-";
                                        if (typeof value === "number") {
                                            display = value.toFixed(2);
                                        } else if (typeof value === "string" && value !== "") {
                                            display = value;
                                        }
                                        return (
                                            <td key={label} className="px-2 py-1 border border-gray-200">
                                                {display}
                                            </td>
                                        );
                                    })}
                                    {showSource && <td className="px-2 py-1 border border-gray-200 capitalize">{p.source}</td>}
                                    {showFlag && <td className="px-2 py-1 border border-gray-200 text-amber-700">{p.row_flag ?? "-"}</td>}
                                    <td className="px-2 py-1 border border-gray-200 text-center">
                                        <PaidStatusCell
                                            loanId={loanId}
                                            loanCurrency={loanCurrency}
                                            baseCurrency={baseCurrency}
                                            scheduledPayment={{
                                                id: p.id,
                                                due_date: p.due_date,
                                                total_payment: p.total_payment,
                                            }}
                                            isPaid={isPaid}
                                            linkedActualPaymentIds={actualPaymentIdsByScheduledId.get(p.id) ?? []}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {hydrated && hiddenCount > 0 && (
                <p className="text-[10px] text-paynes-gray opacity-50 mt-2">
                    {hiddenCount} column{hiddenCount !== 1 ? "s" : ""} hidden — use Columns to show.
                </p>
            )}
        </div>
    );
}
