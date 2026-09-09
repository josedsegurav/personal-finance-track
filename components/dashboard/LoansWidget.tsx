import Link from "next/link";

interface LoanWidgetItem {
    id: string;
    name: string;
    remainingBalance: number;
    nextPayment: { due_date: string; amount: number } | null;
    status: string;
}

interface Props {
    loans: LoanWidgetItem[];
    totalDebtBaseCurrency: number;
    baseCurrency: string;
}

export default function LoansWidget({ loans, totalDebtBaseCurrency, baseCurrency }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-paynes-gray">Loans</h2>
                    <p className="text-xs text-paynes-gray opacity-50 mt-0.5">
                        {loans.length > 0
                            ? `${totalDebtBaseCurrency >= 1000 ? `${(totalDebtBaseCurrency / 1000).toFixed(1)}k` : totalDebtBaseCurrency.toFixed(0)} ${baseCurrency} remaining`
                            : "Track your loan payments"}
                    </p>
                </div>
                <Link
                    href="/home/loans"
                    className="text-xs text-glaucous hover:opacity-70 transition-opacity"
                >
                    {loans.length > 0 ? "Manage →" : "Add loan →"}
                </Link>
            </div>

            {loans.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-paynes-gray opacity-40 mb-2">No loans yet</p>
                    <Link
                        href="/home/loans/import"
                        className="text-xs text-glaucous hover:opacity-70"
                    >
                        Import your first loan →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {loans.slice(0, 4).map((loan) => (
                        <Link
                            key={loan.id}
                            href={`/home/loans/${loan.id}`}
                            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-paynes-gray">
                                    {loan.name}
                                </span>
                                <span className="text-xs text-paynes-gray opacity-60 capitalize">
                                    {loan.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-paynes-gray">
                                    ${loan.remainingBalance.toFixed(2)}
                                </span>
                                {loan.nextPayment && (
                                    <span className="text-[10px] text-paynes-gray opacity-50">
                                        Due {loan.nextPayment.due_date}: ${loan.nextPayment.amount.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                    {loans.length > 4 && (
                        <Link
                            href="/home/loans"
                            className="block text-center text-xs text-glaucous hover:opacity-70 pt-2"
                        >
                            +{loans.length - 4} more loans →
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
