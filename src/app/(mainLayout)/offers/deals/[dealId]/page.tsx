"use client";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import PageHeader from "@/components/common/PageHeader";
import AddProductsToDeal from "@/components/deals/AddProductsToDeal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TDeal } from "@/interface/deals.interface";
import { TProduct } from "@/interface/product.interface";
import { useGetSingleDealQuery } from "@/redux/api/dealsApi";
import { calculateDiscountPrice } from "@/utils/product.utis";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const AddProductsToDealPage = () => {
  const params = useParams();
  const dealId = params.dealId;

  const { data } = useGetSingleDealQuery(dealId as string, { skip: !dealId });

  const deal: TDeal = data?.data;
  const products = deal?.products || [];

  const productColumn: TCustomColumnDef<{
    productId: TProduct;
    discount: TProduct["discount"];
    dealStock?: number;
  }>[] = [
    {
      id: "productId",
      accessorKey: "productId",
      header: "Name",
      minSize: 200,
      maxSize: 350,
      cell: ({ row }) => {
        const product = row.original.productId;
        return (
          <div className="flex items-center gap-2">
            <Image
              src={product?.thumbnail || "/product-placeholder.jpg"}
              height={200}
              width={200}
              alt="product thumbnail"
              className="size-20 aspect-square"
            />
            <Link
              href={`${process.env.NEXT_PUBLIC_SHOP_URL}/product/${product.slug}`}
              target="_blank"
            >
              <h2 className="line-clamp-3">{product?.name}</h2>
            </Link>
          </div>
        );
      },
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "serial",
      id: "serial",
      header: "Price",
      cell: ({ row }) => {
        const discount = row.original.discount;
        const discountPrice = calculateDiscountPrice(
          row.original.productId?.price,
          discount,
        );
        return (
          <div>
            <p className="text-black font-medium">${discountPrice}</p>
            <p className="w-full text-xs">
              Original Price: {row.original.productId?.price}
            </p>
          </div>
        );
      },
      visible: true,
      canHide: false,
      minSize: 200,
    },
    {
      accessorKey: "discount",
      id: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const discount = row.original.discount;
        return (
          <div>
            {/* <p className="text-black font-medium">${discountPrice}</p> */}
            <p className="w-full text-xs">
              {discount?.type === "flat" ? "Flat $" : ""}
              {discount?.value}
              {discount?.type === "percent" ? " Percent" : ""}
            </p>
          </div>
        );
      },
      visible: true,
      canHide: false,
      maxSize: 150,
    },
  ];

  return (
    <div>
      <PageHeader
        title="➕ Add Products to Deal"
        subtitle="Select and assign products to promotional deals for better visibility and sales."
        buttons={
          <div>
            <Sheet modal>
              <SheetTrigger asChild>
                <Button>Add Products</Button>
              </SheetTrigger>
              <SheetContent
                className="sm:max-w-4xl h-screen overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                // prevent closing with Esc
                onEscapeKeyDown={(e) => e.preventDefault()}
              >
                <SheetHeader className="pb-0">
                  <SheetTitle>
                    <h2>Add products to this deal</h2>
                  </SheetTitle>
                  <p className="text-sm text-dark-gray">
                    Select products, add custom discount and save
                  </p>
                </SheetHeader>
                {dealId && <AddProductsToDeal dealId={dealId as string} />}
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      <GlobalTable
        defaultColumns={productColumn}
        data={products}
        limit={10}
        tableName="single_deal_table"
      />
    </div>
  );
};

export default AddProductsToDealPage;
