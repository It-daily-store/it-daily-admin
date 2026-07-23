import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
}

export function OverviewMetrics({ data }: { data: TData }) {
  const metrics = [
    {
      title: "Total Orders",
      value: data?.totalOrders || 0,
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Total Revenue",
      value: `$${data?.totalRevenue || 0}`,
      bg: "bg-green-50 dark:bg-green-900/30",
    },
    {
      title: "Avg. Order Value",
      value: `$${data?.avgOrderValue?.toFixed(2) || 0}`,
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
    },
    {
      title: "Pending Orders",
      value: data?.pendingOrders || 0,
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className={`border-border gap-2 ${metric.bg}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
