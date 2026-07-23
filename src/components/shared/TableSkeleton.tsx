import React from "react";
import { Skeleton } from "../ui/skeleton";

const TableSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Skeleton className="h-12 w-full bg-lavender-mist" />

      {Array.from({ length: 10 }, (item: unknown, i: number) => {
        return <Skeleton key={i} className="h-14 bg-background-foreground" />;
      })}
    </div>
  );
};

export default TableSkeleton;
