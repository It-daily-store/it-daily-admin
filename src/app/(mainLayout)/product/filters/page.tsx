"use client";
import PageHeader from "@/components/common/PageHeader";
import Modal from "@/components/custom/Modal";
import DetailsCategorySkeleton from "@/components/details-category/DetailsCategorySkeleton";
const CreateProductFilter = dynamic(
  () => import("@/components/productFilter/CreateProductFilter"),
  {
    ssr: false,
  },
);

import ProductFilterCard from "@/components/productFilter/ProductFilterCard";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TFilter } from "@/interface/product.filter";
import { globalError } from "@/lib/utils";
import {
  useDeleteProductFilterMutation,
  useGetAllProductFiltersQuery,
  useUpdateProductFilterMutation,
} from "@/redux/api/filtersApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updateFilterSchema = z.object({
  title: z
    .string({
      error: "Product category name is required",
    })
    .min(1, { message: "Product category name is required" })
    .max(50),
  options: z
    .array(
      z.object({
        optionId: z.union([z.string(), z.number()]),
        value: z.string(),
      }),
    )
    .min(1, "Option is required"),
});

type TFormType = z.infer<typeof updateFilterSchema>;

const ProductFilterPage = () => {
  const { data, isLoading, error } = useGetAllProductFiltersQuery(undefined);
  const [updateFilter, setUpdateFilter] = useState<TFilter | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<TFilter | null>(null);
  const [updateProductFilter, { isLoading: isUpdating }] =
    useUpdateProductFilterMutation();

  const [deleteProductFilter, { isLoading: isDeleting }] =
    useDeleteProductFilterMutation();

  if (error) {
    globalError(error);
  }

  const form = useForm<TFormType>({
    resolver: zodResolver(updateFilterSchema),
    defaultValues: {
      title: "",
      options: [
        {
          value: "",
        },
      ],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray<TFormType>({
    control: control,
    name: "options",
  });

  const onSubmit = async (values: TFormType) => {
    if (updateFilter === null) {
      return;
    }
    try {
      const res = await updateProductFilter({
        payload: {
          title: values.title,
          filterId: String(updateFilter.filterId),
          options: values.options?.map((op) => ({
            value: op.value,
            ...(op.optionId && { optionId: String(op.optionId) }),
          })),
        },
        id: updateFilter?._id as string,
      }).unwrap();
      toast.success(res.message);
      setUpdateFilter(null);
    } catch (err) {
      globalError(err);
    }
  };

  useEffect(() => {
    if (updateFilter) {
      form.setValue("title", updateFilter.title);
      form.setValue("options", updateFilter.options);
    }
  }, [updateFilter]);

  const handleDeleteFilter = async () => {
    if (deleteOpen === null) {
      return;
    }
    try {
      const res = await deleteProductFilter(deleteOpen?._id as string).unwrap();
      if (res) {
        toast.success(res.message);
        setDeleteOpen(null);
      }
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Product Filters"
        subtitle="Set Up Filter Attributes for Enhanced Inventory Search"
        buttons={
          <>
            <CreateProductFilter />
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => {
            return <DetailsCategorySkeleton key={i} />;
          })}
        </div>
      ) : (
        <ProductFilterCard
          setUpdateFilter={setUpdateFilter}
          setDeleteOpen={setDeleteOpen}
          data={data?.data || []}
        />
      )}

      {/* ================ update filter modal================= */}
      <Modal
        open={updateFilter !== null}
        onOpenChange={() => setUpdateFilter(null)}
        title="Update Filter"
      >
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <label className="text-gray">Name *</label>
                  <Input
                    autoFocus={false}
                    {...field}
                    className="border-gray bg-background text-gray"
                    placeholder="Enter Product Category Name"
                    type="text"
                  ></Input>

                  {fieldState.error && (
                    <FormMessage className="text-sm text-red">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-gray">Fields *</label>
                <Button
                  onClick={() =>
                    append({
                      value: "",
                      optionId: "",
                    })
                  }
                  type="button"
                >
                  Add Attribute
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-center gap-2">
                    <Input
                      {...register(`options.${index}.value`)}
                      className="border-gray bg-background text-gray"
                      placeholder="Enter Option"
                      type="text"
                    />
                    <div
                      onClick={() => remove(index)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-red text-lg text-red hover:bg-red hover:text-white"
                    >
                      <X />
                    </div>
                  </div>
                  {errors.options?.[index] && (
                    <p className="text-red text-sm">
                      {errors.options[index]?.message}
                    </p>
                  )}
                </div>
              ))}
              {/* <DialogDescription>
                                {fields.length === 0 && (
                                    <p className='text-sm text-red'>
                                        Please add at least one field
                                    </p>
                                )}
                            </DialogDescription> */}
            </div>
            <Button type="submit" loading={isUpdating}>
              Submit
            </Button>
          </form>
        </Form>
      </Modal>

      {/* =================delete filte modal=============== */}
      <Modal
        open={deleteOpen !== null}
        onOpenChange={() => setDeleteOpen(null)}
        title="Delete Product Filter"
      >
        <div>
          <h2 className="pb-4 text-red-orange">
            Warning: You are about to delete a product filter.
          </h2>
          <h3 className="pb-2 text-sm">
            #Deleting a filter can have significant consequences for inventory
            filtering and search. Please ensure the following before proceeding:
          </h3>
          <ul className="list-decimal ps-5 text-sm text-gray">
            <li>
              Make sure to check if this filter is added to any products. If yes
              make sure to remove this filter from those products and update
              accordingly.
            </li>
            <li>
              This action will permanently remove the admin’s access and may
              affect critical administrative operations.
            </li>
          </ul>
        </div>

        <div className="flex w-full gap-3 pt-4">
          <Button
            className="w-full"
            variant={"delete_solid"}
            onClick={() => setDeleteOpen(null)}
          >
            Cancel
          </Button>
          <Button
            loading={isDeleting}
            onClick={() => deleteOpen && handleDeleteFilter()}
            className="w-full"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductFilterPage;
