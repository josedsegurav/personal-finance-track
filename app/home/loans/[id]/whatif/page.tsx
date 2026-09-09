import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import {
    getLoanById,
    getLoanScenarios,
} from "@/hooks/supabaseQueries";
import ScenarioForm from "@/components/loans/ScenarioForm";

export default async function WhatIfPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const [loan, savedScenarios] = await Promise.all([
        getLoanById(supabase, id),
        getLoanScenarios(supabase, id),
    ]);

    if (!loan) notFound();

    const principal = parseFloat(loan.principal as unknown as string);

    return (
        <>
            <SidebarNav activeMenu="loans" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        href={`/home/loans/${id}`}
                        className="text-xs text-glaucous hover:opacity-70 mb-4 inline-block"
                    >
                        ← Back to Loan
                    </Link>

                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-6">
                        What-If Scenarios — {loan.name}
                    </h1>

                    <ScenarioForm
                        loanId={loan.id}
                        principal={principal}
                        interestRate={loan.interest_rate}
                        termMonths={loan.term_months}
                        startDate={loan.start_date}
                        savedScenarios={savedScenarios}
                        currency={loan.currency}
                    />
                </div>
            </div>
        </>
    );
}
