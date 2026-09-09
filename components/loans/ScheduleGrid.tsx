"use client";

import { useState, useMemo, useRef } from "react";
import type { LoanScheduledPayment } from "@/app/types";

interface EditableRow {
    due_date: string;
    capital: string;
    interest: string;
    total_payment: string;
    balance_after: string;
    extras: Record<string, string>;
    row_flag?: string;
}

const DEFAULT_EXTRA_SUGGESTIONS = ["Insurance", "Taxes", "Fees", "Commission", "Discount"];

interface Props {
    schedule: Partial<LoanScheduledPayment>[];
    onChange?: (rows: Partial<LoanScheduledPayment>[]) => void;
}

const CANONICAL_FIELDS: Array<{ key: keyof EditableRow; label: string }> = [
    { key: "due_date", label: "Due Date" },
    { key: "capital", label: "Capital" },
    { key: "interest", label: "Interest" },
    { key: "total_payment", label: "Total Payment" },
    { key: "balance_after", label: "Balance" },
];

function rowToEditable(r: Partial<LoanScheduledPayment>): EditableRow {
    const extras: Record<string, string> = {};
    if (r.extras) {
        for (const ex of r.extras) {
            extras[ex.label] = ex.amount?.toString() ?? "";
        }
    }
    return {
        due_date: r.due_date ?? "",
        capital: r.capital?.toString() ?? "",
        interest: r.interest?.toString() ?? "",
        total_payment: r.total_payment?.toString() ?? "",
        balance_after: r.balance_after?.toString() ?? "",
        extras,
        row_flag: r.row_flag ?? undefined,
    };
}

function editableToRow(e: EditableRow): Partial<LoanScheduledPayment> {
    const extras: Array<{ label: string; amount: number | string | null }> = Object.entries(e.extras)
        .filter(([, v]) => v !== "")
        .map(([label, raw]) => {
            const t = raw.trim();
            const normalized = t.replace(/,/g, "");
            const num = Number(normalized);
            const isNumeric = t !== "" && !Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(normalized);
            return { label, amount: isNumeric ? num : t };
        });

    return {
        due_date: e.due_date,
        capital: e.capital ? parseFloat(e.capital) : null,
        interest: e.interest ? parseFloat(e.interest) : null,
        total_payment: e.total_payment ? parseFloat(e.total_payment) : null,
        balance_after: e.balance_after ? parseFloat(e.balance_after) : null,
        extras,
        row_flag: e.row_flag ?? null,
    };
}

export default function ScheduleGrid({ schedule, onChange }: Props) {
    const [rows, setRows] = useState<EditableRow[]>(() =>
        schedule.map((r) => rowToEditable(r))
    );
    const [newColumnInput, setNewColumnInput] = useState("");
    const [showColumnManager, setShowColumnManager] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const extraLabels = useMemo(() => {
        const labels = new Set<string>();
        for (const r of schedule) {
            if (r.extras) {
                for (const ex of r.extras) {
                    labels.add(ex.label);
                }
            }
        }
        return Array.from(labels);
    }, [schedule]);

    const [managedExtras, setManagedExtras] = useState<string[]>(extraLabels);

    function addExtraColumn(label: string) {
        const trimmed = label.trim();
        if (!trimmed || managedExtras.includes(trimmed)) return;
        const updated = [...managedExtras, trimmed];
        setManagedExtras(updated);
        setNewColumnInput("");
        inputRef.current?.focus();
    }

    function removeExtraColumn(label: string) {
        const updated = managedExtras.filter((l) => l !== label);
        setManagedExtras(updated);
        const next = rows.map((r) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [label]: _, ...rest } = r.extras;
            return { ...r, extras: rest };
        });
        setRows(next);
        fireOnChange(next);
    }

    const activeFields = useMemo(() => {
        const fields = CANONICAL_FIELDS.filter((f) => {
            return rows.some((r) => r[f.key] !== "");
        });
        return fields;
    }, [rows]);

    function fireOnChange(allRows: EditableRow[]) {
        onChange?.(allRows.map(editableToRow));
    }

    function updateRow(index: number, field: string, value: string) {
        const next = rows.map((r, i) => {
            if (i !== index) return r;
            if (field.startsWith("extras:")) {
                const label = field.slice(7);
                return { ...r, extras: { ...r.extras, [label]: value } };
            }
            return { ...r, [field]: value };
        });
        setRows(next);
        fireOnChange(next);
    }

    function addRow() {
        const next = [
            ...rows,
            {
                due_date: "",
                capital: "",
                interest: "",
                total_payment: "",
                balance_after: "",
                extras: {} as Record<string, string>,
            },
        ];
        setRows(next);
        fireOnChange(next);
    }

    function removeRow(index: number) {
        const next = rows.filter((_, i) => i !== index);
        setRows(next);
        fireOnChange(next);
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200 w-8">
                            #
                        </th>
                        {activeFields.map((f) => (
                            <th
                                key={f.key}
                                className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200"
                            >
                                {f.label}
                            </th>
                        ))}
                        {managedExtras.map((label) => (
                            <th
                                key={label}
                                className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200"
                            >
                                {label}
                            </th>
                        ))}
                        <th className="px-2 py-1.5 border border-gray-200 w-10" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="px-2 py-1 border border-gray-200 text-paynes-gray opacity-60">
                                {i + 1}
                            </td>
                            {activeFields.map((f) => (
                                <td key={f.key} className="px-1 py-1 border border-gray-200">
                                    {f.key === "due_date" ? (
                                        <input
                                            type="date"
                                            value={row.due_date}
                                            onChange={(e) =>
                                                updateRow(i, f.key, e.target.value)
                                            }
                                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={row[f.key] as string}
                                            onChange={(e) =>
                                                updateRow(i, f.key, e.target.value)
                                            }
                                            placeholder="-"
                                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-columbia-blue focus:border-transparent text-right"
                                        />
                                    )}
                                </td>
                            ))}
                            {managedExtras.map((label) => (
                                <td key={label} className="px-1 py-1 border border-gray-200">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={row.extras[label] ?? ""}
                                        onChange={(e) =>
                                            updateRow(i, `extras:${label}`, e.target.value)
                                        }
                                        placeholder="-"
                                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-columbia-blue focus:border-transparent text-right"
                                    />
                                </td>
                            ))}
                            <td className="px-1 py-1 border border-gray-200 text-center">
                                <button
                                    type="button"
                                    onClick={() => removeRow(i)}
                                    className="text-bittersweet hover:opacity-70 text-xs"
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                type="button"
                onClick={addRow}
                className="mt-2 text-xs text-glaucous hover:opacity-70"
            >
                + Add row
            </button>

            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => setShowColumnManager(!showColumnManager)}
                    className="text-xs text-paynes-gray opacity-60 hover:opacity-100"
                >
                    {showColumnManager ? "Hide" : "Manage"} custom columns
                </button>

                {showColumnManager && (
                    <div className="mt-2 space-y-2">
                        <div className="flex gap-2 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newColumnInput}
                                onChange={(e) => setNewColumnInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addExtraColumn(newColumnInput);
                                    }
                                }}
                                placeholder="Column name"
                                className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-columbia-blue focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => addExtraColumn(newColumnInput)}
                                className="px-2 py-1 text-xs text-white bg-glaucous rounded hover:bg-glaucous-dark"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {DEFAULT_EXTRA_SUGGESTIONS.filter(
                                (s) => !managedExtras.includes(s)
                            ).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => addExtraColumn(s)}
                                    className="px-2 py-0.5 text-xs bg-gray-100 text-paynes-gray rounded hover:bg-gray-200"
                                >
                                    + {s}
                                </button>
                            ))}
                        </div>
                        {managedExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {managedExtras.map((label) => (
                                    <span
                                        key={label}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-columbia-blue bg-opacity-20 text-paynes-gray rounded"
                                    >
                                        {label}
                                        <button
                                            type="button"
                                            onClick={() => removeExtraColumn(label)}
                                            className="text-bittersweet hover:opacity-70"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
