"use client";

import { BannerBuilder } from "@it-daily-store/banner/builder";
import ImageSelect from "@/components/common/ImageSelect";
import { useAppSelector } from "@/redux/hooks";
import { getAccessToken } from "@/lib/utils";
import { EAppFeatures } from "@/interface/auth.interface";
import PageHeader from "@/components/common/PageHeader";

export default function BannerBuilderPage() {
  const { permissions } = useAppSelector((state) => state.auth);
  const bannerPermission = permissions?.find(
    (p) => p.feature === EAppFeatures.banner,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Banner Builder"
        subtitle="Create and edit freeform banner templates for the storefront"
      />
      <BannerBuilder
        apiBaseUrl={`${process.env.NEXT_PUBLIC_URL}/banner`}
        getAuthHeaders={(): Record<string, string> => {
          const token = getAccessToken();
          return token ? { Authorization: token } : {};
        }}
        canEdit={!!bannerPermission?.access.update}
        imagePicker={ImageSelect}
      />
    </div>
  );
}
