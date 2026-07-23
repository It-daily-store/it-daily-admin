import React, { useState } from "react";
import UploadSvg from "@/components/product/bulk upload/UploadSvg";
import MapFields from "@/components/product/bulk upload/MapFields";
import { useBulkUploadMutation } from "@/redux/api/productApi";
import { toast } from "sonner";
import { globalError } from "@/lib/utils";
import UploadResults from "@/components/product/bulk upload/UploadResults";
import { TBulkUploadResults } from "@/interface/product.interface";
import { TMapedField } from "@/app/(mainLayout)/product/bulk-upload/page";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const BulkUploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mapedFields, setMapedFields] = useState<TMapedField[]>([]);
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [bulkUpload, { isLoading: isUploading }] = useBulkUploadMutation();
  const [results, setResults] = useState<TBulkUploadResults | null>(null);
  const router = useRouter();

  const compByStep: { step: number; title: string }[] = [
    {
      step: 1,
      title: "Select CSV",
    },
    {
      step: 2,
      title: "Map Fields",
    },
    {
      step: 3,
      title: "Upload",
    },
  ];

  const handleBulkUpload = async () => {
    const formData = new FormData();
    formData.append("bulkFile", file as File);
    formData.append("mapedFields", JSON.stringify(mapedFields));

    try {
      const result = await bulkUpload(formData).unwrap();
      if (result) {
        toast.success(result.message);
        setResults(result.data);
        setCurrentTab(3);
      }
    } catch (err) {
      console.log(err);
      globalError(err);
    }
  };

  const handleNext = () => {
    if (currentTab === 2) {
      handleBulkUpload();
      return;
    }
    setCurrentTab((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentTab === 1) {
      return;
    }
    setCurrentTab((prev) => prev - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h4 className="page-title">Bulk Upload</h4>
      </div>
      <div className="mx-auto mt-3 flex w-2/3 flex-col items-center gap-4 rounded-md bg-lavender-mist p-5">
        <div className="mb-7 mt-3 flex w-full justify-center px-8 sm:mb-16 sm:px-14 md:px-20">
          {compByStep.map((s) => {
            return (
              <div
                key={s.step}
                className={`flex items-center ${s.step !== compByStep.length ? "w-full" : ""}`}
              >
                <div className="relative flex cursor-pointer flex-col items-center">
                  <div
                    className={`flex size-7 items-center justify-center rounded-full ${s.step <= currentTab ? "bg-primary text-pure-white" : "bg-lavender-mist text-gray"}`}
                  >
                    {s.step}
                  </div>
                  <div
                    className={`absolute top-0 mt-9 hidden text-nowrap text-center sm:block ${s.step <= currentTab ? "text-primary" : "text-gray"}`}
                  >
                    {s.title}
                  </div>
                </div>
                {s.step !== compByStep.length && (
                  <div
                    className={`flex-auto border-t-2 border-dashed border-border-color transition duration-500 ease-in-out ${s.step < currentTab ? "border-primary" : "text-gray"}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {currentTab === 1 && <UploadSvg setFile={setFile} file={file} />}
        {currentTab === 2 && (
          <MapFields
            mapedFields={mapedFields}
            setMapedFields={setMapedFields}
            file={file}
          />
        )}
        {currentTab === 3 && <UploadResults results={results} />}

        <div className="flex w-full gap-3">
          <Button
            disabled={currentTab === 1 || isUploading}
            className="w-full"
            variant={"secondary"}
            onClick={handleBack}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="w-full"
            disabled={file === null || isUploading}
            loading={isUploading}
          >
            {currentTab === 2 ? "Upload" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadCSV;
