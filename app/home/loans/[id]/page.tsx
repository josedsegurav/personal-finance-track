import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import {
    getLoanById,
    getLoanScheduledPayments,
    getLoanActualPayments,
    getUserSettings,
} from "@/hooks/supabaseQueries";
import BalanceChart from "@/components/loans/BalanceChart";
import LogPaymentForm from "@/components/loans/LogPaymentForm";
import EditLoanFields from "@/components/loans/EditLoanFields";
import PaidStatusCell from "@/components/loans/PaidStatusCell";
import FullScheduleTable from "@/components/loans/FullScheduleTable";
import { formatCurrency } from "@/lib/formatCurrency";
import { parseLocalDate } from "@/lib/dateUtils";

export default async function LoanDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [loan, schedule, actualPayments, userSettings] = await Promise.all([
        getLoanById(supabase, id),
        getLoanScheduledPayments(supabase, id),
        getLoanActualPayments(supabase, id),
        getUserSettings(supabase),
    ]);

    if (!loan) notFound();

    const principal = parseFloat(loan.principal as unknown as string);
    const lastSchedule = schedule.length > 0 ? schedule[schedule.length - 1] : null;
    const remainingBalance = lastSchedule?.balance_after ?? principal;
    const progressPct = principal > 0 ? ((principal - remainingBalance) / principal) * 100 : 0;

    const paidScheduledIds = new Set(
        actualPayments
            .filter((a) => a.scheduled_payment_id)
            .map((a) => a.scheduled_payment_id)
    );

    const nextPayment = schedule.find((p) => {
        const due = parseLocalDate(p.due_date);
        const todayMidnight = new Date(new Date().toDateString());
        return due >= todayMidnight && (p.balance_after ?? 0) > 0 && !paidScheduledIds.has(p.id);
    });

    const actualPaymentIdsByScheduledId = new Map<string, string[]>();
    actualPayments.forEach((a) => {
        if (!a.scheduled_payment_id) return;
        const existing = actualPaymentIdsByScheduledId.get(a.scheduled_payment_id) ?? [];
        existing.push(a.id);
        actualPaymentIdsByScheduledId.set(a.scheduled_payment_id, existing);
    });

    // All schedule rows without a linked actual payment yet — past-due and
    // future — so the user can catch up on periods that have already passed.
    const unpaidSchedule = schedule.filter((p) => !paidScheduledIds.has(p.id));

    // Union of extra line-item labels across the whole schedule, so scenario-
    // specific charges (insurance, fees, taxes, etc.) get their own column
    // even if they only appear on some rows.
    const extraLabels = Array.from(
        new Set(schedule.flatMap((p) => p.extras?.map((e: { label: string }) => e.label) ?? []))
    ).sort((a, b) => a.localeCompare(b));

    const totalInterest = schedule.reduce((sum: number, p) => sum + (typeof p.interest === "number" ? p.interest : 0), 0);
    const totalNumericExtras = schedule.reduce(
        (sum: number, p) => sum + (p.extras?.reduce((a: number, e: { amount: number | string | null }) => a + (typeof e.amount === "number" ? e.amount : 0), 0) ?? 0),
        0
    ) + (loan.extras ?? []).reduce((s: number, e: { amount: number | string | null }) => s + (typeof e.amount === "number" ? e.amount : 0), 0);

    // Build actual payment lookup by date
    const actualPaymentsByDate = new Map<string, number>();
    actualPayments.forEach((a) => {
        const current = actualPaymentsByDate.get(a.paid_date) ?? 0;
        actualPaymentsByDate.set(a.paid_date, current + a.amount_owed_loan_currency);
    });

    // Get today's date for cutoff
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Calculate actual balances: only show if payment matches scheduled exactly, up to today
    const actualBalances = schedule
        .map((scheduledPayment) => {
            // Stop showing actual balance after today
            if (scheduledPayment.due_date > today) {
                return null;
            }

            const actualPaymentThisDate = actualPaymentsByDate.get(scheduledPayment.due_date) ?? 0;

            // Only show actual balance if payment matches scheduled payment
            if (actualPaymentThisDate === scheduledPayment.total_payment) {
                return {
                    date: scheduledPayment.due_date,
                    balance: scheduledPayment.balance_after ?? 0,
                };
            }

            // Payment differs or missing: don't show actual line for this date
            return null;
        })
        .filter((x): x is { date: string; balance: number } => x !== null);

    const baseCurrency = userSettings?.base_currency ?? "USD";

    return (
        <>
            <SidebarNav activeMenu="loans" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        href="/home/loans"
                        className="text-xs text-glaucous hover:opacity-70 mb-4 inline-block"
                    >
                        ← Back to Loans
                    </Link>

                    {/* Summary Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-semibold text-paynes-gray">
                                    {loan.name}
                                </h1>
                                {loan.lender && (
                                    <p className="text-sm text-paynes-gray opacity-60">
                                        {loan.lender}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-columbia-blue text-white capitalize">
                                    {loan.status}
                                </span>
                                <EditLoanFields loan={loan} />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-paynes-gray opacity-60">
                                    Progress
                                </span>
                                <span className="text-xs font-medium text-paynes-gray">
                                    {progressPct.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-columbia-blue rounded-full transition-all"
                                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Principal</p>
                                <p className="font-semibold text-paynes-gray">
                                    {formatCurrency(principal, loan.currency)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Remaining</p>
                                <p className="font-semibold text-paynes-gray">
                                    {formatCurrency(remainingBalance, loan.currency)}
                                </p>
                            </div>
                            {loan.interest_rate != null && (
                                <div>
                                    <p className="text-xs text-paynes-gray opacity-60">Interest Rate</p>
                                    <p className="font-semibold text-paynes-gray">{loan.interest_rate}%</p>
                                </div>
                            )}
                            {loan.term_months != null && (
                                <div>
                                    <p className="text-xs text-paynes-gray opacity-60">Term</p>
                                    <p className="font-semibold text-paynes-gray">
                                        {loan.term_months} months
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Total Interest</p>
                                <p className="font-semibold text-paynes-gray">
                                    {formatCurrency(totalInterest, loan.currency)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Total Extras</p>
                                <p className="font-semibold text-paynes-gray">
                                    {formatCurrency(totalNumericExtras, loan.currency)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Schedule</p>
                                <p className="font-semibold text-paynes-gray">
                                    {schedule.length} payments
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-paynes-gray opacity-60">Actual Paid</p>
                                <p className="font-semibold text-paynes-gray">
                                    {actualPayments.length} payments
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What-If Link */}
                    <div className="mb-6">
                        <Link
                            href={`/home/loans/${id}/whatif`}
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium bg-white text-glaucous border border-glaucous rounded-lg hover:bg-glaucous hover:text-white transition-colors"
                        >
                            What-If Scenarios →
                        </Link>
                    </div>

                    {/* Next Payment */}
                    {nextPayment && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-sm font-medium text-paynes-gray mb-3">
                                Next Payment
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-paynes-gray opacity-60">Due Date</span>
                                    <span className="font-semibold text-paynes-gray">{nextPayment.due_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-paynes-gray opacity-60">Amount</span>
                                    <span className="font-semibold text-paynes-gray">
                                        {nextPayment.total_payment != null ? formatCurrency(nextPayment.total_payment, loan.currency) : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-paynes-gray opacity-60">Remaining Balance</span>
                                    <span className="font-semibold text-paynes-gray">
                                        {nextPayment.balance_after != null ? formatCurrency(nextPayment.balance_after, loan.currency) : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Balance Over Time - Full Width */}
                    <div className="mb-6">
                        <BalanceChart
                            schedule={schedule.map((p) => ({
                                due_date: p.due_date,
                                balance_after: p.balance_after ?? 0,
                            }))}
                            actualBalances={
                                actualBalances.length > 0 ? actualBalances : undefined
                            }
                            currency={loan.currency}
                        />
                    </div>

                    {/* Log Payment + Schedule Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <LogPaymentForm
                            loanId={loan.id}
                            loanCurrency={loan.currency}
                            baseCurrency={baseCurrency}
                            unpaidSchedule={unpaidSchedule.map((p) => ({
                                id: p.id,
                                due_date: p.due_date,
                                total_payment: p.total_payment,
                            }))}
                        />

                        {/* Scheduled vs Actual Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-medium text-paynes-gray mb-3">
                                Scheduled vs Actual
                            </h2>
                            <div className="overflow-x-auto max-h-80 overflow-y-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="bg-gray-50">
                                            <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">#</th>
                                            <th className="px-2 py-1.5 text-left text-paynes-gray font-medium border border-gray-200">Due</th>
                                            <th className="px-2 py-1.5 text-right text-paynes-gray font-medium border border-gray-200">Scheduled</th>
                                            <th className="px-2 py-1.5 text-center text-paynes-gray font-medium border border-gray-200">Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((p, i) => {
                                            const isPaid = paidScheduledIds.has(p.id);
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className={`hover:bg-gray-50 ${isPaid ? "bg-green-50" : ""}`}
                                                >
                                                    <td className="px-2 py-1 border border-gray-200 text-paynes-gray opacity-60">{i + 1}</td>
                                                    <td className="px-2 py-1 border border-gray-200">{p.due_date}</td>
                                                    <td className="px-2 py-1 border border-gray-200 text-right">
                                                        {p.total_payment != null ? formatCurrency(p.total_payment, loan.currency) : "-"}
                                                    </td>
                                                    <td className="px-2 py-1 border border-gray-200 text-center">
                                                        <PaidStatusCell
                                                            loanId={loan.id}
                                                            loanCurrency={loan.currency}
                                                            baseCurrency={baseCurrency}
                                                            scheduledPayment={{
                                                                id: p.id,
                                                                due_date: p.due_date,
                                                                total_payment: p.total_payment,
                                                            }}
                                                            isPaid={isPaid}
                                                            linkedActualPaymentIds={
                                                                actualPaymentIdsByScheduledId.get(p.id) ?? []
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <FullScheduleTable
                        loanId={loan.id}
                        loanCurrency={loan.currency}
                        baseCurrency={baseCurrency}
                        schedule={schedule}
                        extraLabels={extraLabels}
                        actualPaymentIdsByScheduledId={actualPaymentIdsByScheduledId}
                        paidScheduledIds={paidScheduledIds}
                    />
                </div>
            </div>
        </>
    );
}
