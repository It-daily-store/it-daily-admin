"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { persistor, store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const GlobalProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <></>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SidebarProvider>{children}</SidebarProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
};

export default GlobalProvider;
