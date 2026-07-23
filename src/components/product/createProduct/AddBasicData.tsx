"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageGallery from "../ImageGallery";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";
import TreeDropdown, {
  TSelectCategory,
} from "@/components/custom/TreeDropdown";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { TSelectOptions } from "@/components/categories/interface";
import { TBrand } from "@/interface/brand.interface";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, isValidUrl } from "@/lib/utils";
import { MultiSelect, Option } from "@/components/ui/multiselect";
import { useGetAllProductFiltersQuery } from "@/redux/api/filtersApi";
import {
  TProduct,
  TProductAttribute,
  TProductFilter,
} from "@/interface/product.interface";
import { generateCategoryTree } from "@/components/utilities/category/categoryUtils";
import { X } from "lucide-react";
import { TFilter } from "@/interface/product.filter";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { TCategory, TProductCategory } from "@/interface/category";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@/components/global/editor/Editor";

const AddBasicData = ({
  edit,
  product,
  updateProduct,
}: {
  edit: boolean;
  product: TProduct;
  updateProduct: (key: keyof TProduct, value: TProduct[keyof TProduct]) => void;
}) => {
  const dispatch = useAppDispatch();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [thumbOpen, setThumbOpen] = useState(false);
  const { data: categoryData } = useGetAllCategoriesQuery(undefined);
  const { data: brandData } = useGetAllBrandsQuery(undefined);

  const {
    gallery,
    key_features,
    name,
    brand,
    model,
    warranty,
    price,
    quantity,
    discount,
    category,
    shipping,
    thumbnail,
    filters,
    sku,
  } = product;

  const { data: filtersData } = useGetAllProductFiltersQuery(undefined);

  const handleRemoveFromGallery = (img: string) => {
    const filteredGallery = gallery?.filter((image) => image !== img) || [];

    updateProduct("gallery", filteredGallery);
  };
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    product?.filters?.map((f) => f.filter) || [],
  );

  const filtersDropdownData: Option[] = filtersData?.data?.map(
    (filter: TFilter) => {
      return {
        label: filter.title,
        value: filter?._id,
        searchValue: filter.title,
      };
    },
  );

  useEffect(() => {
    if (product && edit) {
      setSelectedFilters(product?.filters?.map((f) => f.filter) || []);
    }
  }, [product, edit]);

  const handleFilterSelect = (val: string[]) => {
    setSelectedFilters(val);
  };

  const handleFilterChange = (value: string | null, filter: string) => {
    const exist = filters?.find((f) => f.filter === filter);
    const filterData: TFilter = filtersData?.data?.find(
      (f: TFilter) => f._id === filter,
    );
    let newfilters: TProductFilter[] = [...(filters || [])];

    if (!exist) {
      newfilters.push({
        filter,
        value: String(value || ""),
        filterId: String(filterData.filterId),
      });
    }

    newfilters =
      (newfilters?.map((f) => {
        if (f.filter === filter) {
          return {
            ...f,
            filterId: String(f.filterId),
            value: String(value),
          };
        } else {
          return f;
        }
      }) as TProductFilter[]) || [];

    updateProduct("filters", newfilters);
  };

  const handleCategoryChange = (value: TSelectCategory[]) => {
    updateProduct("category", value);

    if (value.length !== 0) {
      const category: TCategory | undefined = categoryData?.data.find(
        (cat: TCategory) => cat._id === value.find((c) => c.main)?.id,
      );

      if (category) {
        const attributes = category.product_details_categories.map(
          (item: TProductCategory) => {
            const newAttr: TProductAttribute = {
              name: item.name,
              fields: {},
            };
            item.fields.forEach((field: string) => {
              newAttr.fields[field] = "";
            });
            return newAttr;
          },
        );

        updateProduct("attributes", attributes);
      }
    } else {
      updateProduct("attributes", []);
    }
  };

  const treeCategory = generateCategoryTree(categoryData?.data || []);

  return (
    <>
      <h2 className="pb-5 text-lg font-semibold text-black">
        General Information
      </h2>

      <div className="flex w-full grid-rows-1 flex-col gap-x-4">
        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Name *</label>
          <Input
            value={name}
            onChange={(e) => updateProduct("name", e.target.value)}
            className="bg-background-foreground"
            placeholder="Enter Product Name"
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Category *</label>
          <TreeDropdown
            value={category}
            categories={treeCategory}
            onSelect={handleCategoryChange}
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Brand *</label>
          <Combobox
            placeholder="Select Brand"
            searchPlaceholder="Search Brand"
            emptyPlaceholder="No Brands Found"
            value={brand as string}
            onChange={(val) => updateProduct("brand", val as string)}
            options={brandData?.data?.map((brand: TBrand) => {
              return {
                label: brand.name,
                value: brand._id,
                searchValue: brand.name,
              };
            })}
          />
        </div>
        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Model *</label>
          <Input
            value={model}
            onChange={(e) => updateProduct("model", e.target.value)}
            className={`bg-background-foreground`}
            placeholder="Enter Brand Name"
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">SKU *</label>
          <Input
            value={sku}
            type="text"
            onChange={(e) => updateProduct("sku", e.target.value)}
            className="bg-background-foreground"
            placeholder="Enter product SKU"
          />
        </div>

        {/* ===================filters=================== */}

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Filters</label>
          <MultiSelect
            className="bg-background-foreground"
            selected={selectedFilters}
            onChange={handleFilterSelect}
            placeholder="Select filters"
            options={filtersDropdownData}
          />
        </div>

        {selectedFilters.map((s) => {
          const matchFilter = (filtersData?.data as TFilter[])?.find(
            (f) => f._id === s,
          );
          const options =
            matchFilter?.options.map((op) => ({
              value: String(op.optionId) || "",
              label: op.value,
              searchValue: op.value,
            })) || [];

          return (
            <div key={s} className="mb-3 flex flex-col gap-2">
              <label className="text-sm">{matchFilter?.title} *</label>
              <Combobox
                placeholder={`Select ${matchFilter?.title}`}
                searchPlaceholder={`Search ${matchFilter?.title}`}
                emptyPlaceholder={`No ${matchFilter?.title} Found`}
                value={
                  String(filters?.find((f) => s === f.filter)?.value) || ""
                }
                onChange={(val) => handleFilterChange(val as string, s)}
                options={options}
              />
            </div>
          );
        })}

        <div className="grid gap-x-4 lg:grid-cols-2">
          <div className="mb-3 flex flex-col gap-2">
            <label className="text-sm">Thumbnail *</label>
            <div
              className={cn(
                `flex h-full min-h-52 flex-col items-center justify-center gap-2 rounded-md p-3`,
                `${thumbnail ? "bg-lavender-mist" : "bg-background-foreground"}`,
              )}
            >
              <div className="grid w-full gap-2 p-3">
                <div className="relative flex h-full max-h-32 items-center justify-center">
                  {!isValidUrl(thumbnail) && (
                    <Button
                      className="w-fit"
                      onClick={() => setThumbOpen(true)}
                    >
                      Select thumbnail
                    </Button>
                  )}
                  {isValidUrl(thumbnail) && (
                    <div className="relative">
                      <div
                        onClick={() => updateProduct("thumbnail", "")}
                        className="absolute left-2 top-2 z-40 cursor-pointer bg-lavender-mist text-red"
                      >
                        <X />
                      </div>
                      <Image
                        src={thumbnail}
                        height={200}
                        width={200}
                        alt="gallery img"
                        className="h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2">
            <label className="text-sm">Gallery *</label>
            <div
              className={cn(
                `flex h-full min-h-52 flex-col items-center gap-2 rounded-md bg-background-foreground p-3 ${gallery?.length === 0 && "justify-center"}`,
                `${gallery?.length !== 0 ? "bg-lavender-mist" : "bg-background-foreground"}`,
              )}
            >
              {gallery && gallery?.length <= 5 && (
                <Button className="w-fit" onClick={() => setGalleryOpen(true)}>
                  Select From Gallery
                </Button>
              )}
              <div className="grid w-full grid-cols-5 gap-2 p-3">
                {gallery?.map((img: string) => {
                  return (
                    <div key={img} className="relative max-h-32">
                      <div
                        onClick={() => handleRemoveFromGallery(img)}
                        className="absolute left-2 top-2 z-40 cursor-pointer bg-lavender-mist text-red"
                      >
                        <X />
                      </div>
                      <Image
                        src={img}
                        height={200}
                        width={200}
                        alt="gallery img"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 flex w-full flex-col gap-2">
          <label className="text-sm">Key Features *</label>
          <Editor
            className="h-56 overflow-y-auto overflow-x-hidden scrollbar-thin"
            content={key_features}
            onChange={(val) => updateProduct("key_features", val)}
          />
        </div>
      </div>

      <h2 className="py-5 text-lg font-semibold text-black">
        Product price and stock
      </h2>
      <div className="flex w-full flex-col gap-x-4">
        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Price *</label>
          <Input
            value={price}
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              const price = value === "" ? 0 : Math.ceil(Number(value));
              updateProduct("price", Number(price));
            }}
            className="bg-background-foreground"
            placeholder="Enter Price"
          />
        </div>
        <div className="flex gap-2 w-full">
          <div className="mb-3 flex flex-col gap-2 flex-1">
            <label className="text-sm">Discount Type</label>
            <Select
              value={discount?.type}
              onValueChange={(val) =>
                updateProduct("discount", {
                  type: val as "flat" | "percent",
                  value: discount?.value || 0,
                })
              }
            >
              <SelectTrigger className="sm:h-12">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="percent">Percent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-3 flex flex-col gap-2 flex-1">
            <label className="text-sm">Discount Type</label>
            <Input
              value={discount?.value}
              type="number"
              onChange={(e) =>
                updateProduct("discount", {
                  type: discount?.type as "flat" | "percent",
                  value: Number(e.target.value),
                })
              }
              className="bg-background-foreground"
              placeholder="Enter stock"
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Stock *</label>
          <Input
            value={quantity}
            type="number"
            onChange={(e) =>
              updateProduct("quantity", parseInt(e.target.value))
            }
            className="bg-background-foreground"
            placeholder="Enter stock"
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <p> Shipping *</p>
            <div className="flex items-center gap-2 text-gray">
              <Checkbox
                checked={shipping?.free}
                onClick={(e) => {
                  e.stopPropagation();
                  updateProduct("shipping", {
                    cost: 0,
                    free: !shipping.free,
                  });
                }}
              />
              free
            </div>
          </div>

          <Input
            value={shipping?.cost || ""}
            type="number"
            min={0}
            onChange={(e) => {
              const value = e.target.value;
              const cost = value === "" ? 0 : Math.ceil(Number(value)); // Prevent leading 0
              updateProduct("shipping", {
                cost,
                free: false,
              });
            }}
            className="bg-background-foreground"
            placeholder="Enter warranty"
          />
        </div>
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <p> Warranty (days) *</p>
            <div className="flex items-center gap-2 text-gray">
              <Checkbox
                checked={warranty.lifetime}
                onClick={(e) => {
                  e.stopPropagation();
                  updateProduct("warranty", {
                    days: 0,
                    lifetime: !warranty.lifetime,
                  });
                }}
              />
              lifetime
            </div>
          </div>

          <Input
            value={warranty.days || ""}
            type="number"
            min={0}
            onChange={(e) => {
              const value = e.target.value;
              const days = value === "" ? 0 : Math.ceil(Number(value)); // Prevent leading 0
              updateProduct("warranty", {
                days,
                lifetime: false,
              });
            }}
            className="bg-background-foreground"
            placeholder="Enter warranty"
          />
        </div>
      </div>

      <ImageGallery
        open={thumbOpen}
        multiselect={false}
        setOpen={setThumbOpen}
        onChange={(val) => updateProduct("thumbnail", val as string)}
      />
      <ImageGallery
        open={galleryOpen}
        multiselect={true}
        setOpen={setGalleryOpen}
        onChange={(val) => updateProduct("gallery", val as string[])}
      />
    </>
  );
};

export default React.memo(AddBasicData);
