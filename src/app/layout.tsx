"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import Loader from "@/components/common/Loader";
import "../globals.css";
import { FileProvider } from "@/context/FileContext";
import { IncomeStatementProvider } from "@/context/useIncomeStatementContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <FileProvider>
      <IncomeStatementProvider>
        <html lang="en">
          <body suppressHydrationWarning={true}>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {loading ? <Loader /> : children}
            </div>
          </body>
        </html>
      </IncomeStatementProvider>
    </FileProvider>
  );
}
