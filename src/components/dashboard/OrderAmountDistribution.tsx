"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface TData {
  range: string;
  orders: number;
}

export function OrderAmountDistribution({ data }: { data: TData[] }) {
  return (
    <Card className="border-border col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">
          Order Amount Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Customer spending distribution across different price ranges
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="max-h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="range" stroke="#6b7280" />
            <YAxis dataKey="orders" stroke="#6b7280" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="orders" fill="#f59e0b" />
            <Legend />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
