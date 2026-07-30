import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import ImageGallery from "../ImageGallery";
import { Button } from "@/components/ui/button";
import { isValidUrl } from "@/lib/utils";
import Image from "next/image";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { TProduct } from "@/interface/product.interface";

const AddMetaData = ({
  product,
  updateProduct,
}: {
  edit: boolean;
  product: TProduct;
  updateProduct: (key: keyof TProduct, value: TProduct[keyof TProduct]) => void;
}) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { meta } = product;

  const handleDescriptionChange = (val: string) => {
    updateProduct("meta", {
      title: meta?.title || "",
      description: val,
      image: meta?.image || "",
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-black">Meta Data</h2>

      <div className="mt-3 flex flex-col gap-4">
        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Title</label>
          <Input
            value={meta?.title}
            onChange={(e) =>
              updateProduct("meta", {
                title: e.target.value,
                description: meta?.description || "",
                image: meta?.image || "",
              })
            }
            className="bg-background-foreground"
            placeholder="Enter Product Name"
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="text-sm">Image *</label>
          <div
            className={`flex h-full min-h-52 flex-col items-center justify-center gap-2 rounded-md bg-background-foreground p-3`}
          >
            <div className="grid w-full gap-2 p-3">
              <div className="relative flex h-full max-h-32 items-center justify-center">
                {!isValidUrl(meta?.image || "") && (
                  <Button
                    className="w-fit"
                    onClick={() => setGalleryOpen(true)}
                  >
                    Select thumbnail
                  </Button>
                )}
                {isValidUrl(meta?.image || "") && (
                  <div className="relative">
                    <div
                      onClick={() =>
                        updateProduct("meta", {
                          title: meta?.title || "",
                          description: meta?.description || "",
                          image: "",
                        })
                      }
                      className="absolute left-2 top-2 z-40 cursor-pointer bg-lavender-mist text-red"
                    >
                      <X />
                    </div>
                    <Image
                      src={meta?.image as string}
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

        <div className="mb-3 flex w-full flex-col gap-2">
          <label className="text-sm">Description *</label>
          <Textarea
            value={meta?.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
          />
        </div>
      </div>
      <ImageGallery
        open={galleryOpen}
        multiselect={false}
        setOpen={setGalleryOpen}
        onChange={(val) =>
          updateProduct("meta", {
            title: meta?.title || "",
            description: meta?.description || "",
            image: val as string,
          })
        }
      />
    </div>
  );
};

export default AddMetaData;
