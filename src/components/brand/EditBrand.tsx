import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "../custom/Modal";
import { Form, FormField, FormItem } from "../ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageGallery from "../product/ImageGallery";
import { Button } from "../ui/button";
import { TBrand, TUpdateBrand } from "@/interface/brand.interface";
import { useUpdateBrandMutation } from "@/redux/api/brandApi";
import { globalError } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";

type TProps = {
  openBrand: TBrand | null;
  setOpen: Dispatch<SetStateAction<TBrand | null>>;
};

const addBrandSchema = z.object({
  name: z.string({
    error: "Name is required",
  }),
  image: z.string({ error: "Name should be string" }).optional(),
});

const EditBrand = ({ openBrand, setOpen }: TProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [updateBrand, { isLoading: isUpdatingBrand }] =
    useUpdateBrandMutation();
  const form = useForm<z.infer<typeof addBrandSchema>>({
    resolver: zodResolver(addBrandSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: openBrand?.name,
      image: openBrand?.image,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBrand]);

  const handleAddAdmin = async (values: z.infer<typeof addBrandSchema>) => {
    const payload: TUpdateBrand = {
      name: values.name || "",
      image: values.image || "",
    };

    try {
      const res = await updateBrand({
        id: openBrand?._id as string,
        payload,
      }).unwrap();
      if (res) {
        toast.success(res.message);
        form.reset();
        setOpen(null);
      }
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Modal
      open={openBrand !== null}
      onOpenChange={() => setOpen(null)}
      title="Edit brand"
      withTrigger={false}
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
                    <div className="relative w-fit border border-border-color bg-lavender-mist p-1">
                      <button
                        type="button"
                        onClick={() => form.reset({ image: "" })}
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
                      className="flex h-28 items-center justify-center rounded-md border-2 border-dotted border-gray bg-lavender-mist"
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

          <Button loading={isUpdatingBrand}>Update Brand</Button>
        </form>
      </Form>
    </Modal>
  );
};

export default EditBrand;
