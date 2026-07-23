import React, { useState } from "react";
import Modal from "../custom/Modal";
import { useFieldArray, useForm } from "react-hook-form";
import { FormField, FormItem, Form, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductFilterMutation } from "@/redux/api/filtersApi";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { globalError } from "@/lib/utils";
import { X } from "lucide-react";

const createFilterSchema = z.object({
  title: z
    .string({
      error: "Product category name is required",
    })
    .min(1, { message: "Product category name is required" })
    .max(50),
  options: z.array(z.string().min(1, "Option is required")),
});

type TFormType = z.infer<typeof createFilterSchema>;

const CreateProductFilter = () => {
  const [createFilter, { isLoading: isCreating }] =
    useCreateProductFilterMutation(undefined);
  const [open, setOpen] = useState(false);

  const form = useForm<TFormType>({
    resolver: zodResolver(createFilterSchema),
    defaultValues: {
      title: "",
      options: [""],
    },
  });
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray<any>({
    control: control,
    name: "options",
  });

  const onSubmit = async (values: TFormType) => {
    try {
      const res = await createFilter(values).unwrap();
      if (res) {
        toast.success(res.message);
        setOpen(false);
        form.reset();
      }
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Update Filter"
      withTrigger={true}
      triggerText={"Create New Filter"}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="title"
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
              <Button onClick={() => append("")} type="button">
                Add Attribute
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id}>
                <div className="flex items-center gap-2">
                  <Input
                    {...register(`options.${index}`)}
                    className="border-gray bg-white text-gray"
                    placeholder="Enter Option"
                    type="text"
                  ></Input>
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
          <Button type="submit" loading={isCreating}>
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default CreateProductFilter;
