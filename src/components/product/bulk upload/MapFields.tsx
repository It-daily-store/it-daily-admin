import { TMapedField } from "@/app/(mainLayout)/product/bulk-upload/page";
import { TSelectOptions } from "@/components/categories/interface";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Papa from "papaparse";
import { Combobox, Option } from "@/components/ui/combobox";

const fieldOptions: Option[] = [
  {
    label: "Product name",
    value: "name",
    searchValue: "Product Name",
  },
  {
    label: "Price (number)",
    searchValue: "Price (number)",
    value: "price",
  },
  {
    label: "Category (name or id)",
    searchValue: "Category (name or id)",
    value: "category",
  },
  {
    label: "Brand",
    searchValue: "Brand",
    value: "brand",
  },
  {
    label: "Product SKU",
    searchValue: "Product SKU",
    value: "sku",
  },
  {
    label: "Model",
    searchValue: "Model",
    value: "model",
  },
  {
    label: "Description",
    searchValue: "Description",
    value: "description",
  },
  {
    label: "Quantity",
    searchValue: "Quantity",
    value: "quantity",
  },
  {
    label: "Warrenty days",
    searchValue: "Warrenty days",
    value: "warranty.days",
  },
  {
    label: "Lifetime Warrenty (true/false)",
    searchValue: "Lifetime Warrenty (true/false)",
    value: "warranty.lifetime",
  },
  {
    label: "Discount Type",
    searchValue: "Discount Type",
    value: "discount.type",
  },
  {
    label: "Discount Value",
    searchValue: "Discount Value",
    value: "discount.value",
  },
  {
    label: "Thumbnail",
    searchValue: "Thumbnail",
    value: "thumbnail",
  },
  {
    label: "Key Features",
    searchValue: "Key Features",
    value: "key_features",
  },
  {
    label: "Meta Title",
    searchValue: "Meta Title",

    value: "meta.title",
  },
  {
    label: "Meta Description",
    searchValue: "Meta Description",
    value: "meta.description",
  },
  {
    label: "Meta Image",
    searchValue: "Meta Image",
    value: "meta.image",
  },
  {
    label: "Tags",
    searchValue: "Tags",
    value: "tags",
  },
  {
    label: "Shipping Free (true/false)",
    searchValue: "Shipping Free (true/false)",
    value: "shipping.free",
  },
  {
    label: "Shipping Cost",
    searchValue: "Shipping Cost",
    value: "shipping.cost",
  },
];

type TProps = {
  file: File | null;
  mapedFields: TMapedField[];
  setMapedFields: Dispatch<SetStateAction<TMapedField[]>>;
};

const MapFields = ({ file, mapedFields, setMapedFields }: TProps) => {
  const [csvFields, setCsvFields] = useState<string[] | []>([]);

  useEffect(() => {
    if (file !== null) {
      const reader = new FileReader();
      reader.onload = () => {
        const csvData = reader.result;
        if (typeof csvData === "string") {
          const data = Papa.parse(csvData, { header: true });
          if (data) {
            setCsvFields(data.meta.fields || []);
          }
          console.log(data);
        }
      };

      reader.readAsText(file);
    }
  }, [file]);

  const handleFieldSelect = (val: string, key: string) => {
    const exist = mapedFields.find((f) => f.key === key);
    if (exist) {
      const newData = mapedFields.map((item) => {
        if (item.key === key) {
          return {
            key,
            value: val,
          };
        } else {
          return item;
        }
      });
      setMapedFields(newData);
    } else {
      setMapedFields((prev) => [...prev, { key, value: val }]);
    }
  };

  return (
    <div className="w-full">
      {csvFields.length > 0 && (
        <div className="flex flex-col gap-2">
          {csvFields.map((f, i) => {
            return (
              <div
                key={i}
                className="flex w-full items-center justify-between rounded-md bg-background p-2"
              >
                <h2 className="w-full ps-3 text-black">{f}</h2>
                <Combobox
                  value={mapedFields.find((mf) => mf?.key === f)?.value || ""}
                  onChange={(val) => handleFieldSelect(val as string, f)}
                  options={fieldOptions}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapFields;
