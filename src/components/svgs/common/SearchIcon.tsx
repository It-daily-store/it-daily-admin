import { cn } from "@/lib/utils";
import React from "react";

const SearchIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-4 stroke-white", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.0772 12.0997L14.6439 14.6663M13.903 7.65051C13.903 11.1397 11.0839 13.968 7.60721 13.968C4.12971 13.968 1.31055 11.1397 1.31055 7.65134C1.31055 4.16051 4.12971 1.33301 7.60638 1.33301C11.0839 1.33301 13.903 4.16134 13.903 7.65051Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SearchIcon;
