import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SheetDetail {
  description: string;
  amount: number;
}

export interface SheetDetailsByMonth {
  [month: string]: SheetDetail[];
}

export interface SheetData {
  sheetCode: string;
  sheetDescription: string;
  companyDescription: string;
  yearDescription: string;
  sheetDetails: SheetDetailsByMonth;
  id: number;
}

interface IncomeStatementContextType {
  incomeStatementData: SheetData[] | null;
  setIncomeStatementData: (data: SheetData[]) => void;
  totalValues: SheetDetail[] | null;
  setTotalValues: (totals: SheetDetail[]) => void;
}

// Context creation
const IncomeStatementContext = createContext<
  IncomeStatementContextType | undefined
>(undefined);

// Provider
export const IncomeStatementProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [incomeStatementData, setIncomeStatementData] = useState<
    SheetData[] | null
  >(null);
  const [totalValues, setTotalValues] = useState<SheetDetail[] | null>(null);

  return (
    <IncomeStatementContext.Provider
      value={{
        incomeStatementData,
        setIncomeStatementData,
        totalValues,
        setTotalValues,
      }}
    >
      {children}
    </IncomeStatementContext.Provider>
  );
};

// Hook to use the context
export const useIncomeStatementContext = () => {
  const context = useContext(IncomeStatementContext);
  if (!context) {
    throw new Error(
      "useIncomeStatementContext must be used within an IncomeStatementProvider",
    );
  }
  return context;
};
