import Link from "next/link";

interface BudgetRow {
    category_name: string;
    planned:       number;   // effective budget (base + carryover)
    base_amount:   number;
    carryover:     number;
    spent:         number;
    percentage:    number;
}

interface Props {
    budgets: BudgetRow[];
}

// Matches the temperature scale used on the budget cards
function carryoverBadgeClasses(carryover: number, base: number): string {
    if (carryover === 0) return "";
    const ratio = base !== 0
        ? Math.max(-1, Math.min(1, carryover / base))
        : carryover > 0 ? 1 : -1;

    if (ratio < -0.5)  return "bg-red-800 text-white";
    if (ratio < -0.25) return "bg-red-500 text-white";
    if (ratio < -0.05) return "bg-rose-400 text-white";
    if (ratio < 0)     return "bg-rose-200 text-rose-800";
    if (ratio < 0.05)  return "bg-sky-100 text-sky-700";
    if (ratio < 0.25)  return "bg-sky-300 text-sky-900";
    if (ratio < 0.5)   return "bg-blue-400 text-white";
    return "bg-blue-600 text-white";
}

export default function BudgetStrip({ budgets }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-paynes-gray">Budget This Month</h2>
                    <p className="text-xs text-paynes-gray opacity-50 mt-0.5">
                        Spending vs effective budget per category
                    </p>
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
                    <p className="text-sm text-paynes-gray opacity-40 mb-2">
                        No budget set for this month
                    </p>
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
                        const badgeCls  = carryoverBadgeClasses(row.carryover, row.base_amount);

                        return (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    {/* Left: name + over badge */}
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-xs font-medium text-paynes-gray truncate">
                                            {row.category_name}
                                        </span>
                                        {isOver && (
                                            <span className="shrink-0 text-xs bg-red-50 text-bittersweet px-1.5 py-0.5 rounded font-medium">
                                                Over
                                            </span>
                                        )}
                                    </div>

                                    {/* Right: spent / effective + carryover badge */}
                                    <div className="flex items-center gap-1.5 text-xs shrink-0 ml-2">
                                        {row.carryover !== 0 && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badgeCls}`}>
                                                {row.carryover > 0 ? "+" : ""}
                                                ${row.carryover.toFixed(0)}
                                            </span>
                                        )}
                                        <span className={`font-medium ${isOver ? "text-bittersweet" : "text-paynes-gray"}`}>
                                            ${row.spent.toFixed(2)}
                                        </span>
                                        <span className="text-paynes-gray opacity-40">/</span>
                                        <div className="text-right">
                                            <span className="text-paynes-gray opacity-70">
                                                ${row.planned.toFixed(2)}
                                            </span>
                                            {row.carryover !== 0 && (
                                                <p className="text-paynes-gray opacity-35 text-xs leading-none mt-0.5">
                                                    base ${row.base_amount.toFixed(0)}
                                                </p>
                                            )}
                                        </div>
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