import { cn } from "@/lib/utils";
import React from "react";

const HistoryIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={cn(`size-5 stroke-dark-gray`, className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M18.3327 9.99996C18.3327 14.6 14.5993 18.3333 9.99935 18.3333C5.39935 18.3333 1.66602 14.6 1.66602 9.99996C1.66602 5.39996 5.39935 1.66663 9.99935 1.66663C14.5993 1.66663 18.3327 5.39996 18.3327 9.99996Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0914 12.65L10.5081 11.1083C10.0581 10.8416 9.69141 10.2 9.69141 9.67497V6.2583"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HistoryIcon;
