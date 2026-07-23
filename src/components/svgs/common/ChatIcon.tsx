import { cn } from "@/lib/utils";
import React from "react";

const ChatIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-4 stroke-dark-gray", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.9868 7.19334V9.86C11.9868 10.0333 11.9802 10.2 11.9602 10.36C11.8068 12.16 10.7468 13.0533 8.7935 13.0533H8.52684C8.36017 13.0533 8.20016 13.1333 8.10016 13.2667L7.30017 14.3333C6.94684 14.8067 6.3735 14.8067 6.02016 14.3333L5.22015 13.2667C5.13349 13.1533 4.94016 13.0533 4.7935 13.0533H4.52684C2.40017 13.0533 1.3335 12.5267 1.3335 9.86V7.19334C1.3335 5.24001 2.2335 4.18001 4.02684 4.02667C4.18684 4.00667 4.3535 4 4.52684 4H8.7935C10.9202 4 11.9868 5.06667 11.9868 7.19334Z"
        strokeWidth="1.3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6535 4.52659V7.19326C14.6535 9.15326 13.7535 10.2066 11.9602 10.3599C11.9802 10.1999 11.9869 10.0333 11.9869 9.85992V7.19326C11.9869 5.06659 10.9202 3.99992 8.79352 3.99992H4.52686C4.35352 3.99992 4.18686 4.00659 4.02686 4.02659C4.18019 2.23326 5.24019 1.33325 7.19352 1.33325H11.4602C13.5869 1.33325 14.6535 2.39992 14.6535 4.52659Z"
        strokeWidth="1.3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.99684 8.83333H9.00284"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66383 8.83333H6.66983"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.33033 8.83333H4.33633"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChatIcon;
