"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Chart(props: any) {
  const { totalExpenses, totalNetIncome } = props;
  const [data, setData] = useState<any[]>([
    {
      description: "Total Net Income",
      total: totalNetIncome,
      fill: "hsl(var(--chart-1))",
    },
    {
      description: "Total Expenses",
      total: totalExpenses,
      fill: "hsl(var(--chart-2))",
    },
  ]);

  const [ChartConfig, setChartConfig] = useState<ChartConfig>({
    total: {
      label: "Total",
    },
  } satisfies ChartConfig);

  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(currentDate);

  return (
    <div className="mb-4 lg:mb-8">
      <Card className="flex flex-col w-full shadow-sm border border-gray-100">
        <CardHeader className="items-center pb-3 lg:pb-4 px-3 lg:px-6 pt-4 lg:pt-6">
          <CardTitle className="text-base lg:text-xl font-semibold text-paynes-gray text-center">
            Month Breakdown
          </CardTitle>
          <CardDescription className="text-center text-xs lg:text-sm text-paynes-gray opacity-70 mt-1">
            {currentMonth} {currentDate.getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-3 lg:pb-4 px-2 lg:px-6">
          <ChartContainer
            className="w-full h-48 sm:h-56 lg:h-80"
            config={ChartConfig}
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                top: 10,
                right: 8,
                left: 8,
                bottom: 20,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="description"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{
                  fontSize: window.innerWidth < 640 ? 9 : 11,
                  fill: "#6b7280",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={10}
                tick={{
                  fontSize: window.innerWidth < 640 ? 9 : 11,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="total"
                fill="var(--color-description)"
                radius={[2, 2, 0, 0]}
                maxBarSize={window.innerWidth < 640 ? 30 : 50}
              />
            </BarChart>
          </ChartContainer>

          {/* Mobile Summary Cards - Show below chart on small screens */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-xs text-paynes-gray opacity-70">Highest</div>
              <div className="text-sm font-semibold text-bittersweet">
                ${Math.max(...data.map((d) => d.total)).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-xs text-paynes-gray opacity-70">Total</div>
              <div className="text-sm font-semibold text-paynes-gray">
                ${data.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
