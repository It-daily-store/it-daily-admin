import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useGetDetailsCategoriesQuery } from "@/redux/api/detailsCategory";
import { TCreateCategory, TProductCategory } from "@/interface/category";
import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/redux/api/categories";
import { toast } from "sonner";
import { TParentCat } from "@/app/(mainLayout)/category/page";
import { globalError } from "@/lib/utils";
import { Plus } from "lucide-react";
import slugify from "slugify";
import ImageSelect from "../common/ImageSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { MultiSelect } from "../ui/multiselect";

type TCategoryProps = {
  parent: TParentCat;
  setParent: Dispatch<SetStateAction<TParentCat>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
};

const CategorySchema = z.object({
  name: z
    .string({
      error: "Category name is required",
    })
    .min(1, { message: "Category name is required" }),
  parent_id: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
  isFeatured: z.boolean().optional(),
  description: z.string({ error: "Description has to be a string" }).optional(),
});

const CreateCategory = ({
  parent,
  open,
  setOpen,
  setParent,
}: TCategoryProps) => {
  const [detailsCategories, setDetailsCategories] = useState<string[]>([]);
  const {
    data: detailsCategoryData,
    error,
    isLoading,
  } = useGetDetailsCategoriesQuery(undefined);
  const [detailsCategoryError, setDetailsCategoryError] = useState<{
    error: boolean;
    message: string;
  }>({ error: false, message: "" });

  const { data: categoryData } = useGetAllCategoriesQuery(undefined);

  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateCategoryMutation();

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
      parent_id: "",
      slug: "",
      isFeatured: false,
      image: "",
      description: "",
    },
  });

  useEffect(() => {
    if (parent) {
      form.reset({
        name: "",
        parent_id: parent.id || "",
      });

      setDetailsCategories(
        parent?.product_details_categories?.map((pdc) => pdc._id),
      );
    }
  }, [parent, form, categoryData]);

  const onsubmit = async (values: z.infer<typeof CategorySchema>) => {
    setDetailsCategoryError({ error: false, message: "" });

    const detailsCategorySchema = z.array(z.string()).optional();

    const product_details_categories = detailsCategories;

    const check = detailsCategorySchema.safeParse(product_details_categories);

    if (!check.success) {
      setDetailsCategoryError({
        error: true,
        message: check.error.issues[0]?.message,
      });

      return;
    }

    const payload: TCreateCategory = {
      name: values.name,
      parent_id: values.parent_id || null,
      product_details_categories,
      image: values.image || "",
      isFeatured: values.isFeatured,
      description: values?.description || "",
    };

    if (values.slug) {
      payload.slug = values.slug;
    }

    try {
      const res = await createCategory(payload).unwrap();

      if (res.success) {
        toast.success(res.message);

        setOpen(false);
        form.reset({
          name: "",
          parent_id: "",
        });
        setDetailsCategories([]);
      }
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(!open);
          setParent({
            name: "",
            id: "",
            product_details_categories: [],
          });
        }}
      >
        <DialogTrigger className="primary-btn">
          <Plus size={18} /> Create Category
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Create New Category</DialogTitle>

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
                    <ImageSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                    />

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
                    <Input
                      {...field}
                      placeholder="Enter category name"
                      type="text"
                    />

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
              <FormField
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <label className="text-black">slug</label>
                    <Input
                      defaultValue={slugify(form.watch("name"))}
                      {...field}
                      placeholder="Enter category name"
                      type="text"
                    />

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
                    <Textarea
                      {...field}
                      placeholder="Enter category description"
                    />

                    {fieldState.error && (
                      <FormMessage className="text-sm text-red">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
              {parent.id && (
                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-black">Parent</label>
                      <Input
                        disabled
                        {...field}
                        value={parent.name}
                        type="text"
                      />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-col gap-2">
                <label className="text-black">Product Details Category *</label>
                {!isLoading && !error && (
                  <MultiSelect
                    options={selectOptions}
                    selected={detailsCategories}
                    onChange={(value) => setDetailsCategories(value)}
                  />
                )}
                {detailsCategoryError.error && (
                  <p className="text-sm text-red">
                    {detailsCategoryError.message}
                  </p>
                )}
              </div>
              <Button loading={isCreatingCategory}>Create</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCategory;
