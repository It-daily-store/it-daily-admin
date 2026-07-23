import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface TData {
  name: string;
  sales: number;
  revenue: number;
}

export function TopProductsChart({ data }: { data: TData[] }) {
  return (
    <Card className="border-border overflow-hidden col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-foreground">
          Top 5 Selling Products
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Best performing products by sales volume and generated revenue
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="max-h-[350px] w-full">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#6b7280" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="sales" fill="#3b82f6" />
            <Bar dataKey="revenue" fill="#10b981" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
