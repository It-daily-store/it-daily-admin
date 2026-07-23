"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from "@/components/shared/TableSkeleton";
import {
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
} from "@/redux/api/brandApi";
import { TBrand } from "@/interface/brand.interface";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { globalError, isValidUrl } from "@/lib/utils";
import CreateBrand from "@/components/brand/CreateBrand";
import Modal from "@/components/custom/Modal";
import { toast } from "sonner";
import EditBrand from "@/components/brand/EditBrand";
import PageHeader from "@/components/common/PageHeader";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import EllipsisText from "@/components/custom/EllipsisText";
import TdUser from "@/components/global/TdUser";
import { Badge } from "@/components/ui/badge";

const BrandPage = () => {
  const { data: brandData, isLoading, error } = useGetAllBrandsQuery(undefined);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState<TBrand | null>(null);
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  if (!isLoading && error) {
    globalError(error);
  }

  const handleDeleteBrand = async () => {
    if (deleteOpen) {
      try {
        const res = await deleteBrand(deleteOpen).unwrap();
        if (res) {
          toast.success(res.message);
        }
        setDeleteOpen(null);
      } catch (err) {
        globalError(err);
      }
    }
  };

  const defaultColumns: TCustomColumnDef<TBrand>[] = [
    {
      accessorKey: "_id",
      header: "Serial",
      cell: ({ row }) => {
        return <p>{row.index + 1}</p>;
      },
      id: "_id",
      visible: true,
      maxSize: 60,
      canHide: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div>
            <EllipsisText className="text-gray" text={row.original.name} />
          </div>
        );
      },
      id: "name",
      maxSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = isValidUrl(row.original?.image)
          ? row.original.image
          : "/brand-fallback.png";

        return (
          <div>
            <Image
              src={image}
              className="object-contain"
              height={50}
              width={50}
              alt="brand image"
            />
          </div>
        );
      },
      id: "image",
      maxSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => <TdUser user={row.original.createdBy} />,
      id: "createdBy",
      minSize: 150,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original?.isActive ? (
          <Badge className="rounded-full" variant={"secondary"}>
            Active
          </Badge>
        ) : (
          <Badge className="rounded-full" variant={"destructive"}>
            Inactive
          </Badge>
        ),
      id: "isActive",
      minSize: 100,
      maxSize: 150,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Button variant={"view_button"} size={"base"}></Button>
          <Button
            onClick={() => setEditOpen(row.original)}
            variant={"edit_button"}
            size={"base"}
          ></Button>
          <Button
            onClick={() => setDeleteOpen(row.original._id)}
            variant={"delete_button"}
            size={"base"}
          ></Button>
        </div>
      ),
      id: "actions",
      minSize: 150,
      visible: true,
      canHide: false,
    },
  ];

  return (
    <>
      <PageHeader
        subtitle="Add, edit, and organize product brands to keep your catalog structured and recognizable"
        title="🏷️ Brand Management"
        buttons={<CreateBrand />}
      />

      <GlobalTable
        tableName="brands_table"
        data={brandData?.data || []}
        defaultColumns={defaultColumns}
        isLoading={isLoading}
        limit={20}
      />

      {!isLoading && error !== undefined && (
        <div className="flex h-48 items-center justify-center text-gray">
          Admin data unavailable
        </div>
      )}

      <EditBrand openBrand={editOpen} setOpen={setEditOpen} />

      {/* ================= delete brand modal================ */}
      <Modal
        open={deleteOpen !== null}
        onOpenChange={() => setDeleteOpen(null)}
        title="Delete Brand"
      >
        <>
          <div>
            <h2 className="pb-4 text-red-orange">
              Warning: You are about to delete a brand.
            </h2>
            <h3 className="pb-2 text-sm">
              Deleting a brand can have significant consequences for your
              product catalog and customer experience. Please ensure the
              following before proceeding:
            </h3>
            <ul className="list-decimal ps-5 text-sm text-gray">
              <li>
                Verify that the brand is no longer associated with any active
                products or campaigns.
              </li>
              <li>
                Ensure that there are no ongoing dependencies related to this
                brand. This action will permanently remove the brand from your
                system and may affect product visibility and inventory
                management.
              </li>
            </ul>
          </div>

          <div className="flex w-full gap-3 pt-4">
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => setDeleteOpen(null)}
            >
              Cancel
            </Button>
            <Button
              variant={"destructive"}
              loading={isDeleting}
              onClick={handleDeleteBrand}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        </>
      </Modal>
    </>
  );
};

export default BrandPage;
