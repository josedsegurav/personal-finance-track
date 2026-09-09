"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    logActualPayment,
    deleteActualPaymentsForScheduledPayment,
} from "@/app/home/loans/actions";
import { parseLocalDate } from "@/lib/dateUtils";

interface Props {
    loanId: string;
    loanCurrency: string;
    baseCurrency: string;
    scheduledPayment: {
        id: string;
        due_date: string;
        total_payment: number | null;
    };
    isPaid: boolean;
    linkedActualPaymentIds: string[];
}

export default function PaidStatusCell({
    loanId,
    loanCurrency,
    baseCurrency,
    scheduledPayment,
    isPaid,
    linkedActualPaymentIds,
}: Props) {
    const router = useRouter();
    const sameCurrency = loanCurrency === baseCurrency;

    const [marking, setMarking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [paidDate, setPaidDate] = useState(scheduledPayment.due_date);
    const [amountOwed, setAmountOwed] = useState(
        scheduledPayment.total_payment != null ? String(scheduledPayment.total_payment) : ""
    );
    const [amountPaid, setAmountPaid] = useState(
        scheduledPayment.total_payment != null ? String(scheduledPayment.total_payment) : ""
    );

    const isOverdue =
        parseLocalDate(scheduledPayment.due_date) < new Date(new Date().toDateString());

    async function handleConfirmMark() {
        const owed = parseFloat(amountOwed);
        if (isNaN(owed) || owed <= 0) {
            setError("Amount must be greater than 0");
            return;
        }
        const paid = sameCurrency ? owed : parseFloat(amountPaid) || owed;

        setSaving(true);
        setError(null);
        try {
            await logActualPayment(loanId, {
                scheduled_payment_id: scheduledPayment.id,
                paid_date: paidDate,
                amount_owed_loan_currency: owed,
                amount_paid_base_currency: paid,
                create_linked_expense: false,
            });
            setMarking(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to log payment");
        } finally {
            setSaving(false);
        }
    }

    async function handleUndo() {
        if (
            !window.confirm(
                "Remove the logged payment for this period? This does not delete any linked expense entry."
            )
        ) {
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await deleteActualPaymentsForScheduledPayment(loanId, scheduledPayment.id);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to undo payment");
        } finally {
            setSaving(false);
        }
    }

    if (isPaid) {
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-green-600">✓</span>
                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={saving || linkedActualPaymentIds.length === 0}
                    className="text-[10px] text-paynes-gray opacity-50 hover:opacity-90 underline disabled:opacity-20"
                >
                    Undo
                </button>
                {error && <span className="text-[10px] text-bittersweet">{error}</span>}
            </div>
        );
    }

    if (!marking) {
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-paynes-gray opacity-30">—</span>
                <button
                    type="button"
                    onClick={() => setMarking(true)}
                    className={`text-[10px] underline hover:opacity-70 ${
                        isOverdue ? "text-bittersweet" : "text-glaucous"
                    }`}
                >
                    Mark Paid
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-stretch gap-1 py-1 min-w-[110px]">
            <label className="text-[10px] text-paynes-gray opacity-60">Paid date</label>
            <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-1 py-0.5 text-[10px] border border-gray-200 rounded"
            />
            <label className="text-[10px] text-paynes-gray opacity-60">
                Owed ({loanCurrency})
            </label>
            <input
                type="number"
                step="0.01"
                min="0"
                value={amountOwed}
                onChange={(e) => {
                    setAmountOwed(e.target.value);
                    if (sameCurrency) setAmountPaid(e.target.value);
                }}
                className="w-full px-1 py-0.5 text-[10px] border border-gray-200 rounded"
            />
            {!sameCurrency && (
                <>
                    <label className="text-[10px] text-paynes-gray opacity-60">
                        Paid ({baseCurrency})
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full px-1 py-0.5 text-[10px] border border-gray-200 rounded"
                    />
                </>
            )}
            {error && <span className="text-[10px] text-bittersweet">{error}</span>}
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={handleConfirmMark}
                    disabled={saving}
                    className="flex-1 px-1 py-0.5 text-[10px] font-medium bg-glaucous text-white rounded hover:bg-glaucous-dark disabled:opacity-40"
                >
                    {saving ? "…" : "Confirm"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMarking(false);
                        setError(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-1 py-0.5 text-[10px] font-medium bg-gray-100 text-paynes-gray rounded hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
