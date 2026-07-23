import { TUser } from "@/interface/auth.interface";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const TdUser = ({ user }: { user: TUser }) => {
  const defaultFullName = `${user.name?.firstName} ${user.name?.middleName} ${user.name?.lastName}`;

  return (
    <div className="flex items-center gap-2 w-full">
      <Avatar>
        <AvatarImage src={user?.profilePicture} />
        <AvatarFallback />
      </Avatar>
      <div className="w-full truncate">
        {user?.name && (
          <h3 className="font-semibold text-dark-gray truncate">
            {user?.fullName || defaultFullName?.trim()}{" "}
            {user?.role && typeof user.role === "object" && (
              <span className="text-xs text-green-500">
                ({user?.role?.role})
              </span>
            )}
          </h3>
        )}
        <p className="text-gray text-xs truncate">{user?.email}</p>
      </div>
    </div>
  );
};

export default TdUser;
