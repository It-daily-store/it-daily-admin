import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface TData {
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export function ShippingMethodChart({ data }: { data: TData[] }) {
  return (
    <Card className="border-border col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-foreground">Shipping Methods</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Customer preference distribution across standard, express, and
          overnight shipping options
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{}}
          className="aspect-square max-h-[300px] mx-auto w-full"
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={90}
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
