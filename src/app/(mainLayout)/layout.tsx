import type { Metadata } from "next";
import { Suspense } from "react";
import MainLayout from "@/components/layouts/MainLayout";

export const metadata: Metadata = {
  title: "Gadget Grid - Your One-Stop Shop for IT Products & Gadgets",
  description:
    "Discover the latest IT products at Gadget Grid. Shop cutting-edge gadgets, electronics, and tech accessories with fast shipping and unbeatable prices.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      <Suspense>{children}</Suspense>
    </MainLayout>
  );
}
