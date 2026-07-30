import Editor from "@/components/global/editor/Editor";
import { TProduct } from "@/interface/product.interface";
import React from "react";

const AddDescription = ({
  product,
  updateProduct,
}: {
  edit: boolean;
  product: TProduct;
  updateProduct: (key: keyof TProduct, value: TProduct[keyof TProduct]) => void;
}) => {
  const currentProduct = product;

  const { description } = currentProduct;

  return (
    <div>
      <h2 className="text-lg font-semibold text-black">Product Description</h2>
      <p className="pb-5 text-sm text-gray">
        Write a detailed description of the product
      </p>
      <Editor
        className="h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin"
        content={description}
        onChange={(val) => updateProduct("description", val)}
      />
    </div>
  );
};

export default AddDescription;
