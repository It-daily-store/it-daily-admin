"use client";

import React, { useState } from "react";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import {
  useDeleteUserMutation,
  useGetAllAdminsQuery,
} from "@/redux/api/usersApi";
import { globalError } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeleteModal from "@/components/global/DeleteModal";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import PageHeader from "@/components/common/PageHeader";
import { TUser } from "@/interface/auth.interface";
import { User, CheckCircle, XCircle } from "lucide-react";

const Customers = () => {
  const {
    data: customerData,
    isLoading,
    error,
  } = useGetAllAdminsQuery("customer");
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const { user } = useAppSelector((s) => s.auth);

  if (!isLoading && error) globalError(error);

  const handleDeleteCustomer = async () => {
    if (!deleteOpen) return;
    try {
      const res = await deleteUser({
        id: deleteOpen,
        role: "customer",
      }).unwrap();
      toast.success(res.message || "Customer deleted successfully");
      setDeleteOpen(null);
    } catch (err) {
      globalError(err);
    }
  };

  const columns: TCustomColumnDef<TUser>[] = [
    {
      id: "serial",
      header: "Serial",
      cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
      maxSize: 70,
      visible: true,
      canHide: false,
      accessorKey: "serial",
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name =
          `${row.original.name?.firstName || ""} ${row.original.name?.lastName || ""}`.trim();
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{name || "Unnamed"}</span>
            {user?._id === row.original._id && (
              <Badge variant="outline" className="text-xs">
                Me
              </Badge>
            )}
          </div>
        );
      },
      minSize: 180,
      visible: true,
      canHide: false,
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.profilePicture} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.original.email}</p>
            {row.original.phoneNumber && (
              <p className="text-xs text-muted-foreground">
                {row.original.phoneNumber}
              </p>
            )}
          </div>
        </div>
      ),
      minSize: 250,
      visible: true,
      canHide: false,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role?.role;
        const isDeleted = row.original.role?.isDeleted;

        if (isDeleted) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-red-600 font-medium cursor-help">
                  {role || "unknown"}
                </span>
              </TooltipTrigger>
              <TooltipContent>Role was deleted from system</TooltipContent>
            </Tooltip>
          );
        }
        return (
          <span className="capitalize text-gray-700">{role || "customer"}</span>
        );
      },
      maxSize: 120,
      visible: true,
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary" className="rounded-full">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-full">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Inactive
          </Badge>
        ),
      maxSize: 110,
      visible: true,
    },
    {
      id: "isVerified",
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.isVerified ? (
          <Badge className="rounded-full bg-green-600 text-white">
            Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">
            Not Verified
          </Badge>
        ),
      maxSize: 110,
      visible: true,
    },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-2">
    //       <Button
    //         variant="view_button"
    //         size="base"
    //         onClick={() => router.push(`/users/customers/${row.original._id}`)}
    //         title="View Details"
    //       />
    //       {user?._id !== row.original._id && (
    //         <Button
    //           variant="delete_button"
    //           size="base"
    //           onClick={() => setDeleteOpen(row.original._id)}
    //           title="Delete Customer"
    //         />
    //       )}
    //     </div>
    //   ),
    //   maxSize: 140,
    //   visible: true,
    //   canHide: false,
    //   accessorKey: "actions",
    // },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="View and manage all customer accounts in your system."
      />

      <GlobalTable
        tableName="customers_table"
        data={customerData?.data || []}
        defaultColumns={columns}
        isLoading={isLoading}
        limit={20}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteOpen !== null}
        onOpenChange={() => setDeleteOpen(null)}
        onConfirm={handleDeleteCustomer}
        isLoading={isDeleting}
        title="Delete Customer"
        confirmText="Yes, Delete Customer"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-red-600">
            Are you sure you want to delete this customer?
          </h2>
          <p className="text-sm text-gray-600">
            This action <strong>cannot be undone</strong>. The customer account,
            orders, and related data will be permanently removed.
          </p>
        </div>
      </DeleteModal>
    </>
  );
};

export default Customers;
