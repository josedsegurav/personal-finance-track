"use client";

import { useState, useMemo } from "react";
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
import { calculateScenario, type ScenarioResult } from "@/lib/loanScenarioCalculator";
import { saveScenario } from "@/app/home/loans/actions";
import type { LoanScenario } from "@/app/types";
import InlineNotification from "@/components/ui/InlineNotification";
import { formatCurrency } from "@/lib/formatCurrency";

interface Props {
    loanId: string;
    principal: number;
    interestRate: number | null;
    termMonths: number | null;
    startDate: string | null;
    savedScenarios: LoanScenario[];
    currency?: string;
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active: boolean;
    payload: { name: string; value: number; color: string }[];
    label: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-paynes-gray mb-2">Month {label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex justify-between gap-4 mb-1">
                    <span style={{ color: entry.color }} className="font-medium">
                        {entry.name}
                    </span>
                    <span className="font-semibold text-paynes-gray">
                        {formatCurrency(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function ScenarioForm({
    loanId,
    principal,
    interestRate,
    termMonths,
    startDate,
    savedScenarios,
    currency,
}: Props) {
    const [extraMonthly, setExtraMonthly] = useState("");
    const [lumpSum, setLumpSum] = useState("");
    const [lumpSumDate, setLumpSumDate] = useState("");
    const [strategy, setStrategy] = useState<"reduce_term" | "reduce_payment">("reduce_term");
    const [scenarioName, setScenarioName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const result = useMemo<ScenarioResult | null>(() => {
        const extra = parseFloat(extraMonthly) || 0;
        const lump = parseFloat(lumpSum) || 0;
        const rate = interestRate ?? 0;
        const term = termMonths ?? 1;
        const start = startDate ?? new Date().toISOString().slice(0, 10);

        if (extra <= 0 && lump <= 0) return null;

        return calculateScenario({
            principal,
            annualRatePercent: rate,
            termMonths: term,
            startDate: start,
            extraMonthly: extra,
            lumpSum: lump,
            lumpSumDate: lumpSumDate || null,
            strategy,
        });
    }, [extraMonthly, lumpSum, lumpSumDate, strategy, principal, interestRate, termMonths, startDate]);

    const chartData = useMemo(() => {
        if (!result) return [];
        const monthSet: number[] = [];
        const addMonth = (m: number) => {
            if (!monthSet.includes(m)) monthSet.push(m);
        };
        result.baselineSchedule.forEach((s) => addMonth(s.month));
        result.scenarioSchedule.forEach((s) => addMonth(s.month));
        monthSet.sort((a, b) => a - b);
        return monthSet.map((month) => {
            const base = result.baselineSchedule.find((s) => s.month === month);
            const scen = result.scenarioSchedule.find((s) => s.month === month);
            return {
                month: month.toString(),
                Baseline: base?.balance ?? null,
                Scenario: scen?.balance ?? null,
            };
        });
    }, [result]);

    async function handleSave() {
        if (!result || !scenarioName.trim()) return;
        setSaving(true);
        setSaveMsg(null);

        try {
            await saveScenario(loanId, {
                name: scenarioName.trim(),
                extra_monthly: parseFloat(extraMonthly) || 0,
                lump_sum: parseFloat(lumpSum) || 0,
                lump_sum_date: lumpSumDate || null,
                strategy,
                result_payoff_date: result.payoffDate,
                result_months_saved: result.monthsSaved,
                result_interest_saved: result.interestSaved,
            });
            setSaveMsg({ type: "success", text: "Scenario saved" });
            setScenarioName("");
        } catch {
            setSaveMsg({ type: "error", text: "Failed to save scenario" });
        } finally {
            setSaving(false);
        }
    }

    if (!interestRate || !termMonths || !startDate) {
        return (
            <InlineNotification type="warning" message="What-if scenarios require an interest rate, term, and start date. Edit the loan to add these fields." />
        );
    }

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-paynes-gray mb-4">
                    What-If Scenario
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                            Extra Monthly Payment ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={extraMonthly}
                            onChange={(e) => setExtraMonthly(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                            Strategy
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStrategy("reduce_term")}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                    strategy === "reduce_term"
                                        ? "bg-glaucous text-white border-glaucous"
                                        : "bg-white text-paynes-gray border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Reduce Term
                            </button>
                            <button
                                type="button"
                                onClick={() => setStrategy("reduce_payment")}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                    strategy === "reduce_payment"
                                        ? "bg-glaucous text-white border-glaucous"
                                        : "bg-white text-paynes-gray border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Reduce Payment
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                            Lump Sum Payment ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={lumpSum}
                            onChange={(e) => setLumpSum(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                            Lump Sum Date
                        </label>
                        <input
                            type="date"
                            value={lumpSumDate}
                            onChange={(e) => setLumpSumDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-medium text-paynes-gray mb-4">
                        Results
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                        <div>
                            <p className="text-xs text-paynes-gray opacity-60">Payoff Date</p>
                            <p className="font-semibold text-paynes-gray">
                                {result.payoffDate ?? "-"}
                            </p>
                            <p className="text-[10px] text-paynes-gray opacity-50">
                                Baseline: {termMonths} months
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-paynes-gray opacity-60">Months Saved</p>
                            <p className="font-semibold text-green-600">
                                {result.monthsSaved > 0 ? `${result.monthsSaved} months` : "—"}
                            </p>
                            <p className="text-[10px] text-paynes-gray opacity-50">
                                Baseline: {result.baselineMonths} months
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-paynes-gray opacity-60">Interest Saved</p>
                            <p className="font-semibold text-green-600">
                                {result.interestSaved > 0 ? formatCurrency(result.interestSaved) : "—"}
                            </p>
                            <p className="text-[10px] text-paynes-gray opacity-50">
                                Baseline: {formatCurrency(result.baselineTotalInterest)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-paynes-gray opacity-60">Scenario Interest</p>
                            <p className="font-semibold text-paynes-gray">
                                {formatCurrency(result.scenarioTotalInterest)}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <Card className="shadow-sm border border-gray-100 mb-4">
                        <CardHeader className="pb-2 px-5 pt-5">
                            <CardTitle className="text-sm font-semibold text-paynes-gray">
                                Balance Comparison
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
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: "#6b7280" }}
                                        dy={4}
                                        interval={Math.floor(chartData.length / 12)}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: "#6b7280" }}
                                        tickFormatter={(v) =>
                                            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : formatCurrency(v, currency)
                                        }
                                        width={44}
                                    />
                                    <Tooltip
                                        content={
                                            <ChartTooltip active={true} payload={[]} label="" />
                                        }
                                    />
                                    <Legend
                                        iconType="circle"
                                        iconSize={7}
                                        wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Baseline"
                                        stroke="#6b7280"
                                        strokeWidth={2}
                                        strokeDasharray="5 3"
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Scenario"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {saveMsg && (
                        <InlineNotification
                            type={saveMsg.type}
                            message={saveMsg.text}
                            className="mb-3"
                        />
                    )}
                    {/* Save */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <input
                            type="text"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Name this scenario…"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !scenarioName.trim()}
                            className="px-4 py-1.5 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                        >
                            {saving ? "Saving…" : "Save Scenario"}
                        </button>
                    </div>
                </div>
            )}

            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-medium text-paynes-gray mb-3">
                        Saved Scenarios
                    </h2>
                    <div className="space-y-2">
                        {savedScenarios.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-xs"
                            >
                                <div>
                                    <p className="font-medium text-paynes-gray">{s.name}</p>
                                    <p className="text-paynes-gray opacity-60">
                                        {s.extra_monthly > 0
                                            ? `${formatCurrency(s.extra_monthly, currency)}/mo extra · `
                                            : ""}
                                        {s.lump_sum > 0
                                            ? `${formatCurrency(s.lump_sum, currency)} lump sum · `
                                            : ""}
                                        {s.strategy === "reduce_term" ? "Reduce term" : "Reduce payment"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {s.result_months_saved != null && s.result_months_saved > 0 && (
                                        <p className="text-green-600 font-medium">
                                            {s.result_months_saved} months saved
                                        </p>
                                    )}
                                    {s.result_interest_saved != null &&
                                        s.result_interest_saved > 0 && (
                                            <p className="text-green-600">
                                                {formatCurrency(s.result_interest_saved)} saved
                                            </p>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!result && savedScenarios.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-sm text-paynes-gray opacity-40 mb-2">
                        No scenarios yet
                    </p>
                    <p className="text-xs text-paynes-gray opacity-30">
                        Enter an extra monthly payment or lump sum above to see the impact on your loan.
                    </p>
                </div>
            )}
        </div>
    );
}
