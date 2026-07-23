import { z } from "zod";

// Define the product category schema
const ProductCategorySchema = z.object({
  main: z.boolean({
    error: "Please specify if this is a main category.",
  }),
  id: z
    .string({ error: "Please provide a category ID." })
    .min(1, "Please provide a category ID."),
});

// const ReviewSchema = z.object({
//     rating: z.number({ error: "Please provide a review rating." }),
//     review: z.string({ error: "Please provide review text." })
// });

const MetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

const generalDataValidationSchema = z.object({
  name: z
    .string({ error: "Please enter the product name." })
    .min(1, "Please enter the product name."),
  price: z
    .number({ error: "Please enter the product price." })
    .min(1, "Please enter the product price."),
  discount: z
    .object({
      type: z.string().optional(),
      value: z.number().optional(),
    })
    .optional(),
  sku: z
    .string({ error: "Please provide the product SKU." })
    .min(1, "Please provide the product SKU."),
  brand: z
    .string({ error: "Please specify the product brand." })
    .min(1, "Please specify the product brand."),
  model: z.string().optional(),
  warranty: z.object({
    days: z.number({
      error: "Please provide the warranty period in days.",
    }),
    lifetime: z.boolean({
      error: "Please specify if the warranty is lifetime.",
    }),
  }),
  // reviews: z.array(ReviewSchema).optional(),
  key_features: z
    .string({
      error: "Please enter the key features of the product?.",
    })
    .min(1, "Please enter the key features of the product?."),
  quantity: z
    .number({ error: "Please specify the product quantity." })
    .min(0, "Please specify the product quantity."),
  category: z
    .array(ProductCategorySchema)
    .min(1, "Please select at least one product category."),
  thumbnail: z
    .string({ error: "Please upload a product thumbnail." })
    .min(1, "Please upload a product thumbnail."),
  gallery: z.array(z.string()).optional(),
  filters: z
    .array(
      z.object({
        filter: z.union([z.string(), z.number()]),
        filterId: z.union([z.string(), z.number()]),
        value: z.union([z.string(), z.number()]).refine(
          (val) => {
            if (typeof val === "string") {
              return val.length >= 1;
            }
            if (typeof val === "number") {
              return val >= 1;
            }
            return false;
          },
          { message: "Please select filter value" },
        ),
      }),
    )
    .optional(),
});

const attributeValidationSchema = z.object({
  attributes: z
    .array(
      z.object({
        name: z
          .string({
            error: "Please provide an attribute name.",
          })
          .min(1, "Please provide an attribute name."),
        fields: z.record(z.string(), z.string()),
      }),
    )
    .min(1, "Please add at least one attribute."),
});

// Define the main product schema
export const createProductValidationSchema = z.object({
  description: z
    .string({ error: "Please provide a product description." })
    .min(1, "Please provide a product description."),
  videos: z.array(z.string()).optional(),
  meta: MetaSchema.optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

export const ProductValidations = {
  generalDataValidationSchema,
  attributeValidationSchema,
  createProductValidationSchema,
};
