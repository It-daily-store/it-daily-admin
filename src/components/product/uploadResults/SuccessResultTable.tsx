import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import Pagination from "@/components/ui/pagination";
import { TSuccessData } from "@/interface/bulkupload.interface";
import React, { useEffect, useState } from "react";

const SuccessResultTable = ({
  successData,
  columns,
}: {
  successData: TSuccessData[];
  columns: TCustomColumnDef<TSuccessData>[];
}) => {
  const [data, setData] = useState<TSuccessData[]>([]);
  const [currentPage] = useState(1);

  useEffect(() => {
    setData(successData.slice(0, 20));
  }, [successData]);

  const handlePageChange = (page: number, limit: number) => {
    const firstIndex = (page - 1) * limit;
    const lastIndex = firstIndex + limit;
    setData(successData.slice(firstIndex, lastIndex));
  };

  return (
    <>
      <div className="bg-white px-3 py-1">
        <GlobalTable
          tableName="update-result-table"
          defaultColumns={columns}
          data={data}
        />
        <Pagination
          currentPage={currentPage}
          itemsPerPage={20}
          totalItems={successData.length}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default SuccessResultTable;
