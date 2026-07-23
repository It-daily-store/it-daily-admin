import React from "react";
import { Skeleton } from "../ui/skeleton";

const DetailsCategorySkeleton = () => {
  return (
    <div className="flex flex-col gap-2 bg-background-foreground p-4">
      <Skeleton className="mb-3 h-8" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
};

export default DetailsCategorySkeleton;
