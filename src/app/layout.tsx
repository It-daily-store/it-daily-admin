import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import GlobalProvider from "@/provider/provider";
// import '@mdxeditor/editor/style.css';
import { Suspense } from "react";
import { Toaster } from "sonner";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gadget Grid - Your One-Stop Shop for IT Products & Gadgets",
  description:
    "Discover the latest IT products at Gadget Grid. Shop cutting-edge gadgets, electronics, and tech accessories with fast shipping and unbeatable prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <NextTopLoader
          showSpinner={false}
          color="linear-gradient(90deg, hsla(18, 94%, 53%) 0%, hsla(18, 94%, 53%) 100%)"
        />
        <GlobalProvider>
          <Suspense>
            {children}
            <Toaster richColors position="top-center" />
          </Suspense>
        </GlobalProvider>
      </body>
    </html>
  );
}
