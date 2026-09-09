"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logActualPayment } from "@/app/home/loans/actions";
import type { LoanScheduledPayment } from "@/app/types";
import InlineNotification from "@/components/ui/InlineNotification";
import { formatCurrency } from "@/lib/formatCurrency";
import { parseLocalDate } from "@/lib/dateUtils";

interface Props {
    loanId: string;
    loanCurrency: string;
    baseCurrency: string;
    unpaidSchedule: Pick<LoanScheduledPayment, "id" | "due_date" | "total_payment">[];
    onSuccess?: () => void;
}

export default function LogPaymentForm({
    loanId,
    loanCurrency,
    baseCurrency,
    unpaidSchedule,
    onSuccess,
}: Props) {
    const router = useRouter();
    const sameCurrency = loanCurrency === baseCurrency;

    const [scheduledPaymentId, setScheduledPaymentId] = useState("");
    const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
    const [amountOwed, setAmountOwed] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [linkExpense, setLinkExpense] = useState(false);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const owed = parseFloat(amountOwed);
            if (isNaN(owed) || owed <= 0) {
                setMessage({ type: "error", text: "Amount owed must be greater than 0" });
                setSaving(false);
                return;
            }

            const paid = sameCurrency
                ? owed
                : parseFloat(amountPaid) || owed;

            await logActualPayment(loanId, {
                scheduled_payment_id: scheduledPaymentId || null,
                paid_date: paidDate,
                amount_owed_loan_currency: owed,
                amount_paid_base_currency: paid,
                notes: notes || undefined,
                create_linked_expense: linkExpense,
            });

            setMessage({ type: "success", text: "Payment logged successfully" });
            setAmountOwed("");
            setAmountPaid("");
            setNotes("");
            setScheduledPaymentId("");
            setLinkExpense(false);
            router.refresh();
            onSuccess?.();
        } catch {
            setMessage({ type: "error", text: "Failed to log payment" });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-paynes-gray mb-4">Log Payment</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Link to Scheduled Payment
                    </label>
                    <select
                        value={scheduledPaymentId}
                        onChange={(e) => {
                            setScheduledPaymentId(e.target.value);
                            const selected = unpaidSchedule.find(
                                (s) => s.id === e.target.value
                            );
                            if (selected?.total_payment) {
                                setAmountOwed(selected.total_payment.toString());
                            }
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    >
                        <option value="">Unscheduled / Extra payment</option>
                        {unpaidSchedule.map((s) => {
                            const overdue = parseLocalDate(s.due_date) < new Date(new Date().toDateString());
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.due_date}{overdue ? " (overdue)" : ""} — {s.total_payment != null ? formatCurrency(s.total_payment, loanCurrency) : "-"}
                                </option>
                            );
                        })}
                    </select>
                    {scheduledPaymentId && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-columbia-blue bg-opacity-20 text-paynes-gray rounded">
                            from schedule
                        </span>
                    )}
                </div>

                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Paid Date
                    </label>
                    <input
                        type="date"
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                            Amount Owed ({loanCurrency})
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
                            required
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                    </div>

                    {!sameCurrency && (
                        <div>
                            <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                Amount Paid ({baseCurrency})
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                required
                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Notes (optional)
                    </label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={linkExpense}
                        onChange={(e) => setLinkExpense(e.target.checked)}
                        className="rounded border-gray-300 text-glaucous focus:ring-glaucous"
                    />
                    <span className="text-xs text-paynes-gray opacity-70">
                        Also create as an expense entry
                    </span>
                </label>

                {message && (
                    <InlineNotification
                        type={message.type}
                        message={message.text}
                    />
                )}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                    >
                        {saving ? "Logging…" : "Log Payment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
