import { TCategory, TTreeCategory } from "@/interface/category";
import { cn } from "@/lib/utils";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";
import React, { useEffect, useState } from "react";
import { generateCategoryTree } from "../utilities/category/categoryUtils";
import { ChevronDown } from "lucide-react";

export interface TSelectCategory {
  main: boolean;
  id: string;
}

type TProps = {
  categories: TTreeCategory[];
  placeholder?: string;

  onSelect: (ids: TSelectCategory[] | []) => void;
  value: TSelectCategory[];
};

const TreeDropdown = ({
  categories,
  placeholder = "Select Category",
  onSelect,
  value,
}: TProps) => {
  const [selectedCat, setSelectedCat] = useState<TSelectCategory[]>(value);
  const { data: categoryArray } = useGetAllCategoriesQuery(undefined);
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>();

  const createCategoryArray = (
    categoryArray: TCategory[],
    selected: TCategory | undefined,
    data: TSelectCategory[] = [],
  ) => {
    if (!selected) {
      return;
    }

    if (selected.parent_id) {
      data.push({
        main: data.length === 0,
        id: selected._id,
      });
      const parent = categoryArray?.find(
        (cat: TCategory) => cat._id === selected.parent_id,
      );
      createCategoryArray(categoryArray, parent, data);
    } else {
      data.push({
        main: data.length === 0,
        id: selected._id,
      });
    }

    return data;
  };

  useEffect(() => {
    const cat: TCategory | undefined = categoryArray?.data?.find(
      (c: TCategory) => c._id === selectedCat.find((s) => s.main)?.id,
    );
    if (cat) {
      setActiveCat(cat.name);
    } else {
      setActiveCat("");
    }
  }, [selectedCat, categoryArray]);

  useEffect(() => {
    setSelectedCat(value);
  }, [value]);

  const handleCatSelect = (cat: TTreeCategory) => {
    setOpen(false);

    const productCat = createCategoryArray(categoryArray?.data || [], cat);

    onSelect(productCat || []);
    setSelectedCat(productCat || []);
  };

  useEffect(() => {
    const handleClick = () => {
      setOpen(false);
    };

    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  const renderCategory = (categories: TTreeCategory[]) => {
    return (
      <div className="flex flex-col items-start text-gray">
        {categories?.map((cat) => (
          <div key={cat._id}>
            <button
              onClick={() => handleCatSelect(cat)}
              className={`${selectedCat.find((c) => c.id === cat._id) ? "text-primary" : "text-gray"} flex items-center gap-2 pt-1 text-gray`}
            >
              {cat.subCategories?.length !== 0 && <ChevronDown />}
              <span
                className={`${cat.parent_id && cat.subCategories?.length === 0 && "ps-4"} text-inherit`}
              >
                {cat.name}
              </span>
            </button>
            {cat.subCategories?.length !== 0 && (
              <div className="ps-8">{renderCategory(cat.subCategories)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          setOpen(!open);
          e.stopPropagation();
        }}
        className={cn(
          "h-10 w-full rounded-md px-3 border text-start text-sm text-gray",
          `${activeCat ? "bg-background-foreground" : "bg-background-foreground"}`,
        )}
      >
        {activeCat || placeholder}
      </button>

      {open && (
        <div className="absolute top-11 max-h-[400px] overflow-y-auto z-50 w-full rounded-md border border-border-color bg-background p-3 shadow-sm">
          {renderCategory(categories)}
        </div>
      )}
    </div>
  );
};

export default TreeDropdown;
