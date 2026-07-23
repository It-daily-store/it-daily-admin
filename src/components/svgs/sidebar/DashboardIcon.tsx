import { cn } from "@/lib/utils";
import React from "react";

const DashboardIcon = ({
  className,
}: {
  height?: number;
  width?: number;
  className?: string;
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-4 w-4 ", className)}
    >
      <path
        d="M14.6667 7.26665V2.73331C14.6667 1.73331 14.24 1.33331 13.18 1.33331H10.4867C9.42667 1.33331 9 1.73331 9 2.73331V7.26665C9 8.26665 9.42667 8.66665 10.4867 8.66665H13.18C14.24 8.66665 14.6667 8.26665 14.6667 7.26665Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 13.2667V12.0667C14.6667 11.0667 14.24 10.6667 13.18 10.6667H10.4867C9.42667 10.6667 9 11.0667 9 12.0667V13.2667C9 14.2667 9.42667 14.6667 10.4867 14.6667H13.18C14.24 14.6667 14.6667 14.2667 14.6667 13.2667Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.99992 8.73331V13.2666C6.99992 14.2666 6.57325 14.6666 5.51325 14.6666H2.81992C1.75992 14.6666 1.33325 14.2666 1.33325 13.2666V8.73331C1.33325 7.73331 1.75992 7.33331 2.81992 7.33331H5.51325C6.57325 7.33331 6.99992 7.73331 6.99992 8.73331Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.99992 2.73331V3.93331C6.99992 4.93331 6.57325 5.33331 5.51325 5.33331H2.81992C1.75992 5.33331 1.33325 4.93331 1.33325 3.93331V2.73331C1.33325 1.73331 1.75992 1.33331 2.81992 1.33331H5.51325C6.57325 1.33331 6.99992 1.73331 6.99992 2.73331Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DashboardIcon;
