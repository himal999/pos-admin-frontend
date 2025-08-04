"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  ChevronDown,
  ChevronUp,
  FilePenLine,
  ScanEye,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { IStock, IStockFilter } from "@/types";
import {
  ADD,
  DELETE,
  FILTERLIST,
  REFDATA,
  UPDATE,
  VIEW,
} from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import Swal from "sweetalert2";
import withAuth from "@/utils/withAuth";
import { TbLockCode } from "react-icons/tb";

function Stock() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockList, setStockList] = useState<IStock[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // task filter state

  const [stock, setStock] = useState<IStockFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      location: "",
      itemCode: "",
      itemDescription: "",
      qty: "",
      qtyOperator: "",
      status: "",
    },
  });

  // Privileges and defaultStatus state
  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    useritemPrivilegeAssign: false,
  });

  const [defaultStatus, setDefaultStatus] = useState<
    { code: string; description: string }[]
  >([]);

  const [locations, setLocations] = useState<
    { code: string; description: string }[]
  >([]);

  const [measure, setMeasure] = useState<
    { code: string; description: string }[]
  >([]);

  // Pagination logic

  const handlePageChange = (newPage: number) => {
    setStock((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (stock.page > 0) {
      const newPage = stock.page - 1;
      setCurrentPage(newPage);
      setStock({ ...stock, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (stock.page < totalPages - 1) {
      const newPage = stock.page + 1;
      setCurrentPage(newPage);
      setStock({ ...stock, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setStock((prev) => ({
      ...prev,
      sortColumn: column,
      sortDirection:
        prev.sortColumn === column && prev.sortDirection === "ASC"
          ? "DESC"
          : "ASC",
    }));
  };

  // Pagination logic

  const renderSortIcons = (column: string) => {
    const isActive = stock.sortColumn === column;
    const direction = stock.sortDirection;

    return (
      <span className="ml-1 inline-block">
        <span
          className={`block ${
            isActive && direction === "ASC" ? "text-black" : "text-gray-400"
          }`}
        >
          <ChevronUp className="h-3 w-3 text-black" />
        </span>
        <span
          className={`block ${
            isActive && direction === "DESC" ? "text-black" : "text-gray-400"
          } -mt-1`}
        >
          <ChevronDown className="h-3 w-3 text-black" />
        </span>
      </span>
    );
  };

  // Filter logic

  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    itemCode: "",
    itemDescription: "",
    qty: "",
    qtyOperator: "",
    status: "",
  });

  useEffect(() => {
    fetchStock();
  }, [stock]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setStock({
      ...stock,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = {
      location: "",
      itemCode: "",
      itemDescription: "",
      qty: "",
      qtyOperator: "",
      status: "",
    };
    setSelectedFilters(clearedFilters);
    setStock({
      ...stock,
      page: 0,
      search: clearedFilters,
    });
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Fetch reference data first before tasks
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/stock/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setLocations(response.data.locations || []);
        setMeasure(response.data.measure || []);
        fetchStock();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchStock = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/stock/filter-list",
        { ...stock },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setStockList(response.data.content || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view, edit, save, and delete task logic

  const handleViewStock = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/stock/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedStock(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditStock = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/stock/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedStock(response.data);
        setModalMode("edit");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Edit load error:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/stock/update",
        selectedStock,
        UPDATE,
        token,
        username,
      );

      if (response.success) {
        showSuccessAlert(
          "Successfully Updated",
          "Check & verify updated details.",
        );
        setShowModal(false);
        fetchStock();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Stock Management" />

      <>
        {privileges.search && (
          <>
            <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
              <input
                type="text"
                placeholder="Item Code"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.itemCode}
                onChange={(e) => handleFilterChange("itemCode", e.target.value)}
              />
              <input
                type="text"
                placeholder="Item Name"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.itemDescription}
                onChange={(e) =>
                  handleFilterChange("itemDescription", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Quantity"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.qty}
                onChange={(e) => handleFilterChange("qty", e.target.value)}
              />
            </div>
            <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                >
                  <option value="">Location</option>
                  {locations.map((location) => (
                    <option key={location.code} value={location.code}>
                      {location.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.qtyOperator}
                  onChange={(e) =>
                    handleFilterChange("qtyOperator", e.target.value)
                  }
                >
                  <option value="">Quantity Operator</option>
                  {measure.map((measure) => (
                    <option key={measure.code} value={measure.code}>
                      {measure.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">Status</option>
                  {defaultStatus.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </>
        )}

        <div className="mt-3 flex items-center justify-end">
          {/* Search and Reset buttons on the right */}
          {privileges.search && (
            <div className="flex items-center gap-2">
              <button
                onClick={applyFilters}
                className="rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
              >
                Search
              </button>
              <button
                onClick={resetFilters}
                className="rounded-lg border border-gray-500 bg-gray-500 px-4 py-1.5 text-sm font-medium text-white hover:border-gray-400 hover:bg-gray-400"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 w-full">
          <div className="overflow-x-auto rounded-2xl shadow-md">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="w-[10%] px-6 py-3 text-center">Action</th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center justify-center">
                      Code {renderSortIcons("code")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("desription")}
                  >
                    <div className="flex items-center justify-center">
                      Name {renderSortIcons("description")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("lablePrice")}
                  >
                    <div className="flex items-center justify-center">
                      Lable Price {renderSortIcons("lablePrice")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("cost")}
                  >
                    <div className="flex items-center justify-center">
                      Cost {renderSortIcons("cost")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("retailPrice")}
                  >
                    <div className="flex items-center justify-center">
                      Sales Price {renderSortIcons("retailPrice")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("qty")}
                  >
                    <div className="flex items-center justify-center">
                      Quantity {renderSortIcons("qty")}
                    </div>
                  </th>
                  <th
                    className="w-[10%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Status {renderSortIcons("status")}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {stockList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  stockList.map((stock, idx) => (
                    <tr
                      key={idx}
                      className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800"
                    >
                      <td className="w-[10%] px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {privileges.view && (
                            <button
                              onClick={() =>
                                handleViewStock(stock.id.toString())
                              }
                              title="View"
                            >
                              <ScanEye className="h-5 w-5 text-primary" />
                            </button>
                          )}
                          {privileges.update && (
                            <button
                              onClick={() =>
                                handleEditStock(stock.id.toString())
                              }
                              title="Update"
                            >
                              <FilePenLine className="h-5 w-5 text-success" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="w-[10%] px-6 py-4">{stock.item.code}</td>
                      <td className="px-6 py-4">{stock.item.description}</td>
                      <td className="px-6 py-4">
                        {stock.lablePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{stock.itemCost.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {stock.retailPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{stock.qty}</td>
                      <td className="w-[10%] px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            stock.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {stock.statusDescription}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {stock.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={stock.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                stock.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={stock.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                stock.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedStock && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
            <div className="hide-scrollbar relative m-2 h-[500px] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
              {/* Close Icon Top-Right */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="mb-4 text-lg font-semibold">
                {modalMode === "view" ? "View Stock" : "Edit Stock"}
              </h2>

              <h2 className="text-lg font-semibold">Item Details</h2>
              <hr className="my-2 dark:border-gray-500" />
              <p className="mb-2">
                <strong>Code:</strong>{" "}
                {selectedStock.item.code || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Name:</strong>{" "}
                {selectedStock.item.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Category:</strong>{" "}
                {selectedStock.item.category.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Brand:</strong>{" "}
                {selectedStock.item.brand.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Unit:</strong>{" "}
                {selectedStock.item.unitDescription || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Status:</strong>{" "}
                {selectedStock.item.statusDescription || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Created Date:</strong>{" "}
                {selectedStock.item.createdDate || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Last Modified Date:</strong>{" "}
                {selectedStock.item.lastModifiedDate || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Created By:</strong>{" "}
                {selectedStock.item.createdBy || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Last Modified By:</strong>{" "}
                {selectedStock.item.lastModifiedBy || "Unavailable"}
              </p>

              <h2 className="mt-4 text-lg font-semibold">Other Details</h2>
              <hr className="my-2 dark:border-gray-500" />

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Lable Price:</strong>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={selectedStock.lablePrice}
                    onChange={(e) =>
                      setSelectedStock({
                        ...selectedStock,
                        lablePrice: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Lable Price:</strong>{" "}
                  {selectedStock.lablePrice || "Unavailable"}
                </p>
              )}

              <p className="mb-2">
                <strong>Item Cost:</strong>{" "}
                {selectedStock.itemCost || "Unavailable"}
              </p>

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Retail Price:</strong>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={selectedStock.retailPrice}
                    onChange={(e) =>
                      setSelectedStock({
                        ...selectedStock,
                        retailPrice: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Retail Price:</strong>{" "}
                  {selectedStock.retailPrice || "Unavailable"}
                </p>
              )}

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Wholesale Price:</strong>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={selectedStock.wholesalePrice}
                    onChange={(e) =>
                      setSelectedStock({
                        ...selectedStock,
                        wholesalePrice: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Wholesale Price:</strong>{" "}
                  {selectedStock.wholesalePrice || "Unavailable"}
                </p>
              )}

              <p className="mb-2">
                <strong>Retail Discount:</strong>{" "}
                {selectedStock.retailDiscount || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Wholesale Discount:</strong>{" "}
                {selectedStock.wholesaleDiscount || "Unavailable"}
              </p>

              {modalMode === "edit" ? (
                <div className="mb-2">
                  <strong>Quantity:</strong>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={selectedStock.qty}
                    onChange={(e) =>
                      setSelectedStock({
                        ...selectedStock,
                        qty: e.target.value,
                      })
                    }
                  />
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Quantity:</strong>{" "}
                  {selectedStock.qty || "Unavailable"}
                </p>
              )}

              <p className="mb-2">
                <strong>GRN:</strong> {selectedStock.grn || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Location:</strong>{" "}
                {selectedStock.location.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Created Date:</strong>{" "}
                {selectedStock.createdDate || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Last Modified Date:</strong>{" "}
                {selectedStock.lastModifiedDate || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Created By:</strong>{" "}
                {selectedStock.createdBy || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Last Modified By:</strong>{" "}
                {selectedStock.lastModifiedBy || "Unavailable"}
              </p>

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedStock.status}
                      onChange={(e) =>
                        setSelectedStock({
                          ...selectedStock,
                          status: e.target.value,
                        })
                      }
                    >
                      {defaultStatus.map((status) => (
                        <option key={status.code} value={status.code}>
                          {status.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Status:</strong> {selectedStock.statusDescription}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                >
                  Close
                </button>
                {modalMode === "edit" && (
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </DefaultLayout>
  );
}

export default withAuth(Stock);
