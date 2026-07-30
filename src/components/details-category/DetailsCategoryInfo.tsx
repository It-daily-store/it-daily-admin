"use client";
import { TProductCategory } from "@/interface/category";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDeleteDetailsCategoryMutation,
  useUpdateDetailsCategoryMutation,
} from "@/redux/api/detailsCategory";
import { globalError } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "@/components/global/DeleteModal";

type TProps = {
  data: TProductCategory[];
};

interface Field {
  field: string;
  id: string;
}

const nameSchema = z.object({
  name: z
    .string({
      error: "Product category name is required",
    })
    .min(1, { message: "Product category name is required" })
    .max(50),
});

const fieldSchema = z.array(
  z.object({
    field: z
      .string({
        error: "Field cannot be empty",
      })
      .min(1, "Field cannot be an empty string"), // Field must be at least 1 character
    id: z.string(), // Assuming ID is a string
  }),
);

const generateID = () => {
  return Math.random().toString(36).slice(2, 9) + "-" + Date.now();
};

const DetailsCategoryInfo = ({ data }: TProps) => {
  const [openDeleteId, setOpenDeleteId] = useState<null | string>(null);
  const [openEditId, setOpenEditId] = useState<null | string>(null);
  const [selectedCat, setSelectedCat] = useState<null | TProductCategory>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldError, setFieldError] = useState(false);
  const [deleteDetailsCategory, { isLoading: isDeleting }] =
    useDeleteDetailsCategoryMutation();
  const [updateDetailsCategory] = useUpdateDetailsCategoryMutation();

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof nameSchema>) {
    setFieldError(false);
    const result = fieldSchema.safeParse(fields);

    if (result.success === false) {
      setFieldError(true);
      return;
    }

    const payload = {
      name: values.name,
      fields: fields.map((f) => f.field),
    };

    try {
      const res = await updateDetailsCategory({
        id: selectedCat?._id || "",
        payload,
      }).unwrap();
      if (res.success) {
        toast.success(res.message);
        handleCloseModal();
        setFields([
          {
            field: "",
            id: generateID(),
          },
        ]);
        form.reset({
          name: "",
        });
      }
    } catch (err) {
      globalError(err);
    }
  }

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        field: "",
        id: generateID(),
      },
    ]);
  };

  const handleRemoveField = (id: string) => {
    console.log(fields);
    console.log(id);
    const filteredFields = fields.filter((f) => f.id !== id);

    setFields(filteredFields);
  };

  const handleFieldChange = (value: string, id: string) => {
    setFields((prev) => {
      const updatedFields = prev.map((f) => {
        if (f.id === id) {
          return {
            field: value,
            id: f.id,
          };
        } else {
          return f;
        }
      });

      return updatedFields;
    });
  };

  const handleDelete = async (id: string | null) => {
    try {
      const res = await deleteDetailsCategory(id).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
      setOpenDeleteId(null);
    } catch (err) {
      globalError(err);
      setOpenDeleteId(null);
    }
  };

  const handleCloseModal = () => {
    setOpenDeleteId(null);
    setOpenEditId(null);
    setSelectedCat(null);
  };

  useEffect(() => {
    if (openEditId !== null && selectedCat !== null) {
      setFields(
        selectedCat.fields.map((f) => ({
          field: f,
          id: generateID(),
        })),
      );
      form.reset({
        name: selectedCat.name || "",
      });
    }
  }, [openEditId, selectedCat, form]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.length !== 0 &&
        data?.map((cat: TProductCategory) => (
          <div
            className="z-0 flex h-full flex-col rounded-md border bg-background-foreground p-4 transition-all hover:scale-[1.01] hover:shadow-md"
            key={cat._id}
          >
            <h3 className="text-lg font-semibold text-black">{cat.name}</h3>
            <div className="flex flex-grow flex-col gap-2 pt-3">
              {cat.fields?.map((field) => (
                <div
                  className="rounded-[5px] bg-background border px-3 py-[6px] text-gray"
                  key={field}
                >
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-3 flex w-full gap-3">
              <Button
                onClick={() => {
                  setOpenEditId(cat?._id);
                  setSelectedCat(cat);
                }}
                variant={"edit_button"}
                size={"base"}
              ></Button>

              <Button
                variant={"delete_button"}
                size={"base"}
                onClick={() => {
                  setOpenDeleteId(cat?._id);
                  setSelectedCat(cat);
                }}
              ></Button>
            </div>
          </div>
        ))}

      {/* ==============edit category modal============ */}

      <Dialog open={openEditId !== null} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogTitle>Edit details category</DialogTitle>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <label className="text-gray">Name *</label>
                    <Input
                      autoFocus={false}
                      {...field}
                      className="border-gray bg-white text-gray"
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
                  <Button onClick={handleAddField} type="button">
                    Add Field
                  </Button>
                </div>
                {fields?.map((field) => (
                  <div key={field.id}>
                    <div className="flex items-center gap-2">
                      <Input
                        defaultValue={field.field}
                        onChange={(e) =>
                          handleFieldChange(e.target.value, field.id)
                        }
                        className="border-gray bg-white text-gray"
                        placeholder="Enter Field Name"
                        type="text"
                      ></Input>
                      <div
                        onClick={() => handleRemoveField(field.id)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-red text-lg text-red hover:bg-red hover:text-white"
                      >
                        <X />
                      </div>
                    </div>
                    {fieldError &&
                      fields.find((f) => f.id === field.id)?.field === "" && (
                        <p className="pt-1 text-sm text-red">
                          Please enter field name
                        </p>
                      )}
                  </div>
                ))}
                <DialogDescription>
                  {fields.length === 0 && (
                    <p className="text-sm text-red">
                      Please add at least one field
                    </p>
                  )}
                </DialogDescription>
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ===========delete confimation modal=========== */}
      <DeleteModal
        open={openDeleteId !== null}
        onOpenChange={handleCloseModal}
        onConfirm={() => handleDelete(openDeleteId)}
        isLoading={isDeleting}
        title="Delete Category"
        confirmText="Yes, delete it"
      >
        <h3 className="pb-3 text-gray">Name: {selectedCat?.name}</h3>
        <p className="text-gray">
          Do you really want to delete this details category?
        </p>
      </DeleteModal>
    </div>
  );
};

export default DetailsCategoryInfo;
