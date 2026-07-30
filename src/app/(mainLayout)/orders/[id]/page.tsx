"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  User,
  Clock,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-orange-100 text-orange-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "returned":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

import {
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
} from "@/redux/api/orderApi";
import PageHeader from "@/components/common/PageHeader";
import { useEffect } from "react";
import { IOrder } from "@/interface/order.interface";
import dayjs from "dayjs";
import TdUser from "@/components/global/TdUser";

const formSchema = z.object({
  currentStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  paymentMethod: z.enum(["card", "paypal", "bank_transfer", "cod"]),
  shippingMethod: z.enum(["standard", "express", "overnight"]),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
  shippingAddress: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2),
    district: z.string().min(2),
  }),
  billingAddress: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2),
    district: z.string().min(2),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const OrderDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useGetOrderByIdQuery(id as string);
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const order: IOrder = data?.data;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentStatus: "pending",
      paymentStatus: "pending",
      paymentMethod: "cod",
      shippingMethod: "standard",
      trackingNumber: "",
      adminNotes: "",
      shippingAddress: {
        address: "",
        district: "",
        city: "",
      },
      billingAddress: {
        address: "",
        district: "",
        city: "",
      },
    },
  });

  useEffect(() => {
    if (order) {
      form.reset({
        currentStatus: order.currentStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber || "",
        adminNotes: "",
        shippingAddress: {
          address: order.shippingAddress?.address || "",
          district: order.shippingAddress?.district || "",
          city: order.shippingAddress.city || "",
        },
        billingAddress: {
          address: order.billingAddress?.address || "",
          district: order.billingAddress?.district || "",
          city: order.billingAddress.city || "",
        },
      });
    }
  }, [order, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const updateData: any = {
        ...values,
      };

      // Add to status history only if status changed
      if (values.currentStatus !== order.currentStatus) {
        updateData.statusHistory = [
          ...(order.statusHistory || []),
          {
            status: values.currentStatus,
            notes:
              values.adminNotes || `Status changed to ${values.currentStatus}`,
            timestamp: new Date(),
          },
        ];
      }

      await updateOrder({
        id: order._id as string,
        data: updateData,
      }).unwrap();
      toast.success("Order updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center h-[80vh]">
        <Loader className="animate-spin" />
        Loading order data.... Please wait
      </div>
    );
  }
  if (error || !order)
    return <div className="text-center py-10">Order not found</div>;

  return (
    <div className="">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        subtitle="Manage order details, status, shipping, and customer information"
        buttons={
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{order.user?.fullName || "Guest"}</p>
              <p className="text-sm text-dark-gray">{order.user?.email}</p>
              <p className="text-sm text-dark-gray">
                {order.user?.phoneNumber || "No phone"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Placed on</span>
                <span>
                  {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "secondary" : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge className="capitalize">{order.currentStatus}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.couponDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{order.couponDiscount.discountValue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>৳{order.shippingCost}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{order.totalAmount?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>

                <div className="space-y-3">
                  {order.statusHistory.map((status, index) => {
                    const isCompleted = true; // All items in history are completed

                    return (
                      <div
                        key={index}
                        className="relative flex items-start gap-4"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`relative z-10 flex size-6 items-center justify-center rounded-full border-2 ${
                            isCompleted
                              ? "border-primary bg-green-100"
                              : "border-gray-300 bg-gray-100"
                          }`}
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${isCompleted ? "bg-primary" : "bg-gray-300"}`}
                          ></div>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge className={getStatusColor(status.status)}>
                                {status.status.charAt(0).toUpperCase() +
                                  status.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-dark-gray text-sm">
                              {dayjs(status.timestamp).format(
                                "MMMM D, YYYY h:mm A",
                              )}
                            </div>
                          </div>
                          {status.notes && (
                            <p className="text-dark-gray mt-2 text-sm">
                              {status.notes}
                            </p>
                          )}

                          {status.updatedBy && (
                            <div className="space-y-1 mt-2">
                              <div className="shrink-0 text-dark-gray text-sm font-semibold">
                                Updated By:
                              </div>
                              <TdUser user={status.updatedBy} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-4 items-start py-3 border-b last:border-0"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            width={64}
                            height={64}
                            alt={item.name}
                            className="rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-base font-semibold text-dark-gray">
                            Price: ${item.finalPrice?.toLocaleString()}
                          </p>
                          <p className="text-base font-semibold text-dark-gray">
                            Quantity:{" "}
                            <span className="text-primary">
                              {item.quantity}
                            </span>
                          </p>
                          {item.discountApplied?.type && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.discountApplied.type}
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold">
                          ৳{(item.quantity * item.finalPrice)?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Update Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "pending",
                                "confirmed",
                                "processing",
                                "shipped",
                                "delivered",
                                "cancelled",
                                "returned",
                              ].map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="capitalize"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["pending", "paid", "failed", "refunded"].map(
                                (s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                  >
                                    {s}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cod">
                                Cash on Delivery
                              </SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="bank_transfer">
                                Bank Transfer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="overnight">
                                Overnight
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="trackingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tracking Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-background"
                            placeholder="e.g., TRK123456789"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Admin Notes (Will be added to history)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="bg-background"
                            rows={3}
                            placeholder="Customer called and confirmed..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="billingAddress.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="bg-background"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="bg-background"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingAddress.district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="bg-background"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/orders")}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isUpdating}>
                  Save All Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
