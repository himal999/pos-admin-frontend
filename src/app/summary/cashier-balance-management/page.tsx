"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
// import { ISummary } from "@/types";
import { FILTERLIST, REFDATA } from "@/utils/apiMessage";
import { showErrorAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";
import { ChevronDown, House } from "lucide-react";

function Balance() {
  const [loading, setLoading] = useState(true);
  // const [balanceList, setBalanceList] = useState<ISummary[]>([]);

  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    useritemPrivilegeAssign: false,
  });

  const [locations, setLocations] = useState<
    {
      code: string;
      description: string;
      summary?: any;
      cashiers?: Record<string, any>;
    }[]
  >([]);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeCashier, setActiveCashier] = useState<string>("all");
  const [selectedSubTab, setSelectedSubTab] = useState<{
    [key: string]: string;
  }>({});

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [inputFromDate, setInputFromDate] = useState("");
  const [inputToDate, setInputToDate] = useState("");

  const [grandSummary, setGrandSummary] = useState<any>(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedForInput = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
    const formattedForAPI = `${yyyy}/${mm}/${dd}`; // YYYY/MM/DD

    setFromDate(formattedForAPI);
    setToDate(formattedForAPI);
    setInputFromDate(formattedForInput);
    setInputToDate(formattedForInput);
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchBalance(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  // Fetch reference data (including locations and privileges)
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/cash-book/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setLocations(response.data.locations || []);
        setGrandSummary(response.data.grandSummary || null);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch balance data filtered by date
  const fetchBalance = async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";

      const requestBody: Record<string, any> = {};
      if (fromDate) requestBody.fromDate = fromDate;
      if (toDate) requestBody.toDate = toDate;

      const response = await postLoginRequest(
        "api/v1/cash-book/cashier-balance",
        requestBody,
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        const locObj = response.data.locations || {};
        setLocations((prevLocs) =>
          prevLocs.map((loc) => ({
            ...loc,
            summary: locObj[loc.code]?.summary || null,
            cashiers: locObj[loc.code]?.cashiers || null,
          })),
        );
        setGrandSummary(response.data.grandSummary || null);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Style active/inactive cashier buttons
  const getButtonClass = (key: string) => {
    return `rounded-xl px-4 py-2 text-sm font-semibold ${
      activeCashier === key
        ? "bg-primary text-white"
        : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-primary dark:hover:text-white"
    }`;
  };

  // Style active/inactive sub-tab buttons
  const getSubTabClass = (tab: string, cashier: string) => {
    return `rounded-xl px-4 py-2 text-sm font-medium ${
      selectedSubTab[cashier] === tab
        ? "bg-hover text-white"
        : "bg-gray-200 text-gray-700 hover:bg-hover hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-primary dark:hover:text-white"
    }`;
  };

  const selectedLocObj = locations.find((loc) => loc.code === selectedLocation);

  // Render summary table
  const renderSummaryRow = (summary: any) => {
    if (!summary) return <p>No summary data</p>;

    return (
      <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
        <table className="w-full text-left text-sm  text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 text-center">Description</th>
              <th className="px-6 py-3 text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Returns</td>
              <td className="px-6 py-2">{summary.totalReturns ?? 0}</td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Cash In</td>
              <td className="px-6 py-2">{summary.totalCashIn ?? 0}</td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Balance</td>
              <td className="px-6 py-2">{summary.balance ?? 0}</td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Sales</td>
              <td className="px-6 py-2">{summary.totalSales ?? 0}</td>
            </tr>
            <tr className="border-t bg-white text-center dark:border-gray-700 dark:bg-gray-800">
              <td className="px-6 py-2">Total Cash Out</td>
              <td className="px-6 py-2">{summary.totalCashOut ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render sales table
  const renderSalesTable = (sales: any[]) => (
    <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
        <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-2 text-left">Invoice</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Payment</th>
            <th className="px-4 py-2 text-left">Sales Type</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Paid</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, idx) => (
            <tr
              key={idx}
              className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <td className="px-4 py-2">{s.invoiceNumber}</td>
              <td className="px-4 py-2">
                {s.customer?.titleDescription} {s.customer?.firstName}{" "}
                {s.customer?.lastName}
              </td>
              <td className="px-4 py-2">{s.paymentTypeDescription}</td>
              <td className="px-4 py-2">{s.salesTypeDescription}</td>
              <td className="px-4 py-2 text-right">
                {s.totalAmount?.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-right">
                {s.payAmount?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render returns table
  const renderReturnsTable = (returns: any[]) => (
    <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
        <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-2 text-left">Invoice</th>
            <th className="px-4 py-2 text-left">Remark</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Payment</th>
            <th className="px-4 py-2 text-left">Sales Type</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Paid</th>
            <th className="px-4 py-2 text-right">Debit Amount</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((r, idx) => (
            <tr
              key={idx}
              className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <td className="px-4 py-2">{r.billing?.invoiceNumber}</td>
              <td className="px-4 py-2">{r.remark || "-"}</td>
              <td className="px-4 py-2">
                {r.customer?.titleDescription} {r.customer?.firstName}{" "}
                {r.customer?.lastName}
              </td>
              <td className="px-4 py-2">{r.paymentTypeDescription}</td>
              <td className="px-4 py-2">{r.salesTypeDescription}</td>
              <td className="px-4 py-2 text-right">
                {r.totalAmount?.toFixed(2) ?? 0}
              </td>
              <td className="px-4 py-2 text-right">
                {r.payAmount?.toFixed(2) ?? 0}
              </td>
              <td className="px-4 py-2 text-right">
                {r.debitAmount?.toFixed(2) ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render cash in/out table
  const renderCashInOutTable = (inOuts: any[]) => (
    <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
        <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {/* <th className="px-4 py-2">ID</th> */}
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Remark</th>
            <th className="px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inOuts.map((entry, idx) => (
            <tr
              key={idx}
              className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              {/* <td className="px-4 py-2">{entry.id}</td> */}
              <td className="px-4 py-2">{entry.cashInOut}</td>
              <td className="px-4 py-2">{entry.cashInOutDescription}</td>
              <td className="px-4 py-2">{entry.remark}</td>
              <td className="px-4 py-2 text-right">
                {entry.amount?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cashier Balance Management" />

      <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
        <div className="relative w-full">
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setActiveCashier("all");
            }}
            className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.description}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        </div>

        <input
          type="date"
          value={inputFromDate}
          onChange={(e) => {
            const value = e.target.value;
            setInputFromDate(value);
            const [year, month, day] = value.split("-");
            setFromDate(`${year}/${month}/${day}`);
          }}
          placeholder="From Date"
          className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
        />
        <input
          type="date"
          value={inputToDate}
          onChange={(e) => {
            const value = e.target.value;
            setInputToDate(value);
            const [year, month, day] = value.split("-");
            setToDate(`${year}/${month}/${day}`);
          }}
          placeholder="To Date"
          className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : !selectedLocation ? (
          <>
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Grand Summary
            </h3>
            {grandSummary ? renderSummaryRow(grandSummary) : <p>No data</p>}
          </>
        ) : (
          <>
            <span className="me-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              <House className="h-5 w-5" />
              {selectedLocObj?.description || selectedLocation}
            </span>

            {/* Cashier Tabs */}
            <div className="mb-6 mt-6 flex flex-wrap gap-2">
              <button
                className={getButtonClass("all")}
                onClick={() => setActiveCashier("all")}
              >
                All Counters
              </button>
              {selectedLocObj?.cashiers &&
                Object.keys(selectedLocObj.cashiers).map((cashier) => (
                  <button
                    key={cashier}
                    className={getButtonClass(cashier)}
                    onClick={() => {
                      setActiveCashier(cashier);
                      setSelectedSubTab((prev) => ({
                        ...prev,
                        [cashier]: "Total Summary",
                      }));
                    }}
                  >
                    {cashier}
                  </button>
                ))}
            </div>

            {/* Summary or Sub-tabs Content */}
            <div className="mt-4">
              {activeCashier === "all" ? (
                selectedLocObj?.summary ? (
                  renderSummaryRow(selectedLocObj.summary)
                ) : (
                  "No summary available"
                )
              ) : selectedLocObj?.cashiers &&
                selectedLocObj.cashiers[activeCashier] ? (
                <>
                  {/* Sub-tabs */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Total Summary", "Sales", "Returns", "Cash In/Out"].map(
                      (tab) => (
                        <button
                          key={tab}
                          className={getSubTabClass(tab, activeCashier)}
                          onClick={() =>
                            setSelectedSubTab((prev) => ({
                              ...prev,
                              [activeCashier]: tab,
                            }))
                          }
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Sub-tab content */}
                  {selectedSubTab[activeCashier] === "Sales" ? (
                    selectedLocObj.cashiers[activeCashier].sales?.length > 0 ? (
                      renderSalesTable(
                        selectedLocObj.cashiers[activeCashier].sales,
                      )
                    ) : (
                      <p>No sales found</p>
                    )
                  ) : selectedSubTab[activeCashier] === "Returns" ? (
                    selectedLocObj.cashiers[activeCashier].returns?.length >
                    0 ? (
                      renderReturnsTable(
                        selectedLocObj.cashiers[activeCashier].returns,
                      )
                    ) : (
                      <p>No returns found</p>
                    )
                  ) : selectedSubTab[activeCashier] === "Cash In/Out" ? (
                    selectedLocObj.cashiers[activeCashier].inOuts?.length >
                    0 ? (
                      renderCashInOutTable(
                        selectedLocObj.cashiers[activeCashier].inOuts,
                      )
                    ) : (
                      <p>No cash in/out records</p>
                    )
                  ) : (
                    renderSummaryRow(selectedLocObj.cashiers[activeCashier])
                  )}
                </>
              ) : (
                "No data for this cashier"
              )}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

export default withAuth(Balance);
