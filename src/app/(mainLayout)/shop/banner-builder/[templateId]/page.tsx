"use client";
import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BannerBuilder } from "react-bannerkit/builder";
import "react-bannerkit/builder.css";
// The editor draws real banners on its canvas and in preview, so it needs the
// renderer's stylesheet too. Without it panels lose `position: absolute` and
// stack down the page instead of laying out side by side.
import "react-bannerkit/renderer.css";
import { normalizeTemplate } from "react-bannerkit";
import type { BannerTemplate } from "react-bannerkit";

import {
  useGetTemplateQuery,
  useUpdateTemplateMutation,
} from "@/redux/api/bannerApi";
import { useUploadImageMutation } from "@/redux/api/uploadFiles";
import { useAppSelector } from "@/redux/hooks";
import { EAppFeatures } from "@/interface/auth.interface";
import { globalError } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";

export default function BannerEditPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { permissions } = useAppSelector((state) => state.auth);
  const bannerPermission = permissions?.find(
    (p) => p.feature === EAppFeatures.banner,
  );

  const { data, isLoading, error } = useGetTemplateQuery(templateId);
  const [updateTemplate] = useUpdateTemplateMutation();
  const [uploadImage] = useUploadImageMutation();

  if (!isLoading && error) {
    globalError(error);
  }

  const template = useMemo<BannerTemplate | null>(() => {
    if (!data?.data) return null;
    return normalizeTemplate({
      ...data.data,
      id: data.data._id,
      version: 1,
    });
  }, [data]);

  const handleSave = async (t: BannerTemplate) => {
    try {
      await updateTemplate({
        id: templateId,
        payload: {
          name: t.name,
          description: t.description,
          breakpoints: t.breakpoints,
        },
      }).unwrap();
      toast.success("Template saved");
    } catch (err) {
      globalError(err);
      throw err;
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("photos", file);
    formData.append("type", "banner");
    formData.append("folder", "");
    try {
      const res = await uploadImage({ formData }).unwrap();
      return res.data[0].image;
    } catch (err) {
      globalError(err);
      throw err;
    }
  };

  if (isLoading) {
    return <p className="p-4 text-gray">Loading template...</p>;
  }

  if (!template) {
    return <p className="p-4 text-gray">Template not found.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title={template.name}
        subtitle="Edit this banner template"
        buttons={
          <button
            type="button"
            onClick={() => router.push("/shop/banner-builder")}
            className="text-sm text-primary underline"
          >
            Back to list
          </button>
        }
      />

      {bannerPermission?.access.update ? (
        <div style={{ height: "calc(100vh - 220px)" }}>
          <BannerBuilder
            template={template}
            onSave={handleSave}
            onUploadImage={handleUploadImage}
            theme={
              theme === "dark" ? "dark" : theme === "light" ? "light" : "system"
            }
          />
        </div>
      ) : (
        <div className="rounded-md border border-border-color bg-background p-6 text-gray">
          <p>You don&apos;t have permission to edit this template.</p>
          <p className="mt-2 text-sm">
            Last updated: {new Date(data?.data.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
