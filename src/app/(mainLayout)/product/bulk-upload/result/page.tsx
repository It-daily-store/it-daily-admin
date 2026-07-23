"use client";
import { TCustomColumnDef } from "@/components/common/GlobalTable/GlobalTable";
import PageHeader from "@/components/common/PageHeader";
import CustomAvatar from "@/components/custom/CustomAvatar";
import EllipsisText from "@/components/custom/EllipsisText";
import SuccessResultTable from "@/components/product/uploadResults/SuccessResultTable";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBrand } from "@/interface/brand.interface";
import {
  TBulkUploadHistory,
  TSuccessData,
} from "@/interface/bulkupload.interface";
import { TCategory } from "@/interface/category";
import { globalError } from "@/lib/utils";
import { useGetAllUploadHistoryQuery } from "@/redux/api/bulkUploadApi";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const BulkUploadResultPage = () => {
  const { data, error, isLoading } = useGetAllUploadHistoryQuery(undefined);
  const [activeHistory, setActiveHistory] = useState<TBulkUploadHistory | null>(
    null,
  );
  const router = useRouter();

  if (error) {
    globalError(error);
  }

  const handleGoToUpdate = (id: string) => {
    router.push(`/product/create-product?updateId=${id}`);
  };

  const columns: TCustomColumnDef<TSuccessData>[] = [
    {
      accessorKey: "_id",
      header: "Serial",
      cell: ({ row }) => {
        return <p>{row.index + 1}</p>;
      },
      id: "_id",
      visible: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <p>{row.getValue("name")}</p>;
      },
      id: "name",
      visible: true,
    },
    // {
    //     accessorKey: 'mainCategory',
    //     header: 'Category',
    //     cell: ({ row }) => {
    //         const category: TCategory = row.original.mainCategory;
    //         return (
    //             <EllipsisText
    //                 width={120}
    //                 className='text-gray'
    //                 text={category?.name}
    //             />
    //         );
    //     },
    //     id: 'mainCategory',
    //     visible: true,
    // },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => {
        const brand: TBrand = row.original.brand;
        return (
          <div className="flex items-center gap-1">
            <CustomAvatar src={brand?.image} />
            <EllipsisText width={60} className="text-gray" text={brand?.name} />
          </div>
        );
      },
      id: "brand",
      visible: true,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt");
        return (
          <div className="min-w-24">
            {dayjs(createdAt as string).format("DD MMM, YYYY")}
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
        const createdAt = row.getValue("createdAt") as string;
        const updatedAt = row.getValue("updatedAt") as string;
        const isSame = createdAt === updatedAt;
        return (
          <div className="min-w-24">
            {!isSame ? (
              dayjs(updatedAt as string).format("DD MMM, YYYY")
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
      accessorKey: "_id",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.getValue("_id");
        return (
          <div className="flex gap-2">
            <Button variant={"view_button"} size={"base"} />
            <Button
              onClick={() => handleGoToUpdate(id as string)}
              variant={"edit_button"}
              size={"base"}
            />
          </div>
        );
      },
      id: "actions",
      visible: true,
    },
  ];

  const handleHistoryOpen = (history: TBulkUploadHistory) => {
    if (activeHistory && activeHistory._id === history._id) {
      setActiveHistory(null);
    } else {
      setActiveHistory(history);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bulk Upload History"
        subtitle="View and Track Bulk Product Upload History"
        buttons={<></>}
      />
      <Tabs defaultValue="upload-history" className="mb-4 w-[400px]">
        <TabsList>
          <TabsTrigger
            onClick={() => router.push("/product/bulk-upload")}
            value="bulk-upload"
          >
            Bulk upload
          </TabsTrigger>
          <TabsTrigger
            onClick={() => router.push("/product/bulk-upload/result")}
            value="upload-history"
          >
            Upload History
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Total Data</TableHead>
              <TableHead>Successfull</TableHead>
              <TableHead>Fails</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((history: TBulkUploadHistory, i: number) => (
              <>
                <TableRow key={history?._id}>
                  <TableCell>
                    <p className="max-w-20">{i + 1}</p>
                  </TableCell>
                  <TableCell>{`${history.totalUploads}`}</TableCell>
                  <TableCell className="flex items-center gap-3">
                    {history.successData?.length}
                  </TableCell>

                  <TableCell className="font-semibold">
                    {history.withError?.length}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>
                        {dayjs(history.createdAt).format("DD MMM, YYYY")}
                      </span>
                      <span className="text-xs">
                        {dayjs(history.createdAt).format("hh:mm A")}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <Avatar />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="icon"
                        size={"sm"}
                        onClick={() => handleHistoryOpen(history)}
                      >
                        <ChevronDown
                          className={`${history._id === activeHistory?._id ? "rotate-180 text-bright-cyan" : ""} transition-all`}
                          size={18}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {activeHistory?._id === history._id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="rounded-sm">
                        <h3 className="text-lg font-semibold">
                          Successfull Uploads
                        </h3>
                        <SuccessResultTable
                          columns={columns}
                          successData={activeHistory?.successData || []}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BulkUploadResultPage;
