"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarNav from "@/components/sidebar";
import ScheduleGrid from "@/components/loans/ScheduleGrid";
import { createLoanWithSchedule } from "@/app/home/loans/actions";
import InlineNotification from "@/components/ui/InlineNotification";
import type { LoanScheduledPayment } from "@/app/types";

export default function NewLoanPage() {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [loanName, setLoanName] = useState("");
    const [lender, setLender] = useState("");
    const [principal, setPrincipal] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [termMonths, setTermMonths] = useState("");
    const [startDate, setStartDate] = useState("");
    const [loanCurrency, setLoanCurrency] = useState("USD");

    const [scheduleRows, setScheduleRows] = useState<Partial<LoanScheduledPayment>[]>([]);

    async function handleSave() {
        if (!loanName.trim()) {
            setError("Loan name is required");
            return;
        }
        if (!principal || isNaN(parseFloat(principal)) || parseFloat(principal) <= 0) {
            setError("Valid principal amount is required");
            return;
        }
        if (scheduleRows.length === 0) {
            setError("At least one schedule row is required");
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

        setSubmitting(true);

        try {
            const loan = await createLoanWithSchedule(
                {
                    name: loanName.trim(),
                    lender: lender || null,
                    principal: parseFloat(principal),
                    interest_rate: parseFloat(interestRate),
                    term_months: parseInt(termMonths),
                    start_date: startDate,
                    currency: loanCurrency,
                    amortization_system: "unknown",
                    extras: [],
                },
                scheduleRows
            );

            router.push(`/home/loans/${loan.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save loan");
            setSubmitting(false);
        }
    }

    return (
        <>
            <SidebarNav activeMenu="loans" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray">
                            New Loan
                        </h1>
                    </div>

                    {error && (
                        <InlineNotification type="error" message={error} className="mb-4" />
                    )}

                    <div className="space-y-6">
                        {/* Loan Header Fields */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xs font-medium text-paynes-gray opacity-80 mb-3">
                                Loan Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={loanName}
                                        onChange={(e) => setLoanName(e.target.value)}
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
                                        Principal
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={principal}
                                        onChange={(e) => setPrincipal(e.target.value)}
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
                                        value={loanCurrency}
                                        onChange={(e) => setLoanCurrency(e.target.value.toUpperCase())}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Schedule Grid */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xs font-medium text-paynes-gray opacity-80 mb-3">
                                Payment Schedule
                            </h3>
                            <p className="text-xs text-paynes-gray opacity-60 mb-3">
                                Add at least one row to define the payment schedule.
                            </p>
                            <ScheduleGrid
                                schedule={[]}
                                onChange={setScheduleRows}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 items-center">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={submitting || !loanName || !principal || !interestRate || !termMonths || !startDate}
                                className="px-4 py-2 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                            >
                                {submitting ? "Saving…" : "Save Loan"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/home/loans")}
                                className="px-4 py-2 text-sm font-medium text-paynes-gray bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <span className="text-xs text-paynes-gray opacity-40">
                                Changes are saved when you click Save
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
