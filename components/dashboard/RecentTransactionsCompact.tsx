import Link from "next/link";

interface TransactionRow {
    id: string;
    date: string;
    description: string;
    type: "income" | "expense";
    amount: number;
}

interface Props {
    transactions: TransactionRow[];
}

function relativeDay(dateStr: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + "T00:00:00");
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RecentTransactionsCompact({ transactions }: Props) {
    const top = [...transactions]
        .sort((a, b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime())
        .slice(0, 8);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-paynes-gray uppercase tracking-wide">Recent Transactions</h3>
                <Link
                    href="/home/expenses"
                    className="text-xs font-medium text-glaucous hover:underline"
                >
                    View all →
                </Link>
            </div>
            <div className="flex-1 space-y-3">
                {top.length === 0 && (
                    <p className="text-xs text-paynes-gray opacity-50 text-center pt-4">No transactions yet</p>
                )}
                {top.map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-paynes-gray truncate">{t.description}</p>
                            <p className="text-xs text-paynes-gray opacity-50">{relativeDay(t.date)}</p>
                        </div>
                        <span
                            className={`text-sm font-semibold shrink-0 ml-3 ${
                                t.type === "income" ? "text-green-600" : "text-bittersweet"
                            }`}
                        >
                            {t.type === "income" ? "+" : "−"}${t.amount.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
