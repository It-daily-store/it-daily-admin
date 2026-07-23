"use client";

import React, { useState } from "react";
import ImageGallery from "../product/ImageGallery";
import { isValidUrl } from "@/lib/utils";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import Image from "next/image";

const ImageSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  console.log(value);

  return (
    <div>
      {!isValidUrl(value) && (
        <Button type="button" className="w-fit" onClick={() => setOpen(true)}>
          Select thumbnail
        </Button>
      )}
      {isValidUrl(value) && (
        <div className="relative">
          <div
            onClick={() => onChange("")}
            className="absolute left-2 top-2 z-40 cursor-pointer bg-lavender-mist text-red"
          >
            <X />
          </div>
          <Image
            src={value}
            height={200}
            width={200}
            alt="gallery img"
            className="h-full object-cover"
          />
        </div>
      )}

      <ImageGallery
        open={open}
        multiselect={false}
        setOpen={setOpen}
        onChange={(val) => onChange(val as string)}
      />
    </div>
  );
};

export default ImageSelect;
