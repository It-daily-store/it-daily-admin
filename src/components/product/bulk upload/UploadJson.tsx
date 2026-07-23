import { Button } from "@/components/ui/button";
import { Combobox, Option } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multiselect";
import { TFilter } from "@/interface/product.filter";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";
import { useGetAllProductFiltersQuery } from "@/redux/api/filtersApi";
import { useDownloadJsonTemplateMutation } from "@/redux/api/productApi";
import { CloudUpload, Trash } from "lucide-react";
import React, {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";

type TProps = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
};

const UploadJson = ({ file, setFile }: TProps) => {
  const filesRef = useRef<HTMLInputElement>(null);
  const { data: categoryData } = useGetAllCategoriesQuery(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadTemplate] = useDownloadJsonTemplateMutation();
  const [category, setCategory] = useState("");
  const { data: filtersData } = useGetAllProductFiltersQuery(undefined);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filtersDropdownData: Option[] = filtersData?.data?.map(
    (filter: TFilter) => {
      return {
        label: filter.title,
        value: filter?._id,
        searchValue: filter.title,
      };
    },
  );

  const handleTemplateDownload = async () => {
    try {
      const res = await downloadTemplate({
        category,
        filters: selectedFilters,
      }).unwrap();
      if (res) {
        console.log(res);
        // Convert the response to a Blob (assuming the API returns JSON content)
        const blob = new Blob([res.data], { type: "application/json" });

        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create a hidden <a> element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = "product-upload-template.json"; // Set the file name
        document.body.appendChild(link);
        link.click();

        // Clean up: remove the link and revoke the URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const categoryOptions: Option[] = categoryData
    ? categoryData?.data?.map((cat) => ({
        value: cat._id,
        label: `${cat.name} (${cat.slug})`,
        searchValue: cat.name,
      }))
    : [];

  const handleUploadfileClick = () => {
    console.log("clicking");
    if (filesRef && filesRef.current) {
      filesRef.current.click();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files ? files[0] : null);
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFilterSelect = (val: string[]) => {
    setSelectedFilters(val);
  };
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col gap-2 rounded-md bg-light-cyan px-7 py-6">
        <h3>1. Download the template json and fill it with proper data.</h3>
        <h3>
          2. Once you have downloaded and filled the skeleton file, upload it in
          the form below and submit.
        </h3>
        <h3>3. For brand and category use the slug/id properly.</h3>
        <h3>4. Finally select the correct headers for the each property.</h3>
      </div>

      <Combobox
        placeholder="Category"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />
      <MultiSelect
        className="bg-background-foreground"
        selected={selectedFilters}
        onChange={handleFilterSelect}
        placeholder="Select filters"
        options={filtersDropdownData}
      />
      <Button onClick={handleTemplateDownload} variant={"secondary_light"}>
        Download Template
      </Button>

      <input
        className="hidden"
        accept="json"
        type="file"
        ref={filesRef}
        onChange={handleFileUpload}
      />

      <div
        onClick={handleUploadfileClick}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`flex h-40 w-full flex-col items-center justify-center rounded-md border-2 border-dotted border-primary bg-background text-bright-turquoise ${isDragging ? "bg-overlay" : ""}`}
      >
        <CloudUpload className="text-5xl" />
        <p className="text-lg text-bright-turquoise">
          Drag and drop files or upload
        </p>
      </div>
      {file !== null && (
        <div className="w-full">
          <p className="pb-1 text-lg font-semibold text-gray">Selected File:</p>
          <div className="flex w-full items-center justify-between rounded-md border-2 border-dotted border-primary bg-background px-4 py-3 text-gray">
            {file?.name}
            <Button
              onClick={() => setFile(null)}
              variant={"icon"}
              size={"base"}
            >
              <Trash className="text-red" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadJson;
