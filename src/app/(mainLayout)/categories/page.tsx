"use client";

import CategorySkeleton from "@/components/categories/CategorySkeleton";
import CreateCategory from "@/components/categories/CreateCategory";
import EditCategory from "@/components/categories/EditCategory";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeleteModal from "@/components/global/DeleteModal";
import { generateCategoryTree } from "@/components/utilities/category/categoryUtils";
import { TCategory, TTreeCategory } from "@/interface/category";
import { globalError } from "@/lib/utils";
import {
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/redux/api/categories";
import { ChevronDown, CircleDot } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export interface TParentCat {
  name: string;
  id: string;
  product_details_categories: TCategory["product_details_categories"];
}

interface TDeleteOpen {
  open: boolean;
  id: string;
  name?: string;
}

const Category = () => {
  const [openCategoryIds, setOpenCategoryIds] = useState<string[] | []>([]);
  const [open, setOpen] = useState(false);
  const {
    data: categoryData,
    error,
    isLoading,
  } = useGetAllCategoriesQuery(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [editCategory, setEditCategory] = useState<TTreeCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<TDeleteOpen>({
    open: false,
    id: "",
  });

  if (!isLoading && error) {
    globalError(error);
  }

  const [parent, setParent] = useState<TParentCat>({
    name: "",
    id: "",
    product_details_categories: [],
  });

  const categories = categoryData?.data || [];

  const handleArrowClick = (
    e: React.MouseEvent,
    id: string,
    hasChildern: boolean,
  ) => {
    e.stopPropagation();

    if (!hasChildern) {
      return;
    }

    const open = openCategoryIds.find((openId) => openId === id);

    if (open) {
      setOpenCategoryIds((prev) => prev.filter((openId) => openId !== id));
    } else {
      setOpenCategoryIds((prev) => {
        return [...prev, id];
      });
    }
  };

  const handleAddClick = (
    parent_id: string,
    name: string,
    product_details_categories: TCategory["product_details_categories"],
  ) => {
    setParent({
      name,
      id: parent_id,
      product_details_categories,
    });
    setOpen(true);
  };

  const handleDeleteClick = async (
    id: string,
    name: string,
    hasChild: boolean,
  ) => {
    if (hasChild) {
      toast.warning(
        "This category has sub-categories. You have to delete the sub-categories first",
      );
      return;
    }

    setDeleteOpen({
      open: true,
      id,
      name,
    });
  };

  const handleDelete = async () => {
    try {
      const result = await deleteCategory(deleteOpen.id).unwrap();

      if (result.success) {
        toast.success(result.message);
        setDeleteOpen({
          open: false,
          id: "",
        });
      }
    } catch (err) {
      globalError(err);
      console.log(err);
    }
  };

  const treeCategory = generateCategoryTree(categories, null);

  const renderCategory = (categories: TTreeCategory[], level: number) => {
    return (
      <div className="">
        {categories?.map((category) => {
          const isSubCatOpen = openCategoryIds.find(
            (id) => id === category._id,
          );
          const { subCategories } = category;

          return (
            <div
              key={category._id}
              className={`my-2 rounded-md px-3 py-3 ${level === 0 ? "px-3" : "pt-2"} ${level === 1 ? "mx-3 bg-background p-3" : "bg-background-foreground"}`}
            >
              <div className="grid grid-cols-2">
                <button
                  onClick={(e) =>
                    handleArrowClick(e, category._id, subCategories.length > 0)
                  }
                  style={{ paddingLeft: `${level * 20}px` }}
                  className={`flex items-center gap-3 font-semibold text-black`}
                >
                  <div
                    className={`flex size-7 items-center justify-center rounded-full bg-background text-sm ${
                      isSubCatOpen && "bg-lavender-mist text-primary"
                    }`}
                  >
                    {subCategories.length > 0 ? (
                      <ChevronDown
                        className={`${isSubCatOpen && "rotate-180 transition-all"}`}
                      />
                    ) : (
                      <CircleDot />
                    )}
                  </div>
                  {category.name}
                </button>
                <div className="flex justify-between">
                  <h2>10</h2>
                  <div className="flex gap-2">
                    {level <= 1 && (
                      <Button
                        onClick={() =>
                          handleAddClick(
                            category._id,
                            category.name,
                            category.product_details_categories,
                          )
                        }
                        variant={"create_button"}
                        size={"base"}
                      ></Button>
                    )}

                    {/* edit category */}
                    <Button
                      onClick={() => {
                        setEditCategory(category);
                        setEditOpen(true);
                      }}
                      variant={"edit_button"}
                      size={"base"}
                    ></Button>

                    {category.subCategories &&
                      category.subCategories.length === 0 && (
                        <Button
                          onClick={() =>
                            handleDeleteClick(
                              category._id,
                              category.name,
                              category.subCategories.length !== 0,
                            )
                          }
                          variant={"delete_button"}
                          size={"base"}
                        ></Button>
                      )}
                  </div>
                </div>
              </div>

              {isSubCatOpen &&
                category.subCategories &&
                category.subCategories?.length !== 0 &&
                renderCategory(category.subCategories, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="text-black">
      <PageHeader
        title="🗂️ Category Management"
        subtitle="Create and organize categories to structure products for easy browsing."
        buttons={
          <CreateCategory
            open={open}
            setOpen={setOpen}
            parent={parent}
            setParent={setParent}
          />
        }
      />

      <div className="text-md grid grid-cols-2 rounded-md bg-lavender-mist p-4 font-semibold">
        <h2>Name</h2>
        <div className="flex justify-between">
          <h2>Products</h2>
          <h2>Actions</h2>
        </div>
      </div>

      {isLoading && <CategorySkeleton />}

      <div className="mt-3 rounded-md">
        {!isLoading && categories.length > 0 && renderCategory(treeCategory, 0)}
      </div>
      {!isLoading && error !== undefined && (
        <div className="flex h-48 items-center justify-center text-gray">
          No categories available
        </div>
      )}

      {/*====================== edit category modal===================== */}

      <Dialog open={editOpen} onOpenChange={() => setEditOpen(!editOpen)}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit Category</DialogTitle>
          <EditCategory
            category={editCategory}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
          />
        </DialogContent>
      </Dialog>

      {/*====================== delete category modal===================== */}

      <DeleteModal
        open={deleteOpen.open}
        onOpenChange={() => setDeleteOpen({ open: false, id: "" })}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Category"
        confirmText="Yes, delete it"
      >
        <h3 className="pb-3 text-dark-gray text-center font-semibold">
          Name: {deleteOpen.name}
        </h3>
        <p className="text-dark-gray text-center font-semibold">
          Do you really want to delete this category?
        </p>
      </DeleteModal>
    </div>
  );
};

export default Category;
