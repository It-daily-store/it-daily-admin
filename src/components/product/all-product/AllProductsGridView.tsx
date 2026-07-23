import UserCard from "@/components/common/UserCard";
import { Button } from "@/components/ui/button";
import { TUser } from "@/interface/auth.interface";
import { TBrand } from "@/interface/brand.interface";
import { TProduct } from "@/interface/product.interface";
import { isValidUrl } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import React from "react";

const AllProductsGridView = ({ data }: { data: TProduct[] }) => {
  const router = useRouter();

  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 pt-2">
      {data.map((product) => {
        const isValid = isValidUrl(
          product?.thumbnail || (product?.gallery?.[0] as string),
        );

        const createdAt = product?.createdAt as string;
        const updatedAt = product?.updatedAt as string;
        const isSame = createdAt === updatedAt;

        return (
          <div
            key={product?._id}
            className="flex flex-col gap-2 border border-border-color p-2 rounded-md bg-background-foreground"
          >
            <Image
              className="h-32 w-full object-cover"
              alt="product image"
              src={
                isValid
                  ? ((product?.thumbnail || product?.gallery?.[0]) as string)
                  : "/product-placeholder.jpg"
              }
              height={100}
              width={200}
            />
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  Name:
                </h2>
                <h2 className="text-sm col-span-2 text-gray">
                  {product?.name}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  Category:
                </h2>
                <h2 className="text-sm col-span-2 text-gray">
                  {product?.mainCategory?.name}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  Brand:
                </h2>
                <h2 className="text-sm col-span-2 text-gray">
                  {(product?.brand as TBrand)?.name}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  Price:
                </h2>
                <h2 className="text-sm col-span-2 text-primary-text">
                  ${product?.price}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  CreatedAt:
                </h2>
                <div className="text-gray text-sm col-span-2">
                  {dayjs(product?.createdAt as string).format("DD MMM, YYYY")}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  UpdatedAt:
                </h2>
                <div className="text-gray text-sm col-span-2">
                  {!isSame ? (
                    dayjs(createdAt as string).format("DD MMM, YYYY")
                  ) : (
                    <span className="text-red-orange">Not updated</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 items-center">
                <h2 className="text-sm col-span-1 font-semibold text-gray">
                  CreatedBy:
                </h2>
                <div className="text-gray text-sm col-span-2">
                  <UserCard user={product?.createdBy as TUser} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-3">
              <Button variant={"view_button"} size={"base"} />
              <Button
                onClick={() =>
                  router.push(`/product/update-product/${product?._id}`)
                }
                variant={"edit_button"}
                size={"base"}
              />
              <Button variant={"delete_button"} size={"base"} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllProductsGridView;
