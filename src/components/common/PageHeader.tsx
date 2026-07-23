import React, { ReactNode } from "react";

type TProps = {
  title: string | ReactNode;
  subtitle?: string;
  buttons?: ReactNode;
};

const PageHeader = ({ title, subtitle, buttons }: TProps) => {
  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 justify-between pb-4">
      <div>
        <h4 className="page-title">{title}</h4>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="flex gap-2">{buttons}</div>
    </div>
  );
};

export default PageHeader;
