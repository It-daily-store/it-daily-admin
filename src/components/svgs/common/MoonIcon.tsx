import { cn } from "@/lib/utils";
import React from "react";

const MoonIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("h-4.5 w-4.5 stroke-dark-gray", className)}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.02244 9.33774C1.31981 13.4567 4.9296 16.8078 9.24978 16.9918C12.2979 17.1197 15.0238 15.7441 16.6593 13.5767C17.3367 12.6889 16.9732 12.097 15.8416 12.297C15.2881 12.393 14.7181 12.4329 14.1234 12.409C10.0841 12.249 6.77992 8.97783 6.7634 5.11482C6.75514 4.07509 6.97817 3.09134 7.38293 2.19557C7.82899 1.20382 7.29207 0.731944 6.25952 1.15584C2.98841 2.49149 0.749843 5.68267 1.02244 9.33774Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MoonIcon;
