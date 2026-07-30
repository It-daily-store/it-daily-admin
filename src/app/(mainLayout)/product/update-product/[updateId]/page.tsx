"use client";
import { useAppDispatch } from "@/redux/hooks";
import React, { ReactNode, useEffect, useState } from "react";
import AddBasicData from "@/components/product/createProduct/AddBasicData";
import AddSpecifications from "@/components/product/createProduct/AddSpecifications";
import { Button } from "@/components/ui/button";
import {
  useGetSingleProductQuery,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { toast } from "sonner";
import { globalError } from "@/lib/utils";
import AddDescription from "@/components/product/createProduct/AddDescription";
import { ProductValidations } from "@/validations/createProductValidations";
import { ZodError } from "zod";
import AddMetaData from "@/components/product/createProduct/AddMetaData";
import { TProduct } from "@/interface/product.interface";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import PageHeader from "@/components/common/PageHeader";

type TCompByStep = {
  step: number;
  title: string;
  element: ReactNode;
};

const initialProduct: TProduct = {
  _id: "",
  name: "",
  price: 0,
  sku: "",
  brand: "",
  model: "",
  warranty: {
    days: 0,
    lifetime: false,
  },
  key_features: "",
  quantity: 0,
  category: [],
  description: "",
  thumbnail: "",
  slug: "",
  // createdBy: "",
  discount: undefined,
  reviews: [],
  videos: [],
  gallery: [],
  attributes: [],
  filters: [],
  meta: {
    title: "",
    description: "",
    image: "",
  },
  tags: [],
  isFeatured: false,
  sales: 0,
  shipping: {
    free: false,
    cost: 0,
  },
};

const UpdateProduct = () => {
  const dispatch = useAppDispatch();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const router = useRouter();
  const params = useParams();
  const updateId = params.updateId;
  const [product, setProduct] = useState<TProduct>(initialProduct);
  const [step, setStep] = useState(1);

  const { data: updateProductData } = useGetSingleProductQuery(
    updateId as string,
    { skip: !updateId },
  );

  const productData: TProduct | undefined = updateProductData?.data;

  useEffect(() => {
    if (!updateId) {
      router.push("/product/create-product");
    }

    if (productData) {
      setProduct(productData);
    }
  }, [dispatch, productData, updateId]);

  console.log({ product });

  const handleUpdateProduct = async () => {
    if (!product) {
      return;
    }

    try {
      const res = await updateProduct({
        id: updateId as string,
        payload: product,
      }).unwrap();

      if (res) {
        toast.success(res.message);
        setProduct(initialProduct);
        router.push("/product/all-products");
      }
    } catch (err) {
      globalError(err);
    }
  };

  const handleProductChange = (
    key: keyof TProduct,
    value: TProduct[keyof TProduct],
  ) => {
    if (!product) {
      return;
    }

    setProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const compByStep: TCompByStep[] = [
    {
      step: 1,
      title: "General Information",
      element: (
        <AddBasicData
          product={product}
          updateProduct={handleProductChange}
          edit={true}
        />
      ),
    },
    {
      step: 2,
      title: "Attributes",
      element: (
        <AddSpecifications
          product={product}
          updateProduct={handleProductChange}
          edit={true}
        />
      ),
    },
    {
      step: 3,
      title: "Description",
      element: (
        <AddDescription
          product={product}
          updateProduct={handleProductChange}
          edit={true}
        />
      ),
    },
    {
      step: 4,
      title: "Meta Data",
      element: (
        <AddMetaData
          product={product}
          updateProduct={handleProductChange}
          edit={true}
        />
      ),
    },
  ];

  const renderSteps = () => {
    const match = compByStep.find((s) => s.step === step);
    return match ? match.element : <></>;
  };

  const handleNext = async () => {
    if (step === 1) {
      try {
        await ProductValidations.generalDataValidationSchema.parseAsync(
          product,
        );
        setStep((step + 1) as 1 | 2 | 3 | 4);
      } catch (err) {
        if (err instanceof ZodError) {
          console.log(err);
          toast.error(err.issues[0].message);
        }
        return;
      }
    }

    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleStepClick = (clickedStep: number) => {
    if (clickedStep === step) {
      return;
    }

    if (clickedStep > step) {
      handleNext();
    } else {
      handleBack();
    }
  };

  return (
    <>
      <div>
        <PageHeader
          title={updateId === null ? "Create Product" : "Update Product"}
          subtitle="Add New Products to Your Inventory"
        />

        <div className="mb-7 mt-3 flex justify-center px-8 sm:mb-16 sm:px-14 md:px-20">
          {compByStep.map((s) => {
            return (
              <div
                key={s.step}
                className={`flex items-center ${s.step !== compByStep.length ? "w-full" : ""}`}
              >
                <div
                  className="relative flex cursor-pointer flex-col items-center"
                  onClick={() => handleStepClick(s.step)}
                >
                  <div
                    className={`flex size-7 items-center justify-center rounded-full ${s.step <= step ? "bg-primary text-pure-white" : "bg-lavender-mist text-gray"}`}
                  >
                    {s.step}
                  </div>
                  <div
                    className={`absolute top-0 mt-9 hidden text-nowrap text-center sm:block ${s.step <= step ? "text-primary" : "text-gray"}`}
                  >
                    {s.title}
                  </div>
                </div>
                {s.step !== compByStep.length && (
                  <div
                    className={`flex-auto border-t-2 border-dashed border-border-color transition duration-500 ease-in-out ${s.step < step ? "border-primary" : "text-gray"}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {renderSteps()}

        <div className="flex justify-between pt-3">
          {step !== 1 && (
            <Button variant={"edit"} onClick={handleBack}>
              Back
            </Button>
          )}
          {step === 4 && (
            <>
              <Button
                onClick={handleUpdateProduct}
                loading={isUpdating}
                className="mx-auto"
              >
                Update Product
              </Button>
            </>
          )}
          {step !== compByStep.length && (
            <Button className="ms-auto" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateProduct;
