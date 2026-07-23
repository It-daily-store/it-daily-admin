import { Button } from "@/components/ui/button";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";
import { Cloud, CloudUpload, DownloadIcon, Trash } from "lucide-react";
import React, {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { CSVLink } from "react-csv";

type TProps = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
};

const headers: { label: string; key: string }[] = [
  { label: "Product Name *", key: "name" },
  { label: "Price *", key: "price" },
  { label: "Discount Type (flat/percent) *", key: "discount.type" },
  { label: "Discount Value *", key: "discount.value" },
  { label: "SKU *", key: "sku" },
  { label: "Brand *", key: "brand" },
  { label: "Model *", key: "model" },
  { label: "Warranty Days *", key: "warranty.days" },
  { label: "Lifetime Warrenty (true/false)", key: "warranty.lifetime" },
  { label: "Key Features *", key: "key_features" },
  { label: "Quantity *", key: "quantity" },
  { label: "Categories (Main) *", key: "category" },
  { label: "Description", key: "description" },
  { label: "Thumbnail *", key: "thumbnail" },
  { label: "Meta Title", key: "meta.title" },
  { label: "Meta Description", key: "meta.description" },
  { label: "Meta Image", key: "meta.image" },
  { label: "Tags", key: "tags" },
  { label: "Shipping Free", key: "shipping.free" },
  { label: "Shipping Cost", key: "shipping.cost" },
];

const brandHeaders: { label: string; key: string }[] = [
  {
    label: "Name",
    key: "name",
  },
];

const UploadSvg = ({ file, setFile }: TProps) => {
  const filesRef = useRef<HTMLInputElement>(null);
  const { data: brandData } = useGetAllBrandsQuery(undefined);
  const { data: categoryData } = useGetAllCategoriesQuery(undefined);
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col gap-2 rounded-md bg-light-cyan px-7 py-6">
        <h3>1. Download the skeleton file and fill it with proper data.</h3>
        <h3>
          2. Once you have downloaded and filled the skeleton file, upload it in
          the form below and submit.
        </h3>
        <h3>3. For brand and category use the slug/id properly.</h3>
        <h3>4. Finally select the correct headers for the each property.</h3>
      </div>

      <CSVLink
        filename={"product_data_template.csv"}
        className="w-fit"
        headers={headers}
        data={[]}
      >
        <Button variant={"outline"} className="flex gap-2 w-fit">
          <DownloadIcon size={18} />
          Download Skeleton CSV
        </Button>
      </CSVLink>
      <CSVLink
        filename={"category_data.csv"}
        className="w-full"
        headers={brandHeaders}
        data={categoryData?.data || []}
      >
        <Button variant={"outline"} className="flex gap-2">
          <DownloadIcon size={18} />
          Download Categories
        </Button>
      </CSVLink>
      <CSVLink
        filename={"brand_data.csv"}
        className="w-full"
        headers={brandHeaders}
        data={brandData?.data || []}
      >
        <Button variant={"outline"} className="flex gap-2">
          <DownloadIcon size={18} />
          Download Brands
        </Button>
      </CSVLink>

      <input
        className="hidden"
        accept="csv"
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

export default UploadSvg;
