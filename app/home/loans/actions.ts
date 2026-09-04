"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { revalidatePath } from "next/cache";
import type { Loan, LoanScheduledPayment } from "@/app/types";

export async function createLoan(loan: Partial<Loan>) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { data, error } = await supabase
        .from("loans")
        .insert({ ...loan, user_id: user.id })
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/home/loans");
    return data;
}

export async function createLoanWithSchedule(
    loan: Partial<Loan>,
    scheduleRows: Partial<LoanScheduledPayment>[]
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { data: createdLoan, error: loanError } = await supabase
        .from("loans")
        .insert({ ...loan, user_id: user.id })
        .select()
        .single();

    if (loanError) throw new Error(loanError.message);

    if (scheduleRows.length > 0) {
        const payload = scheduleRows.map((r) => ({
            ...r,
            loan_id: createdLoan.id,
            user_id: user.id,
        }));

        const { error: scheduleError } = await supabase
            .from("loan_scheduled_payments")
            .insert(payload);

        if (scheduleError) throw new Error(scheduleError.message);
    }

    revalidatePath("/home/loans");
    return createdLoan;
}

export async function updateLoan(loanId: string, updates: Partial<Loan>) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase
        .from("loans")
        .update(updates)
        .eq("id", loanId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/home/loans");
    revalidatePath(`/home/loans/${loanId}`);
}

export async function deleteLoan(loanId: string) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase
        .from("loans")
        .delete()
        .eq("id", loanId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/home/loans");
}

export async function bulkInsertScheduledPayments(
    loanId: string,
    rows: Partial<LoanScheduledPayment>[]
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const payload = rows.map((r) => ({ ...r, loan_id: loanId, user_id: user.id }));

    const { error } = await supabase.from("loan_scheduled_payments").insert(payload);

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}`);
}

export async function updateScheduledPayment(
    paymentId: string,
    loanId: string,
    updates: Partial<LoanScheduledPayment>
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase
        .from("loan_scheduled_payments")
        .update(updates)
        .eq("id", paymentId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}`);
}

export async function logActualPayment(
    loanId: string,
    payment: {
        scheduled_payment_id: string | null;
        paid_date: string;
        amount_owed_loan_currency: number;
        amount_paid_base_currency: number;
        notes?: string;
        create_linked_expense?: boolean;
    }
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    let linked_expense_id: number | null = null;

    if (payment.create_linked_expense) {
        const { data: expense, error: expenseError } = await supabase
            .from("expenses")
            .insert({
                user_id: user.id,
                description: `Loan payment`,
                amount: payment.amount_paid_base_currency,
                total_expense: payment.amount_paid_base_currency,
                expense_date: payment.paid_date,
                payment_method: "bank transfer",
            })
            .select()
            .single();

        if (expenseError) throw new Error(expenseError.message);
        linked_expense_id = expense.id;
    }

    const { error } = await supabase.from("loan_actual_payments").insert({
        loan_id: loanId,
        user_id: user.id,
        scheduled_payment_id: payment.scheduled_payment_id,
        paid_date: payment.paid_date,
        amount_owed_loan_currency: payment.amount_owed_loan_currency,
        amount_paid_base_currency: payment.amount_paid_base_currency,
        notes: payment.notes ?? null,
        linked_expense_id,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}`);
}

export async function deleteActualPaymentsForScheduledPayment(
    loanId: string,
    scheduledPaymentId: string
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase
        .from("loan_actual_payments")
        .delete()
        .eq("scheduled_payment_id", scheduledPaymentId)
        .eq("loan_id", loanId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}`);
}

export async function saveScenario(
    loanId: string,
    scenario: {
        name: string;
        extra_monthly: number;
        lump_sum: number;
        lump_sum_date: string | null;
        strategy: "reduce_term" | "reduce_payment";
        result_payoff_date: string | null;
        result_months_saved: number | null;
        result_interest_saved: number | null;
    }
) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase.from("loan_scenarios").insert({
        ...scenario,
        loan_id: loanId,
        user_id: user.id,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}/whatif`);
}

export async function deleteScenario(scenarioId: string, loanId: string) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const { error } = await supabase
        .from("loan_scenarios")
        .delete()
        .eq("id", scenarioId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath(`/home/loans/${loanId}/whatif`);
}
