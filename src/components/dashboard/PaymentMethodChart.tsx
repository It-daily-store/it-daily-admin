import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface TData {
  name: string;
  value: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export function PaymentMethodChart({ data }: { data: TData[] }) {
  return (
    <Card className="border-border col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-foreground">Payment Methods</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Customer preference for payment methods across all completed
          transactions
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
