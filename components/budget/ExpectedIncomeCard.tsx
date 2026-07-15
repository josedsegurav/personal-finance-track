"use client";

import { useState } from "react";
import { updateExpectedIncome } from "@/app/home/budget/actions";
import type { ExpectedIncome } from "@/app/types";

interface Props {
    expectedIncome: ExpectedIncome | null;
}

export default function ExpectedIncomeCard({ expectedIncome }: Props) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(expectedIncome?.amount?.toFixed(2) ?? "");
    const [submitting, setSubmitting] = useState(false);

    async function handleSave() {
        const val = parseFloat(draft);
        if (isNaN(val) || val < 0) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.set("amount", draft);
            await updateExpectedIncome(fd);
            setEditing(false);
        } catch {
            // revert on error
            setDraft(expectedIncome?.amount?.toFixed(2) ?? "");
            setEditing(false);
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        setDraft(expectedIncome?.amount?.toFixed(2) ?? "");
        setEditing(false);
    }

    const isSet = expectedIncome != null && expectedIncome.amount > 0;

    return (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80">
                    Expected Monthly Income
                </h3>
                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-xs text-glaucous hover:opacity-70 transition-opacity"
                    >
                        {isSet ? "Edit" : "Set"}
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-paynes-gray">$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={submitting}
                            className="px-3 py-1 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                        >
                            {submitting ? "Saving…" : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1 text-xs font-medium text-paynes-gray bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {isSet ? (
                        <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
                            ${expectedIncome.amount.toFixed(2)}
                        </p>
                    ) : (
                        <p className="text-xl lg:text-2xl font-semibold text-paynes-gray opacity-30">
                            Not set
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
