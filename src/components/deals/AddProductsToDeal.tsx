import useDebounce from "@/hooks/useDebounce";
import {
  useAddProductsToDealMutation,
  useGetProductsForDealQuery,
} from "@/redux/api/dealsApi";
import React, { useCallback, useState } from "react";
import GlobalTable, {
  TCustomColumnDef,
} from "../common/GlobalTable/GlobalTable";
import { TProduct } from "@/interface/product.interface";
import { Checkbox } from "../ui/checkbox";
import { calculateDiscountPrice } from "@/utils/product.utis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TDealPayloadProduct, TDealProduct } from "@/interface/deals.interface";
import Pagination from "../ui/pagination";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import Image from "next/image";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { globalError } from "@/lib/utils";

const AddProductsToDeal = ({ dealId }: { dealId: string }) => {
  const [searchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const {
    data: productData,
    refetch,
    isLoading,
  } = useGetProductsForDealQuery(
    {
      id: dealId as string,
      params: {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
      },
    },
    { skip: !dealId },
  );

  const [addProducts] = useAddProductsToDealMutation();

  const handleAddProduct = async () => {
    try {
      const payload: TDealPayloadProduct[] = selectedProducts?.map((p) => ({
        productId: p.productId,
        discount: p.discount,
        dealStock: p.dealStock,
      }));

      const res = await addProducts({
        id: dealId as string,
        products: payload,
      }).unwrap();
      if (res) {
        toast.success(res.message);
        setSelectedProducts([]);
        refetch();
      }
    } catch (err) {
      console.log(err);
      globalError(err);
    }
  };

  const products = productData?.data || [];
  const total = productData?.pagination?.total || 0;

  const [selectedProducts, setSelectedProducts] = useState<TDealProduct[]>([]);

  const handleSelectProduct = (product: TProduct) => {
    const exist = selectedProducts?.find((p) => p.productId === product._id);

    if (exist) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.productId !== product._id),
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product?._id,
          discount: product?.discount || {
            value: 0,
            type: "flat",
          },
          dealStock: product?.quantity || 0,
          name: product.name,
          thumbnail: product?.thumbnail,
        },
      ]);
    }
  };

  const isProductSelected = (id: string) => {
    const exist = selectedProducts.find((p) => p.productId === id);
    if (exist) {
      return true;
    }
    return false;
  };

  const handleSelectUnselectAll = (checked: boolean) => {
    if (checked) {
      const updated = [...selectedProducts];
      for (const product of products) {
        if (!updated.find((p) => p.productId === product._id)) {
          updated.push({
            productId: product._id,
            discount: product.discount || { value: 0, type: "flat" },
            dealStock: product.quantity || 0,
            name: product.name,
            thumbnail: product.thumbnail,
          });
        }
      }
      setSelectedProducts(updated);
    } else {
      const updated = selectedProducts.filter(
        (p) => !products.some((prod) => prod._id === p.productId),
      );
      setSelectedProducts(updated);
    }
  };

  const handleSelectedProductChange = (
    id: string,
    key: keyof TDealProduct,
    value: TDealProduct[keyof TDealProduct],
  ) => {
    const updateProducts: TDealProduct[] = [];

    for (const product of selectedProducts) {
      if (product.productId === id) {
        updateProducts.push({ ...product, [key]: value });
      } else {
        updateProducts.push(product);
      }
    }

    setSelectedProducts(updateProducts);
  };

  const checkIfAllSelected = useCallback(() => {
    let checked = true;

    for (const p of products) {
      if (!selectedProducts.find((sp) => sp.productId === p._id)) {
        checked = false;
      }
    }

    return checked;
  }, [products, selectedProducts]);

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== id));
  };

  const columns: TCustomColumnDef<TProduct>[] = [
    {
      accessorKey: "_id",
      id: "_id",
      header: ({ column: _column }) => (
        <Checkbox
          checked={checkIfAllSelected()}
          onCheckedChange={handleSelectUnselectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={isProductSelected(row.original._id)}
          onCheckedChange={() => handleSelectProduct(row.original)}
        />
      ),
      visible: true,
      canHide: false,
      maxSize: 60,
    },
    {
      accessorKey: "name",
      id: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <p className="line-clamp-2 w-full">{row.original.name}</p>
      ),
      visible: true,
      canHide: false,
      maxSize: 250,
    },
    {
      accessorKey: "price",
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <p className="w-full text-primary font-semibold">
          ${row.original.price}
        </p>
      ),
      visible: true,
      canHide: false,
      maxSize: 150,
    },
    {
      accessorKey: "discount",
      id: "discount",
      header: "Discount Price",
      cell: ({ row }) => {
        const discount = row.original.discount;
        const discountPrice = calculateDiscountPrice(
          row.original.price,
          discount,
        );
        return (
          <div>
            <p className="text-black font-medium">${discountPrice}</p>
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
    {
      accessorKey: "quantity",
      id: "quantity",
      header: "Stock",
      cell: ({ row }) => row.original.quantity,
      visible: true,
      canHide: true,
      maxSize: 100,
    },
    {
      accessorKey: "actions",
      id: "actions",
      header: "Stock",
      cell: ({ row }) => row.original.quantity,
      visible: true,
      canHide: false,
      maxSize: 100,
    },
  ];

  return (
    <div className="px-3">
      <p className="text-dark-gray font-medium mb-2">
        Total Selected Products: {selectedProducts.length}
      </p>
      <Tabs defaultValue="product_select">
        <TabsList>
          <TabsTrigger value="product_select">Select Products</TabsTrigger>
          {selectedProducts.length > 0 && (
            <TabsTrigger value="product_add">Add Products</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="product_select" className="overflow-y-auto">
          <GlobalTable
            isLoading={isLoading}
            limit={pagination.limit}
            tableName="add_products_to_deal-table"
            defaultColumns={columns}
            data={products}
            showAddColumn={false}
          />
          <Pagination
            currentPage={pagination.page}
            itemsPerPage={pagination.limit}
            totalItems={total}
            onPageChange={(page, limit) => setPagination({ page, limit })}
          />
        </TabsContent>
        <TabsContent value="product_add">
          {selectedProducts.length > 0 && (
            <div className="space-y-3">
              {selectedProducts?.map((product) => (
                <div
                  key={product.productId}
                  className="space-y-3 p-2 bg-background-foreground shadow-md border rounded-lg"
                >
                  <div className="flex gap-3 items-center">
                    <div className="bg-background p-1 rounded-md">
                      <Image
                        src={product?.thumbnail || "/product-placeholder.jpg"}
                        height={200}
                        width={200}
                        className="size-16 aspect-square"
                        alt="product image"
                      />
                    </div>
                    <h2 className="text-sm">{product?.name}</h2>
                  </div>
                  <div className="flex gap-2 items-end flex-1">
                    <div className="w-full space-y-2">
                      <Label>Product Stock</Label>
                      <Input
                        className="bg-background h-9"
                        onChange={(e) =>
                          handleSelectedProductChange(
                            product.productId,
                            "dealStock",
                            e.target.value,
                          )
                        }
                        min={0}
                        type="number"
                        value={product.dealStock}
                      />
                    </div>
                    <div className="w-full space-y-2">
                      <Label>
                        Discount Type{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        onValueChange={(val: "flat" | "percent") => {
                          handleSelectedProductChange(
                            product.productId,
                            "discount",
                            {
                              type: val,
                              value: product.discount?.value || 0,
                            },
                          );
                        }}
                        value={product.discount?.type}
                      >
                        <SelectTrigger className="bg-background w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="percent">Percent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full space-y-2">
                      <Label>
                        Discount Value{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className="bg-background h-9"
                        onChange={(e) =>
                          handleSelectedProductChange(
                            product.productId,
                            "discount",
                            {
                              type: product.discount?.type || "flat",
                              value: Number(e.target.value),
                            },
                          )
                        }
                        min={0}
                        type="number"
                        value={product.discount?.value}
                      />
                    </div>
                    <Button
                      onClick={() => handleRemoveProduct(product.productId)}
                      tooltip="Remove product"
                      className="shrink-0"
                      size={"icon"}
                      variant={"delete_button"}
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-auto pt-2 justify-end">
            <Button variant={"outline"}>Cancel</Button>
            <Button onClick={handleAddProduct}>Add Products</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddProductsToDeal;
