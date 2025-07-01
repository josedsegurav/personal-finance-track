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

export default function Chart(props: any) {
  const { filters, expenses, months } = props;
  const [data, setData] = useState<any[]>([]);
  const [ChartConfig, setChartConfig] = useState<ChartConfig>({});
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    interface GroupedData {
      store: string;
      total_expense: number;
    }

    interface Expense {
      stores: {
        store_name: string;
      };
      total_expense: number;
    }

    const groupedData = expenses.reduce(
      (acc: Record<string, GroupedData>, expense: Expense) => {
        if (!acc[expense.stores.store_name]) {
          acc[expense.stores.store_name] = {
            store: expense.stores.store_name,
            total_expense: 0,
          };
        }
        acc[expense.stores.store_name].total_expense += expense.total_expense;
        return acc;
      },
      {} as Record<string, GroupedData>
    );

    const chartData = Object.values(
      groupedData as Record<string, GroupedData>
    ).map((item) => ({
      store: item.store,
      total_expense: item.total_expense,
      fill: "var(--color-" + item.store + ")",
    }));
    setData(chartData);

    const chart = chartData.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.store]: {
          label: item.store,
          color: "hsl(var(--chart-" + (index + 1) + "))",
        },
      }),
      {}
    );

    setChartConfig({
      total_expense: {
        label: "Total Expense",
      },
      ...chart,
    } satisfies ChartConfig);
  }, [expenses]);

  return (
    <div className="mb-6 lg:mb-8">
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center pb-4 px-4 lg:px-6">
          <CardTitle className="text-lg lg:text-xl">Expense Breakdown</CardTitle>
          <CardDescription className="text-center text-sm">
            {months[filters.month]} {filters.year} - {filters.store === "all" ? "All Stores" : expenses[0]?.stores.store_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4 px-4 lg:px-6">
          <ChartContainer
            className="w-full h-64 lg:h-80"
            config={ChartConfig}
          >
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
                dataKey="store"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 80 : 60}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="total_expense"
                fill="var(--color-desktop)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}