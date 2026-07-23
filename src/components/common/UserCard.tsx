"use client";
import useGetAdminData from "@/hooks/useGetAdminData";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserRound } from "lucide-react";
import { TUser } from "@/interface/auth.interface";

const UserCard = ({
  user,
  size = "lg",
}: {
  user: TUser;
  size?: "sm" | "lg";
}) => {
  return (
    <div className="flex gap-2 items-center min-w-40">
      <Avatar className={`${size === "lg" ? "size-10" : "size-7"}`}>
        <AvatarImage className={`object-cover`} src={user?.profilePicture} />
        <AvatarFallback className="capitalize">
          <div className="flex size-10 items-center justify-center rounded-full bg-background">
            <UserRound />
          </div>
        </AvatarFallback>
      </Avatar>
      <div>
        <h2
          className={`font-semibold capitalize text-gray ${size === "sm" ? "text-xs" : "text-base"}`}
        >
          {user?.fullName || "N/A"}
        </h2>
        <h2 className={`text-gray ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {user?.role?.role || "N/A"}
        </h2>
      </div>
    </div>
  );
};

export default UserCard;
