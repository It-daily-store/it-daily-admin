"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import BulkUploadCSV from "@/components/product/bulk upload/BulkUploadCSV";
import BulkUploadJson from "@/components/product/bulk upload/BulkUploadJson";

export type TMapedField = {
  key: string;
  value: string;
};

const BulkUploadPage = () => {
  return (
    <div>
      <PageHeader
        title="Bulk Upload"
        subtitle="Efficiently Upload Multiple Products at Once"
      />

      <Tabs defaultValue="bulk-upload" className="mb-4">
        <TabsList>
          <TabsTrigger value="bulk-upload">Bulk upload (csv)</TabsTrigger>
          <TabsTrigger value="bulk-upload-json">Bulk upload (json)</TabsTrigger>
          <TabsTrigger value="upload-history">Upload History</TabsTrigger>
        </TabsList>
        <TabsContent value="bulk-upload">
          <BulkUploadCSV />
        </TabsContent>
        <TabsContent value="bulk-upload-json">
          <BulkUploadJson />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUploadPage;
