"use client";

import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoanScheduledPayment } from "@/app/types";
import { formatCurrency } from "@/lib/formatCurrency";

interface BalancePoint {
    label: string;
    scheduled: number | null;
    actual: number | null;
}

interface Props {
    schedule: Pick<LoanScheduledPayment, "due_date" | "balance_after">[];
    actualBalances?: { date: string; balance: number }[];
    currency?: string;
}

function CustomTooltip({
    active,
    payload,
    label,
    currency,
}: {
    active: boolean;
    payload: { name: string; value: number; color: string }[];
    label: string;
    currency?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-paynes-gray mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex justify-between gap-4 mb-1">
                    <span style={{ color: entry.color }} className="font-medium">
                        {entry.name}
                    </span>
                    <span className="font-semibold text-paynes-gray">
                        {formatCurrency(entry.value, currency)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BalanceChart({ schedule, actualBalances, currency }: Props) {
    const hasActuals = actualBalances && actualBalances.length > 0;

    const chartData: BalancePoint[] = schedule.map((p, i) => {
        const actual = hasActuals
            ? actualBalances.find(
                  (a) => a.date === p.due_date
              )?.balance ?? null
            : null;
        return {
            label: i === 0 || i === schedule.length - 1 || i % Math.max(1, Math.floor(schedule.length / 12)) === 0
                ? p.due_date.slice(5)
                : "",
            scheduled: p.balance_after,
            actual,
        };
    });

    return (
        <Card className="shadow-sm border border-gray-100">
            <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base font-semibold text-paynes-gray">
                    Balance Over Time
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            dy={4}
                            interval={0}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            tickFormatter={(v) =>
                                `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                            }
                            width={44}
                        />
                        <Tooltip
                                        content={<CustomTooltip active={true} payload={[]} label="" currency={currency} />}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={7}
                            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="scheduled"
                            name="Scheduled Balance"
                            stroke="#577399"
                            strokeWidth={2}
                            dot={{ r: 2, fill: "#577399", strokeWidth: 0 }}
                            activeDot={{ r: 4 }}
                        />
                        {hasActuals && (
                            <Line
                                type="monotone"
                                dataKey="actual"
                                name="Actual Balance"
                                stroke="#22c55e"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={{ r: 2, fill: "#22c55e", strokeWidth: 0 }}
                                activeDot={{ r: 4 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
