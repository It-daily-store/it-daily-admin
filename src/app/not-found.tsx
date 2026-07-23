import { AppSidebar } from "@/components/shared/AppSidebar";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex h-screen w-screen bg-background-foreground">
      <AppSidebar />
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Image
          src={"/error-page.png"}
          height={2000}
          width={3000}
          className="h-1/2 w-1/2"
          alt="404 error image"
        />

        <h2 className="pb-3 text-3xl text-gray">OPPS! : (</h2>
        <p className="pb-4 text-lg text-gray">
          The page you requested could not be found
        </p>
        <h3 className="text-lg text-gray">
          Go back to{" "}
          <Link className="primary-btn mt-4 justify-center" href={"/"}>
            Home
          </Link>
        </h3>
      </div>
    </div>
  );
};

export default NotFound;
