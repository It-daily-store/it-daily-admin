"use client";
import PageHeader from "@/components/common/PageHeader";
import { OrderAmountDistribution } from "@/components/dashboard/OrderAmountDistribution";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { OverviewMetrics } from "@/components/dashboard/OverviewMetrics";
import { PaymentMethodChart } from "@/components/dashboard/PaymentMethodChart";
import { PaymentStatusChart } from "@/components/dashboard/PaymentStatusChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ShippingMethodChart } from "@/components/dashboard/ShippingMethodChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import MainLayout from "@/components/layouts/MainLayout";
import { useGetDashboarAnalyticsQuery } from "@/redux/api/dashboardApi";

export default function DashboardPage() {
  const { data } = useGetDashboarAnalyticsQuery("2025");

  console.log(data?.data);

  return (
    <MainLayout>
      <div className="">
        {/* Header */}
        <PageHeader
          title="📊 Dashboard"
          subtitle="Welcome back! Here's your sales overview."
        />

        {/* Overview Metrics */}
        <OverviewMetrics data={data?.data?.overview} />

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <RevenueChart data={data?.data?.monthlyStats} />
          <OrderStatusChart data={data?.data?.orderStatusDistribution} />
          <PaymentMethodChart data={data?.data?.paymentMethodDistribution} />
          <TopProductsChart data={data?.data?.topProducts} />
          <OrderAmountDistribution data={data?.data?.orderAmountDistribution} />
          <PaymentStatusChart data={data?.data?.paymentStatusDistribution} />
          <ShippingMethodChart data={data?.data?.shippingMethodDistribution} />
        </div>
      </div>
    </MainLayout>
  );
}
