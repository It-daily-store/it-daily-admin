import React from "react";
import { Skeleton } from "../ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} className="h-11 bg-background-foreground" />
      ))}
    </div>
  );
};

export default CategorySkeleton;
