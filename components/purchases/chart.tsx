"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
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
  const { filters, purchases, months } = props;
  const [data, setData] = useState<any[]>([]);
  const [ChartConfig, setChartConfig] = useState<ChartConfig>({});
  const [isMobile, setIsMobile] = useState(false);

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
      category: string;
      amount: number;
    }

    interface Purchase {
      categories: {
        category_name: string;
      };
      amount: number;
      taxes: number;
    }

    const groupedData = purchases.reduce(
      (acc: Record<string, GroupedData>, purchase: Purchase) => {
        if (!acc[purchase.categories.category_name]) {
          acc[purchase.categories.category_name] = {
            category: purchase.categories.category_name,
            amount: 0,
          };
        }
        acc[purchase.categories.category_name].amount += (((purchase.taxes / 100) * purchase.amount) + purchase.amount);
        return acc;
      },
      {} as Record<string, GroupedData>
    );

    const chartData = Object.values(
      groupedData as Record<string, GroupedData>
    ).map((item) => ({
      category: item.category,
      amount: item.amount,
      fill: "var(--color-" + item.category + ")",
    }));
    setData(chartData);

    const chart = chartData.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.category]: {
          label: item.category,
          color: "hsl(var(--chart-" + (index + 1) + "))",
        },
      }),
      {}
    );

    setChartConfig({
      amount: {
        label: "Total Purchase Amount",
      },
      ...chart,
    } satisfies ChartConfig);
  }, [purchases]);


  return (
    <div className="mb-6 lg:mb-8">
  <Card className="flex flex-col w-full">
    <CardHeader className="items-center pb-4 px-4 lg:px-6">
      <CardTitle className="text-lg lg:text-xl">Expense Breakdown</CardTitle>
      <CardDescription className="text-center text-sm">
        {months[filters.month]} {filters.year} - {filters.category === "all" ? "All Categories" : purchases[0]?.categories.category_name}
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
            dataKey="category"
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
            dataKey="amount"
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
