import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

interface IMonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export function RevenueChart({ data }: { data: IMonthlyData[] }) {
  return (
    <Card className="border-border col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-foreground">
          Revenue & Orders Trend
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Monthly revenue and order volume trends over the last 12 months
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
