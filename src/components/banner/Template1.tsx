import React from "react";

import Image from "next/image";

type TTemplate1 = {
  id: "gridSlider";
  active: boolean;
  data: {
    sliders: {
      content: string;
      link: string;
    }[];
    right_top: {
      content: string;
      link: string;
    };
    right_bottom: {
      content: string;
      link: string;
    };
  };
};

const template: TTemplate1 = {
  id: "gridSlider",
  active: true,
  data: {
    sliders: [
      {
        content: "https://cdn.example.com/banners/slider1.jpg",
        link: "/products/power-supply",
      },
      {
        content: "https://cdn.example.com/banners/slider2.jpg",
        link: "/campaigns/summer-deals",
      },
    ],
    right_top: {
      content: "https://cdn.example.com/banners/cooler.jpg",
      link: "/products/cpu-coolers",
    },
    right_bottom: {
      content: "https://cdn.example.com/banners/gpu.jpg",
      link: "/products/graphics-cards",
    },
  },
};

const Template1 = () => {
  return (
    <div className="grid grid-cols-[min-max(5fr_3fr)] gap-2">
      <div className="bg-background-foreground rounded-md border border-border-color">
        {template?.data?.sliders?.map((slide, index) => (
          <Image
            key={index}
            src={slide.content}
            height={300}
            width={800}
            alt={slide.link}
            className="w-fit h-[450px] object-cover rounded-md"
          />
        ))}
      </div>
      <div className="space-y-2">
        <div className="bg-background-foreground h-60 rounded-sm border border-border-color"></div>
        <div className="bg-background-foreground h-60 rounded-sm border border-border-color"></div>
      </div>
    </div>
  );
};

export default Template1;
