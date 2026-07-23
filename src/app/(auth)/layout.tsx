import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Daily It - Your One-Stop Shop for IT Products & Gadgets",
  description:
    "Discover the latest IT products at Daily It. Shop cutting-edge gadgets, electronics, and tech accessories with fast shipping and unbeatable prices.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background-foreground text-black">
      <div className="absolute -bottom-9 -left-16 size-40 rounded-full bg-secondary/10 blur-[100px] md:size-64 lg:size-[500px]"></div>
      <div className="absolute -right-20 -top-36 size-80 rounded-full blur-[100px] bg-primary/10 md:size-[400px] lg:size-[600px]"></div>
      <Suspense>{children}</Suspense>
    </div>
  );
}
