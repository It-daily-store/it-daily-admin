import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ProductSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 ${className}`}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 bg-background-foreground p-2"
        >
          <Skeleton className="mb-2 h-32" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-8" />
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
