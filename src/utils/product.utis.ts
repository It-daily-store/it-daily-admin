import { TProduct } from "@/interface/product.interface";

export const calculateDiscountPrice = (
  price: number,
  discount: TProduct["discount"],
) => {
  let discountPrice = price;
  if (!discount) {
    return discountPrice;
  }

  if (discount.type === "flat") {
    discountPrice = Number(price) - Number(discount.value);
  }

  if (discount.type === "percent") {
    discountPrice = price - price * (discount.value / 100);
  }

  return discountPrice;
};
