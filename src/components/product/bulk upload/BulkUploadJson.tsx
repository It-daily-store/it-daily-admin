import React, { useState } from "react";
import UploadJson from "./UploadJson";
import { Button } from "@/components/ui/button";
import { useBulkJsonUploadMutation } from "@/redux/api/productApi";
import { toast } from "sonner";
import { globalError } from "@/lib/utils";

const BulkUploadJson = () => {
  const [file, setFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [bulkUpload, { isLoading: isUploading }] = useBulkJsonUploadMutation();

  const compByStep: { step: number; title: string }[] = [
    {
      step: 1,
      title: "Select Json",
    },
    {
      step: 3,
      title: "Upload",
    },
  ];

  const handleBulkUpload = async () => {
    const formData = new FormData();
    formData.append("bulkFile", file as File);

    try {
      const result = await bulkUpload(formData).unwrap();
      if (result) {
        toast.success(result.message);
        // setResults(result.data);
        setCurrentTab(3);
      }
    } catch (err) {
      console.log(err);
      globalError(err);
    }
  };

  const handleNext = () => {
    handleBulkUpload();
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

        {currentTab === 1 && <UploadJson setFile={setFile} file={file} />}

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
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadJson;
