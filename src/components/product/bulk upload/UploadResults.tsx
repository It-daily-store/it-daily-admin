import { TBulkUploadResults } from "@/interface/product.interface";
import React from "react";

type TProps = {
  results: TBulkUploadResults | null;
};

const UploadResults = ({ results }: TProps) => {
  console.log(results);
  return <div>UploadResults</div>;
};

export default UploadResults;
