"use client";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import PageHeader from "@/components/common/PageHeader";
import UserCard from "@/components/common/UserCard";
import CustomAvatar from "@/components/custom/CustomAvatar";
import CreateDealModal from "@/components/deals/CreateDealModal";
import DealCard from "@/components/deals/DealCard";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import { TDeal } from "@/interface/deals.interface";
import { useGetAllDealsQuery } from "@/redux/api/dealsApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Eye, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
dayjs.extend(utc);
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const DealsPage = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<TDeal | null>(null);
  const { data, isLoading } = useGetAllDealsQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch,
  });
  const deals: TDeal[] = data?.data || [];
  const router = useRouter();
  const columns: TCustomColumnDef<TDeal>[] = [
    {
      accessorKey: "_id",
      header: "Serial",
      cell: ({ row }) => {
        return <p>{row.index + 1}</p>;
      },
      id: "_id",
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        return <div className="line-clamp-3">{row.original.title}</div>;
      },
      id: "title",
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <p className="truncate">{row.original.description}</p>;
      },
      id: "description",
      visible: true,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        return <CustomAvatar src={row.original.image || ""} />;
      },
      id: "image",
      visible: true,
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => {
        const startTime = row.original.startTime;
        return (
          <div className="min-w-24">
            {dayjs
              .utc(startTime as string)
              .local()
              .format("DD MMM, YYYY HH:mm")}
          </div>
        );
      },
      id: "startTime",
      visible: true,
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        const endTime = row.original.endTime;
        return (
          <div className="min-w-24">
            {dayjs
              .utc(endTime as string)
              .local()
              .format("DD MMM, YYYY HH:mm")}
          </div>
        );
      },
      id: "endTime",
      visible: true,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <div>
            <p className={isActive ? "text-green-500" : "text-red-500"}>
              {isActive ? "Active" : "Inactive"}
            </p>
          </div>
        );
      },
      id: "isActive",
      visible: true,
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => {
        const products = row.original.products;
        return (
          <div className="min-w-32">
            <p>{products.length} items</p>
          </div>
        );
      },
      id: "products",
      visible: true,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <div className="min-w-24">
            {dayjs
              .utc(createdAt as string)
              .local()
              .format("DD MMM, YYYY")}
          </div>
        );
      },
      id: "createdAt",
      visible: true,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt as string;
        const updatedAt = row.original.updatedAt as string;
        const isSame = createdAt === updatedAt;
        return (
          <div className="min-w-24">
            {!isSame ? (
              dayjs
                .utc(updatedAt as string)
                .local()
                .format("DD MMM, YYYY")
            ) : (
              <span className="text-red-orange">Not updated</span>
            )}
          </div>
        );
      },
      id: "updatedAt",
      visible: true,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        return createdBy ? <UserCard size="sm" user={createdBy} /> : "-";
      },
      id: "createdBy",
      visible: true,
    },
    {
      accessorKey: "lastUpdatedBy",
      header: "Last Updated By",
      cell: ({ row }) => {
        const lastUpdatedBy = row.original.lastUpdatedBy;
        return lastUpdatedBy ? (
          <UserCard size="sm" user={lastUpdatedBy} />
        ) : (
          "-"
        );
      },
      id: "lastUpdatedBy",
      visible: true,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const _id = row.original._id;
        return (
          <div className="flex gap-2">
            <Link href={`/offers/deals/${_id}`}>
              <Button
                tooltip="Add product to deal"
                variant={"create_button"}
                size={"base"}
              ></Button>
            </Link>
            <Button tooltip="View deal" variant={"view_button"} size={"base"} />
            <Button
              onClick={() => {
                setCreateDealOpen(true);
                setSelectedDeal(row.original);
              }}
              tooltip="Edit this deal"
              variant={"edit_button"}
              size={"base"}
            />
            <Button
              tooltip="Delete this deal"
              variant={"delete_button"}
              size={"base"}
            />
          </div>
        );
      },
      id: "actions",
      canHide: false,
      visible: true,
      minSize: 180,
    },
  ];

  return (
    <div>
      <PageHeader
        title="📦 Deals Management"
        subtitle="Create, schedule, and monitor promotional deals to boost product sales."
        buttons={
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setCreateDealOpen(true)}
              tooltip="Add new deal"
            >
              Add Deal
            </Button>
            <Button
              onClick={() => router.push("/offers/deals?view=list")}
              tooltip="List view"
              size={"icon"}
              variant={view !== "grid" ? "secondary" : "secondary_light"}
            >
              <List size={18} />
            </Button>
            <Button
              onClick={() => router.push("/offers/deals?view=grid")}
              tooltip="Grid view"
              size={"icon"}
              variant={view === "grid" ? "secondary" : "secondary_light"}
            >
              <LayoutGrid size={18} />
            </Button>
          </div>
        }
      />
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <DealCard key={deal._id} deal={deal} />
          ))}
          {deals.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No deals found</p>
            </div>
          )}
        </div>
      ) : (
        <GlobalTable
          isLoading={isLoading}
          limit={pagination.limit}
          data={deals}
          defaultColumns={columns}
          tableName="deals_table"
        />
      )}

      <CreateDealModal
        open={createDealOpen}
        setOpen={(open) => {
          setCreateDealOpen(open);
          setSelectedDeal(null);
        }}
        selected={selectedDeal}
      />
    </div>
  );
};

export default DealsPage;
