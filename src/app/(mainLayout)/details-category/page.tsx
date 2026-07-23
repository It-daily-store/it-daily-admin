"use client";

import PageHeader from "@/components/common/PageHeader";
import CreateNewDetailsCategory from "@/components/details-category/CreateNewDetailsCategory";
import DetailsCategoryInfo from "@/components/details-category/DetailsCategoryInfo";
import DetailsCategorySkeleton from "@/components/details-category/DetailsCategorySkeleton";
import { globalError } from "@/lib/utils";
import { useGetDetailsCategoriesQuery } from "@/redux/api/detailsCategory";

const DetailsCategory = () => {
  const { data, error, isLoading } = useGetDetailsCategoriesQuery(undefined);

  if (!isLoading && error) {
    globalError(error);
    return <h3>error</h3>;
  }

  return (
    <>
      <div>
        <PageHeader
          title="Product Details Category"
          subtitle="Define and Manage Product Detail Categories with Custom Fields"
          buttons={<CreateNewDetailsCategory />}
        />

        {!isLoading ? (
          <DetailsCategoryInfo data={data?.data} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => {
              return <DetailsCategorySkeleton key={i} />;
            })}
          </div>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="flex h-48 items-center justify-center text-gray">
            No product details categories available
          </div>
        )}
      </div>
    </>
  );
};

export default DetailsCategory;
