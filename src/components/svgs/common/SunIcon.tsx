import { cn } from "@/lib/utils";
import React from "react";

const SunIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-4 stroke-dark-gray", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.99984 12.3332C10.3931 12.3332 12.3332 10.3931 12.3332 7.99984C12.3332 5.6066 10.3931 3.6665 7.99984 3.6665C5.6066 3.6665 3.6665 5.6066 3.6665 7.99984C3.6665 10.3931 5.6066 12.3332 7.99984 12.3332Z"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.7602 12.7602L12.6735 12.6735M12.6735 3.32683L12.7602 3.24016L12.6735 3.32683ZM3.24016 12.7602L3.32683 12.6735L3.24016 12.7602ZM8.00016 1.38683V1.3335V1.38683ZM8.00016 14.6668V14.6135V14.6668ZM1.38683 8.00016H1.3335H1.38683ZM14.6668 8.00016H14.6135H14.6668ZM3.32683 3.32683L3.24016 3.24016L3.32683 3.32683Z"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SunIcon;
