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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TrendPoint {
    monthLabel: string;
    income: number;
    expenses: number;
    savings: number;
}

interface Props {
    trendData: TrendPoint[];
}

function CustomTooltip({ active, payload, label }: { active: boolean, payload: { name: string, value: number, color: string }[], label: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-paynes-gray mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex justify-between gap-4 mb-1">
                    <span style={{ color: entry.color }} className="font-medium capitalize">
                        {entry.name}
                    </span>
                    <span className="font-semibold text-paynes-gray">${entry.value.toFixed(2)}</span>
                </div>
            ))}
        </div>
    );
}

export default function TrendChart({ trendData }: Props) {
    const hasSavings = trendData.some(d => d.savings > 0);

    return (
        <Card className="h-full shadow-sm border border-gray-100">
            <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base font-semibold text-paynes-gray">
                    6-Month Trend
                </CardTitle>
                <CardDescription className="text-xs text-paynes-gray opacity-60">
                    Income, expenses{hasSavings ? " and savings" : ""} over the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={trendData}
                        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            dy={4}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                            width={44}
                        />
                        <Tooltip content={<CustomTooltip active={true} payload={[]} label="" />} />
                        <Legend
                            iconType="circle"
                            iconSize={7}
                            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Income"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            name="Expenses"
                            stroke="#FE5F55"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#FE5F55", strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                        {hasSavings && (
                            <Line
                                type="monotone"
                                dataKey="savings"
                                name="Savings"
                                stroke="#577399"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={{ r: 3, fill: "#577399", strokeWidth: 0 }}
                                activeDot={{ r: 5 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}