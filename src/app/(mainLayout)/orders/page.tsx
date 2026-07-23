"use client";
import React, { useState, useEffect } from "react";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import TdUser from "@/components/global/TdUser";
import { globalError } from "@/lib/utils";
import { IOrder } from "@/interface/order.interface";
import { useGetAllOrdersQuery } from "@/redux/api/orderApi";
import Pagination from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export type TOrderFilter = {
  page?: number;
  limit?: number;
  userId?: string;
  discountType?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
  paymentStatus?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const OrdersPage = () => {
  const [filters, setFilters] = useState<TOrderFilter>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    discountType: "all",
    status: "all",
  });

  const { data, isLoading, error } = useGetAllOrdersQuery(filters);
  //   const [updateStatus] = useUpdateOrderStatusMutatio();

  const orders: IOrder[] = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  useEffect(() => {
    if (error) globalError(error);
  }, [error]);

  const handlePageChange = (page: number, limit: number) => {
    setFilters((prev) => ({ ...prev, page, limit }));
  };

  const handleFilterChange = (key: keyof TOrderFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const columns: TCustomColumnDef<IOrder>[] = [
    {
      accessorKey: "_id",
      header: "SL",
      cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
      maxSize: 60,
      canHide: false,
      visible: true,
      id: "_id",
    },
    {
      accessorKey: "orderNumber",
      header: "Order ID",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderNumber}`}>
          <button className="font-mono text-blue-600 hover:underline">
            {row.original.orderNumber}
          </button>
        </Link>
      ),
      maxSize: 150,
      visible: true,
      id: "orderNumber",
    },
    {
      accessorKey: "userInfo",
      header: "Customer",
      cell: ({ row }) => <TdUser user={row.original.userInfo} />,
      minSize: 180,
      visible: true,
      id: "user",
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold">
          ${row.original.totalAmount?.toLocaleString()}
        </span>
      ),
      maxSize: 120,
      visible: true,
      id: "totalAmount",
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.paymentStatus === "paid"
              ? "secondary"
              : row.original.paymentStatus === "failed"
                ? "destructive"
                : "outline"
          }
        >
          {row.original.paymentStatus}
        </Badge>
      ),
      visible: true,
      id: "paymentStatus",
    },
    {
      accessorKey: "currentStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className="capitalize"
          variant={
            row.original.currentStatus === "delivered"
              ? "secondary"
              : row.original.currentStatus === "cancelled" ||
                  row.original.currentStatus === "returned"
                ? "destructive"
                : "outline"
          }
        >
          {row.original.currentStatus}
        </Badge>
      ),
      visible: true,
      id: "currentStatus",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy"),
      maxSize: 140,
      visible: true,
      id: "createdAt",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderNumber}`}>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </Link>
      ),
      maxSize: 140,
      visible: true,
      id: "actions",
    },
  ];

  return (
    <>
      <PageHeader
        title="📦 Orders Management"
        subtitle="View and manage all customer orders with filtering, status updates, and detailed insights"
      />

      <Card className="gap-2 mb-2">
        <CardHeader className="px-3">
          <CardTitle>Filters</CardTitle>
          <p className="text-gray">
            Apply filters to find tailored list or orders
          </p>
        </CardHeader>
        <CardContent className="px-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search Order ID..."
              className="px-3 bg-background flex-1 py-2 border rounded-md text-sm w-48"
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />

            <Select
              value={filters.discountType}
              onValueChange={(value) =>
                handleFilterChange("discountType", value)
              }
            >
              <SelectTrigger className="w-fit bg-background flex-1 h-10!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Discounts</SelectItem>
                <SelectItem value="flashSale">Flash Sale</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="product">Product Discount</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-fit bg-background flex-1 h-10!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <input
              type="number"
              placeholder="Min Price"
              className="px-3 bg-background flex-1 py-2 border rounded-md text-sm w-32"
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Price"
              className="px-3 bg-background flex-1 py-2 border rounded-md text-sm w-32"
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <GlobalTable
        tableName="admin_orders_table"
        data={orders}
        defaultColumns={columns}
        isLoading={isLoading}
        limit={filters.limit}
      />

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={filters.page || 1}
            totalItems={pagination.total}
            itemsPerPage={filters.limit || 20}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default OrdersPage;
