"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLoan } from "@/app/home/loans/actions";
import type { Loan } from "@/app/types";
import InlineNotification from "@/components/ui/InlineNotification";

interface Props {
    loan: Loan;
}

export default function EditLoanFields({ loan }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState(loan.name);
    const [lender, setLender] = useState(loan.lender ?? "");
    const [interestRate, setInterestRate] = useState(loan.interest_rate?.toString() ?? "");
    const [termMonths, setTermMonths] = useState(loan.term_months?.toString() ?? "");
    const [startDate, setStartDate] = useState(loan.start_date ?? "");
    const [currency, setCurrency] = useState(loan.currency);

    async function handleSave() {
        if (!name.trim()) {
            setError("Loan name is required");
            return;
        }
        if (!interestRate || isNaN(parseFloat(interestRate)) || parseFloat(interestRate) <= 0) {
            setError("Valid interest rate is required");
            return;
        }
        if (!termMonths || isNaN(parseInt(termMonths)) || parseInt(termMonths) <= 0) {
            setError("Valid term in months is required");
            return;
        }
        if (!startDate) {
            setError("Start date is required");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await updateLoan(loan.id, {
                name: name.trim(),
                lender: lender || null,
                interest_rate: parseFloat(interestRate),
                term_months: parseInt(termMonths),
                start_date: startDate,
                currency: currency.toUpperCase(),
            });
            setEditing(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update loan");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setName(loan.name);
        setLender(loan.lender ?? "");
        setInterestRate(loan.interest_rate?.toString() ?? "");
        setTermMonths(loan.term_months?.toString() ?? "");
        setStartDate(loan.start_date ?? "");
        setCurrency(loan.currency);
        setError(null);
        setEditing(false);
    }

    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs text-glaucous hover:opacity-70"
            >
                Edit
            </button>
        );
    }

    return (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
            {error && (
                <InlineNotification type="error" message={error} />
            )}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Lender
                    </label>
                    <input
                        type="text"
                        value={lender}
                        onChange={(e) => setLender(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Interest Rate (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Term (months)
                    </label>
                    <input
                        type="number"
                        required
                        value={termMonths}
                        onChange={(e) => setTermMonths(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Currency
                    </label>
                    <input
                        type="text"
                        maxLength={3}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent uppercase"
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                >
                    {saving ? "Saving…" : "Save"}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-3 py-1 text-xs font-medium text-paynes-gray bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
