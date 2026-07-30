import {
  TProductCategory,
  TTreeCategory,
  TUpdateCategory,
} from "@/interface/category";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multiselect";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUpdateCategoryMutation } from "@/redux/api/categories";
import { useGetDetailsCategoriesQuery } from "@/redux/api/detailsCategory";
import ImageSelect from "../common/ImageSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

type TProps = {
  editOpen: boolean;
  setEditOpen: Dispatch<SetStateAction<boolean>>;
  category: TTreeCategory | null;
};

const CategorySchema = z.object({
  name: z
    .string({
      error: "Category name is required",
    })
    .min(1, { message: "Category name is required" }),
  image: z.string(),
  isFeatured: z.boolean(),
  description: z.string({ error: "Description has to be a string" }).optional(),
});

const EditCategory = ({ category, setEditOpen }: TProps) => {
  const [detailsCategoryError, setDetailsCategoryError] = useState<{
    error: boolean;
    message: string;
  }>({ error: false, message: "" });
  const {
    data: detailsCategoryData,
    error,
    isLoading,
  } = useGetDetailsCategoriesQuery(undefined);
  const [detailsCategories, setDetailsCategories] = useState<string[]>([]);
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const selectOptions = detailsCategoryData?.data?.map(
    (item: TProductCategory) => {
      return {
        label: item.name,
        value: item._id,
      };
    },
  );

  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      image: "",
      isFeatured: false,
      description: "",
    },
  });

  useEffect(() => {
    if (category && form) {
      form.reset({
        name: category.name,
        image: category?.image || "",
        isFeatured: category.isFeatured,
        description: category?.description || "",
      });

      setDetailsCategories(
        category.product_details_categories.map((item) => item._id),
      );
    }
  }, [category, form]);

  const onsubmit = async (values: z.infer<typeof CategorySchema>) => {
    setDetailsCategoryError({ error: false, message: "" });

    const product_details_categories = detailsCategories;

    // const check = detailsCategorySchema.safeParse(
    //     product_details_categories,
    // );

    // if (!check.success) {
    //     setDetailsCategoryError({
    //         error: true,
    //         message: check.error.errors[0]?.message,
    //     });

    //     return;
    // }

    const payload: TUpdateCategory = {
      name: values.name,
      product_details_categories,
      isFeatured: values.isFeatured,
      image: values?.image,
      description: values?.description || "",
    };

    if (category) {
      try {
        const res = await updateCategory({
          id: category._id,
          payload,
        }).unwrap();

        if (res.success) {
          toast.success(res.message);

          setEditOpen(false);
          form.reset({
            name: "",
            image: "",
            isFeatured: false,
          });
          setDetailsCategories([]);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field, fieldState }) => (
            <FormItem>
              <label className="text-black">Category Image *</label>
              <ImageSelect value={field.value} onChange={field.onChange} />

              {fieldState.error && (
                <FormMessage className="text-sm text-red">
                  {fieldState.error.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <label className="text-black">Name *</label>
              <Input {...field} placeholder="Enter category name" type="text" />

              {fieldState.error && (
                <FormMessage className="text-sm text-red">
                  {fieldState.error.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <label className="text-black">Description</label>
              <Textarea {...field} placeholder="Enter category description" />

              {fieldState.error && (
                <FormMessage className="text-sm text-red">
                  {fieldState.error.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field, fieldState }) => (
            <FormItem>
              <label className="text-black">Featured</label>
              <Select
                defaultValue={String(field.value)}
                value={String(field.value)}
                onValueChange={(val: string) =>
                  field.onChange(val === "true" ? true : false)
                }
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select featured" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <FormMessage className="text-sm text-red">
                  {fieldState.error.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <label className="text-black">Product Details Category</label>
          {!isLoading && !error && (
            <MultiSelect
              options={selectOptions}
              selected={detailsCategories}
              onChange={(value) => setDetailsCategories(value)}
            />
          )}
          {detailsCategoryError.error && (
            <p className="text-sm text-red">{detailsCategoryError.message}</p>
          )}
        </div>
        <Button loading={isUpdating}>Update Category</Button>
      </form>
    </Form>
  );
};

export default EditCategory;
