import Link from "next/link";

interface SnapshotAccount {
    id: number;
    name: string;
    color: string;
    plannedAmount: number;
    totalContributed: number;
    allTimeSaved: number;
    goal_amount: number | null;
    progressPercent: number;
}

interface Props {
    accounts: SnapshotAccount[];
    totalCount: number;
}

export default function SavingsSnapshot({ accounts, totalCount }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-paynes-gray">Savings Goals</h2>
                    <p className="text-xs text-paynes-gray opacity-50 mt-0.5">All-time progress per jar</p>
                </div>
                <Link
                    href="/home/savings"
                    className="text-xs text-glaucous hover:opacity-70 transition-opacity"
                >
                    {totalCount > 4 ? `+${totalCount - 4} more →` : "Manage →"}
                </Link>
            </div>

            {accounts.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-paynes-gray opacity-40 mb-2">No savings goals yet</p>
                    <Link href="/home/savings" className="text-xs text-glaucous hover:opacity-70">
                        Create your first goal →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {accounts.map(acc => {
                        const contributionPct = acc.plannedAmount > 0
                            ? Math.min((acc.totalContributed / acc.plannedAmount) * 100, 100)
                            : 0;
                        const hasGoal = acc.goal_amount != null && acc.goal_amount > 0;

                        return (
                            <div key={acc.id}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: acc.color }}
                                        />
                                        <span className="text-xs font-medium text-paynes-gray">{acc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-semibold text-paynes-gray">
                                            ${acc.allTimeSaved.toFixed(2)}
                                        </span>
                                        {hasGoal && (
                                            <>
                                                <span className="text-paynes-gray opacity-40">/</span>
                                                <span className="text-paynes-gray opacity-60">
                                                    ${acc.goal_amount!.toFixed(2)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Goal progress (all-time) */}
                                {hasGoal && (
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{
                                                width: `${acc.progressPercent}%`,
                                                backgroundColor: acc.color,
                                            }}
                                        />
                                    </div>
                                )}

                                {/* This month plan contribution progress */}
                                {acc.plannedAmount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-1">
                                            <div
                                                className="h-1 rounded-full bg-glaucous bg-opacity-40 transition-all"
                                                style={{ width: `${contributionPct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-paynes-gray opacity-40 flex-shrink-0">
                                            ${acc.totalContributed.toFixed(0)} / ${acc.plannedAmount.toFixed(0)} this month
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}