import Link from "next/link";

interface BudgetRow {
    category_name: string;
    planned: number;
    spent: number;
    percentage: number;
}

interface Props {
    budgets: BudgetRow[];
}

export default function BudgetStrip({ budgets }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-paynes-gray">Budget This Month</h2>
                    <p className="text-xs text-paynes-gray opacity-50 mt-0.5">Spending vs planned per category</p>
                </div>
                <Link
                    href="/home/budget"
                    className="text-xs text-glaucous hover:opacity-70 transition-opacity"
                >
                    Manage →
                </Link>
            </div>

            {budgets.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-paynes-gray opacity-40 mb-2">No budget set for this month</p>
                    <Link href="/home/budget" className="text-xs text-glaucous hover:opacity-70">
                        Set up your budget →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {budgets.map((row, i) => {
                        const isOver    = row.percentage > 100;
                        const isWarning = row.percentage >= 80 && !isOver;
                        const barColor  = isOver ? "#FE5F55" : isWarning ? "#f59e0b" : "#22c55e";
                        const barWidth  = Math.min(row.percentage, 100);

                        return (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-paynes-gray">
                                            {row.category_name}
                                        </span>
                                        {isOver && (
                                            <span className="text-xs bg-red-50 text-bittersweet px-1.5 py-0.5 rounded font-medium">
                                                Over
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`font-medium ${isOver ? "text-bittersweet" : "text-paynes-gray"}`}>
                                            ${row.spent.toFixed(2)}
                                        </span>
                                        <span className="text-paynes-gray opacity-40">/</span>
                                        <span className="text-paynes-gray opacity-60">${row.planned.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full transition-all"
                                        style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}