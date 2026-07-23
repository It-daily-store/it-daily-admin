import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";

const CustomAvatar = ({
  src,
  fallback,
}: {
  src: string;
  fallback?: string;
}) => {
  return (
    <Avatar className="h-[25px] w-[25px]">
      <AvatarImage height={25} width={25} src={src} />
      <AvatarFallback>
        {fallback ? (
          fallback
        ) : (
          <Image
            src="/brand-fallback.png"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).src =
                "/brand-fallback.png")
            }
            className="object-contain"
            height={25}
            width={25}
            alt="brand image"
          />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
