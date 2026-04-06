"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CategorySlice {
    name: string;
    value: number;
    fill: string;
}

interface Props {
    categoryData: CategorySlice[];
    totalSpent: number;
}

function CustomTooltip({ active, payload }: { active: boolean, payload: { name: string, value: number, payload: { pct: string } }[] }) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-paynes-gray">{item.name}</p>
            <p className="text-paynes-gray mt-1">${item.value.toFixed(2)}</p>
            <p className="text-paynes-gray opacity-60">{item.payload.pct}% of spend</p>
        </div>
    );
}

export default function CategoryDonut({ categoryData, totalSpent }: Props) {
    const dataWithPct = categoryData.map(d => ({
        ...d,
        pct: totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(1) : "0",
    }));

    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (categoryData.length === 0) {
        return (
            <Card className="h-full shadow-sm border border-gray-100">
                <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-base font-semibold text-paynes-gray">Spending by Category</CardTitle>
                    <CardDescription className="text-xs text-paynes-gray opacity-60">{currentMonth}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-sm text-paynes-gray opacity-40">No purchases recorded this month</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full shadow-sm border border-gray-100">
            <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base font-semibold text-paynes-gray">Spending by Category</CardTitle>
                <CardDescription className="text-xs text-paynes-gray opacity-60">{currentMonth}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Donut */}
                    <div className="relative flex-shrink-0">
                        <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                                <Pie
                                    data={dataWithPct}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={72}
                                    paddingAngle={2}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {dataWithPct.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip active={true} payload={[]} />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-paynes-gray opacity-50">Total</span>
                            <span className="text-sm font-bold text-paynes-gray">${totalSpent.toFixed(0)}</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <ul className="flex-1 space-y-2 min-w-0">
                        {dataWithPct.map((item, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="text-paynes-gray truncate">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-paynes-gray opacity-50">{item.pct}%</span>
                                    <span className="font-medium text-paynes-gray">${item.value.toFixed(2)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}