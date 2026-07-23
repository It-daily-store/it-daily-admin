import Template1 from "@/components/banner/Template1";
import React from "react";

const BannerBuilder = () => {
  const templates = [
    {
      id: 1,
      templateId: "gridSlider",
      component: <Template1 />,
      name: "Grid Slider",
    },
  ];

  return (
    <div>
      {templates?.map((t) => {
        return (
          <div key={t.id}>
            <h2>{t.name}</h2>
            {t.component}
          </div>
        );
      })}
    </div>
  );
};

export default BannerBuilder;
