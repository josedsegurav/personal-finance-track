import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import { getLoans } from "@/hooks/supabaseQueries";
import { formatCurrency } from "@/lib/formatCurrency";

export default async function LoansPage() {
    const supabase = await createClient();
    const loans = await getLoans(supabase);

    return (
        <>
            <SidebarNav activeMenu="loans" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray">
                            Loans
                        </h1>
                        <div className="flex gap-2">
                            <Link
                                href="/home/loans/new"
                                className="px-4 py-2 text-xs font-medium text-glaucous border border-glaucous rounded-lg hover:bg-glaucous hover:text-white transition-colors"
                            >
                                + New Loan
                            </Link>
                            <Link
                                href="/home/loans/import"
                                className="px-4 py-2 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors"
                            >
                                + Import
                            </Link>
                        </div>
                    </div>

                    {loans.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <p className="text-sm text-paynes-gray opacity-40 mb-3">
                                No loans yet
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <Link
                                    href="/home/loans/new"
                                    className="text-xs text-glaucous hover:opacity-70"
                                >
                                    Create your first loan →
                                </Link>
                                <span className="text-xs text-paynes-gray opacity-30">or</span>
                                <Link
                                    href="/home/loans/import"
                                    className="text-xs text-glaucous hover:opacity-70"
                                >
                                    Import one →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {loans.map((loan) => (
                                <Link
                                    key={loan.id}
                                    href={`/home/loans/${loan.id}`}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-paynes-gray">
                                                {loan.name}
                                            </h3>
                                            {loan.lender && (
                                                <p className="text-xs text-paynes-gray opacity-60">
                                                    {loan.lender}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-paynes-gray">
                                                {formatCurrency(parseFloat(loan.principal as unknown as string), loan.currency)}
                                            </p>
                                            <p className="text-xs text-paynes-gray opacity-60">
                                                {loan.currency} · {loan.status}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
