"use client";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, Option } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PcBuildSettings, PcPart } from "@/interface/settings";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/api/settingsApi";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

const PcBuilderPage = () => {
  const { data, isLoading: loading } = useGetSettingsQuery(undefined);
  const pcBuilderInitail = data?.data?.pcBuilder;
  const { data: catData } = useGetAllCategoriesQuery(undefined);
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();

  const catOptions: Option[] =
    catData?.data?.map((cat) => ({
      value: cat._id,
      searchValue: cat.name,
      label: `${cat.name} (${cat.slug})`,
    })) || [];

  const [pcBuilder, setPcBuilder] = useState<PcBuildSettings>(
    pcBuilderInitail as PcBuildSettings,
  );

  useEffect(() => {
    if (pcBuilderInitail) {
      setPcBuilder(pcBuilderInitail);
    }
  }, [pcBuilderInitail]);

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center justify-center h-[80vh]">
        <Loader className="animate-spin" />
        Loading PC builder settings...
      </div>
    );
  }

  if (!pcBuilder) {
    return <p>PC builder setting not found.</p>;
  }

  const handleUpdate = async () => {
    try {
      await updateSettings({
        pcBuilder,
      }).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  const handlePartChange = (
    type: keyof PcBuildSettings,
    id: number,
    key: keyof PcPart,
    value: string,
  ) => {
    if (type === "coreComponents") {
      setPcBuilder((prev) => ({
        ...prev,
        coreComponents: {
          ...pcBuilder.coreComponents,
          parts: pcBuilder.coreComponents?.parts?.map((part) => {
            if (part.id === id) {
              return {
                ...part,
                [key]: value,
              };
            }
            return part;
          }),
        },
      }));
    } else if (type === "peripherals") {
      setPcBuilder((prev) => ({
        ...prev,
        peripherals: {
          ...pcBuilder.peripherals,
          parts: pcBuilder.peripherals?.parts?.map((part) => {
            if (part.id === id) {
              return {
                ...part,
                [key]: value,
              };
            }

            return part;
          }),
        },
      }));
    }
  };

  return (
    <div>
      <PageHeader
        title="🖥️ PC Builder Management"
        subtitle="Assign components to their respective categories for accurate product mapping."
        buttons={
          <Button onClick={handleUpdate} loading={isLoading}>
            Save Settings
          </Button>
        }
      />

      <Card className="gap-4 mb-4">
        <CardHeader className="p-4 py-0">
          <CardTitle>
            <Input
              className="bg-background"
              value={pcBuilder?.coreComponents?.title}
              onChange={(e) =>
                setPcBuilder((prev) => ({
                  ...prev,
                  coreComponents: {
                    ...pcBuilder.coreComponents,
                    title: e.target.value,
                  },
                }))
              }
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 py-0">
          <div className="space-y-2">
            {pcBuilder?.coreComponents?.parts?.map((part, index) => (
              <div key={part.id} className="grid grid-cols-2 gap-2 w-full">
                <div className="space-y-1">
                  {index === 0 && <Label>Part Name</Label>}
                  <Input
                    className="bg-background"
                    onChange={(e) =>
                      handlePartChange(
                        "coreComponents",
                        part.id,
                        "category",
                        e.target.value,
                      )
                    }
                    value={part.name}
                  />
                </div>
                <div className="space-y-1">
                  {index === 0 && <Label>Related Category</Label>}
                  <Combobox
                    className="bg-background truncate"
                    options={catOptions}
                    placeholder="Select Category"
                    onChange={(val) =>
                      handlePartChange(
                        "coreComponents",
                        part.id,
                        "category",
                        val,
                      )
                    }
                    value={part?.category || ""}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="gap-4">
        <CardHeader className="p-4 py-0">
          <CardTitle>
            <Input
              className="bg-background"
              value={pcBuilder?.peripherals?.title}
              onChange={(e) =>
                setPcBuilder((prev) => ({
                  ...prev,
                  peripherals: {
                    ...pcBuilder.peripherals,
                    title: e.target.value,
                  },
                }))
              }
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 py-0">
          <div className="space-y-2">
            {pcBuilder?.peripherals?.parts?.map((part, index) => (
              <div key={part.id} className="grid grid-cols-2 gap-2 w-full">
                <div className="space-y-1">
                  {index === 0 && <Label>Part Name</Label>}
                  <Input
                    className="bg-background"
                    onChange={(e) =>
                      handlePartChange(
                        "peripherals",
                        part.id,
                        "category",
                        e.target.value,
                      )
                    }
                    value={part.name}
                  />
                </div>
                <div className="space-y-1">
                  {index === 0 && <Label>Related Category</Label>}
                  <Combobox
                    className="bg-background truncate"
                    options={catOptions}
                    placeholder="Select Category"
                    onChange={(val) =>
                      handlePartChange("peripherals", part.id, "category", val)
                    }
                    value={part?.category || ""}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PcBuilderPage;
