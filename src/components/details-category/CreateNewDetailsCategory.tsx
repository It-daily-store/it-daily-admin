"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import { useCreateDetailsCategoryMutation } from "@/redux/api/detailsCategory";
import { globalError } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

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

const CreateNewDetailsCategory = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldError, setFieldError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [createDetailsCategory, { isLoading: isSubmitting }] =
    useCreateDetailsCategoryMutation();

  useEffect(() => {
    setFields([
      {
        field: "",
        id: generateID(),
      },
    ]);
  }, []);

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof nameSchema>) {
    setFieldError(false);
    console.log(values);

    const validationResult = fieldSchema.safeParse(fields);

    if (validationResult.success === false) {
      setFieldError(true);
      return;
    }

    const payload = {
      name: values.name,
      fields: fields.map((f) => f.field),
    };

    try {
      const result = await createDetailsCategory(payload).unwrap();
      if (result.success) {
        toast.success(result.message);
        form.reset({
          name: "",
        });
        setFields([
          {
            field: "",
            id: generateID(),
          },
        ]);
        setIsOpen(false);
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

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <DialogTrigger>
          <div className="primary-btn">
            <Plus /> Create Details Category
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Create details category</DialogTitle>

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
                    <label className="text-black">Name *</label>
                    <Input
                      {...field}
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
                  <label className="text-black">Fields *</label>
                  <Button onClick={handleAddField} type="button">
                    Add Field
                  </Button>
                </div>
                {fields?.map((field) => (
                  <div key={field.id}>
                    <div className="flex items-center gap-2">
                      <Input
                        onChange={(e) =>
                          handleFieldChange(e.target.value, field.id)
                        }
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
              <Button loading={isSubmitting} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateNewDetailsCategory;
