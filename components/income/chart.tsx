"use client";

import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  LabelList,
} from "recharts";
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
import { Description } from "@radix-ui/react-dialog";

export default function Chart(props: any) {
  const { filters, income, months } = props;
  const [data, setData] = useState<any[]>([]);
  console.log(income)
  const [ChartConfig, setChartConfig] = useState<ChartConfig>({});

  useEffect(() => {

    const chartData = income.map((item: any, index: any) => ({
      description: item.description,
      net_income: item.net_income,
      fill: "hsl(var(--chart-" + (index + 1) + "))",
    }));
    setData(chartData);

    setChartConfig({
      net_income: {
        label: "Net Income",
      },
      ...chartData,
    } satisfies ChartConfig);
  }, [income]);

  return (
    <div className="mb-6 lg:mb-8">
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center pb-4 px-4 lg:px-6">
          <CardTitle className="text-lg lg:text-xl">
            Income Breakdown
          </CardTitle>
          <CardDescription className="text-center text-sm">
            {months[filters.month]} {filters.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4 px-4 lg:px-6">
          <ChartContainer className="w-full h-64 lg:h-80" config={ChartConfig}>
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
                right: 12,
                left: 12,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="description"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                height={window.innerWidth < 640 ? 80 : 60}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="net_income"
                fill="var(--color-description)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
