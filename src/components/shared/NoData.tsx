import Image from "next/image";
import React from "react";

const NoData = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-gray">
      <Image
        src={"/no-data.png"}
        height={400}
        width={400}
        alt="no data image"
      />
      <p className="text-lg font-semibold italic text-red-orange">{text}</p>
    </div>
  );
};

export default NoData;
