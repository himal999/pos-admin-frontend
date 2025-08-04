// context/FileContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface SheetDetail {
  description: string;
  amount: number;
}

export interface SheetData {
  sheetCategoryDetails: any;
  sheetCode: string;
  sheetDescription: string;
  sheetDetails: SheetDetail[];
  sumOfSheet: number;
}

export interface SheetSummaryDetail {
  sheetCategoryCode: string;
  sheetCategoryDescription: string;
  sumOfSheetCategory: number;
  sheetCategoryDetails: SheetDetail[];
}

export interface ISItem {
  description: string;
  amount: number;
}
export interface ISData {
  grossProfit?: ISItem;
  earningBeforeTax?: ISItem;
  earningAfterTax?: ISItem;
  sheetSummaryDetails?: SheetSummaryDetail[];

  [key: string]: ISItem | SheetSummaryDetail[] | undefined;
}

export interface BSDetailedItem {
  description: string;
  amount: number;
  sheetDetails?: SheetDetail[];
}

export interface BSCategory {
  sheetCategoryCode: string;
  sheetCategoryDescription: string;
  sumOfSheetCategory: number;
  sheetCategoryDetails: BSDetailedItem[];
}

export interface FileData {
  sheetsList: SheetData[];
  IS?: ISData;
  BS?: BSCategory[];
  id?: number;
  companyDescription?: string;
  yearDescription?: string;
  monthDescription?: string;
}

interface FileContextType {
  fileData: FileData | null;
  setFileData: (data: FileData) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [fileData, setFileData] = useState<FileData | null>(null);

  useEffect(() => {
    console.log("Context fileData updated:", fileData);
  }, [fileData]);

  return (
    <FileContext.Provider value={{ fileData, setFileData }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context)
    throw new Error("useFileContext must be used within FileProvider");
  return context;
};
