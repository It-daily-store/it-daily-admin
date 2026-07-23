import React, { useState } from "react";
import Modal from "../custom/Modal";
import { Form, FormField, FormItem } from "../ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageGallery from "../product/ImageGallery";
import { Button } from "../ui/button";
import { TBrand } from "@/interface/brand.interface";
import { useCreateBrandMutation } from "@/redux/api/brandApi";
import { globalError } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";

const addBrandSchema = z.object({
  name: z.string({
    error: "Name is required",
  }),
  image: z.string({ error: "Name should be string" }).optional(),
});

const CreateBrand = () => {
  const [open, setOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [createBrand, { isLoading: isCreatingBrand }] =
    useCreateBrandMutation();
  const form = useForm<z.infer<typeof addBrandSchema>>({
    resolver: zodResolver(addBrandSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  const handleAddAdmin = async (values: z.infer<typeof addBrandSchema>) => {
    const payload: Pick<TBrand, "name" | "image"> = {
      name: values.name || "",
      image: values.image || "",
    };

    try {
      const res = await createBrand(payload).unwrap();
      if (res) {
        toast.success(res.message);
        form.reset();
        setOpen(false);
      }
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={() => setOpen(!open)}
      title="Add new brand"
      triggerText="Add Brand"
      withTrigger={true}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAddAdmin)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <label>Name *</label>
                  <Input {...field} placeholder="Enter first name" />
                </div>
                {fieldState.error && (
                  <p className="text-red">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <label>Image</label>
                  {form.getValues("image") ? (
                    <div className="relative w-fit border border-border-color bg-background p-1">
                      <button
                        type="button"
                        onClick={() => form.resetField("image")}
                        className="absolute -right-5 -top-1"
                      >
                        <X size={18} />
                      </button>
                      <Image
                        src={form.getValues("image") as string}
                        height={100}
                        width={100}
                        alt="selected brand image"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setGalleryOpen(true)}
                      className="flex h-28 items-center justify-center rounded-md border-2 border-dotted border-gray bg-background text-gray"
                    >
                      Select From Gallery
                    </div>
                  )}
                  <ImageGallery
                    setOpen={setGalleryOpen}
                    multiselect={false}
                    open={galleryOpen}
                    onChange={field.onChange}
                  />
                </div>
                {fieldState.error && (
                  <p className="text-red">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />

          <Button loading={isCreatingBrand}>Add Brand</Button>
        </form>
      </Form>
    </Modal>
  );
};

export default CreateBrand;
