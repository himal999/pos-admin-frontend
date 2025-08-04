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
import { ITransfer, ITransferStockFilter } from "@/types";
import { FILTERLIST, REFDATA, UPDATE, VIEW } from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";

import withAuth from "@/utils/withAuth";

function Transfer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferList, setTransferList] = useState<ITransfer[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // task filter state

  const [transfer, setTransfer] = useState<ITransferStockFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      code: "",
      description: "",
      fromLocation: "",
      toLocation: "",
      fromDate: new Date(),
      toDate: new Date(),
      transferStatus: "",
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

  // Pagination logic

  const handlePageChange = (newPage: number) => {
    setTransfer((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (transfer.page > 0) {
      const newPage = transfer.page - 1;
      setCurrentPage(newPage);
      setTransfer({ ...transfer, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (transfer.page < totalPages - 1) {
      const newPage = transfer.page + 1;
      setCurrentPage(newPage);
      setTransfer({ ...transfer, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setTransfer((prev) => ({
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
    const isActive = transfer.sortColumn === column;
    const direction = transfer.sortDirection;

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
    code: "",
    description: "",
    fromLocation: "",
    toLocation: "",
    fromDate: new Date(),
    toDate: new Date(),
    transferStatus: "",
    status: "",
  });

  useEffect(() => {
    fetchTransfer();
  }, [transfer]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setTransfer({
      ...transfer,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = {
      code: "",
      description: "",
      fromLocation: "",
      toLocation: "",
      fromDate: new Date(),
      toDate: new Date(),
      transferStatus: "",
      status: "",
    };
    setSelectedFilters(clearedFilters);
    setTransfer({
      ...transfer,
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
        "api/v1/transfer/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setLocations(response.data.locations || []);
        fetchTransfer();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/transfer/filter-list",
        { ...transfer },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setTransferList(response.data.content || []);
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

  const handleViewTransfer = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/transfer/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedTransfer(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditTransfer = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/transfer/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedTransfer(response.data);
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
        "api/v1/transfer/update",
        selectedTransfer,
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
        fetchTransfer();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Transfer Management" />

      <>
        {privileges.search && (
          <>
            <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
              <input
                type="text"
                placeholder="Item Code"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.code}
                onChange={(e) => handleFilterChange("code", e.target.value)}
              />
              <input
                type="text"
                placeholder="Item Name"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={selectedFilters.description}
                onChange={(e) =>
                  handleFilterChange("itemDescription", e.target.value)
                }
              />
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.fromLocation}
                  onChange={(e) =>
                    handleFilterChange("fromLocation", e.target.value)
                  }
                >
                  <option value="">From Location</option>
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
                  value={selectedFilters.toLocation}
                  onChange={(e) =>
                    handleFilterChange("toLocation", e.target.value)
                  }
                >
                  <option value="">To Location</option>
                  {locations.map((location) => (
                    <option key={location.code} value={location.code}>
                      {location.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="mt-3 items-center gap-2 space-y-3 md:flex md:space-y-0">
              <input
                type="date"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={
                  selectedFilters.fromDate instanceof Date
                    ? selectedFilters.fromDate.toISOString().split("T")[0]
                    : selectedFilters.fromDate
                }
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                value={
                  selectedFilters.toDate instanceof Date
                    ? selectedFilters.toDate.toISOString().split("T")[0]
                    : selectedFilters.toDate
                }
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
              <div className="relative w-full">
                <select
                  className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.status}
                  onChange={(e) =>
                    handleFilterChange("transferStatus", e.target.value)
                  }
                >
                  <option value="">Transfer Status</option>
                  {defaultStatus.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.description}
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
          <div className="hide-scrollbar overflow-x-auto rounded-2xl shadow-md">
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
                    onClick={() => handleSort("fromLocation")}
                  >
                    <div className="flex items-center justify-center">
                      From Location {renderSortIcons("fromLocation")}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("toLocation")}
                  >
                    <div className="flex items-center justify-center">
                      To Location {renderSortIcons("toLocation")}
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
                {transferList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  transferList.flatMap((transfer, idx) =>
                    transfer.itemTransferDetails.map((detail, dIdx) => (
                      <tr
                        key={`${idx}-${dIdx}`}
                        className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* Action buttons */}
                        <td className="w-[10%] px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            {privileges.view && (
                              <button
                                onClick={() =>
                                  handleViewTransfer(transfer.id.toString())
                                }
                                title="View"
                              >
                                <ScanEye className="h-5 w-5 text-primary" />
                              </button>
                            )}
                            {privileges.update && (
                              <button
                                onClick={() =>
                                  handleEditTransfer(transfer.id.toString())
                                }
                                title="Update"
                              >
                                <FilePenLine className="h-5 w-5 text-success" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-6 py-4">{detail.item.code}</td>

                        {/* Name (description) */}
                        <td className="px-6 py-4">{detail.item.description}</td>

                        <td className="px-6 py-4">
                          {transfer.fromLocation.description}
                        </td>
                        <td className="px-6 py-4">
                          {transfer.toLocation.description}
                        </td>

                        {/* Label Price */}
                        <td className="px-6 py-4">
                          {detail.lablePrice.toFixed(2)}
                        </td>

                        {/* Cost */}
                        <td className="px-6 py-4">
                          {detail.totCost.toFixed(2)}
                        </td>

                        {/* Retail/Sales Price */}
                        <td className="px-6 py-4">
                          {detail.retailPrice.toFixed(2)}
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-4">{detail.qty}</td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              detail.item.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {detail.item.statusDescription}
                          </span>
                        </td>
                      </tr>
                    )),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {transfer.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={transfer.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                transfer.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={transfer.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                transfer.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedTransfer && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
            <div className="hide-scrollbar relative m-2  w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
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
                {modalMode === "view" ? "View Transfer" : "Edit Transfer"}
              </h2>

              <p className="mb-2">
                <strong>Code:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.item.code ||
                  "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Name:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.item.description ||
                  "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>From Location:</strong>{" "}
                {selectedTransfer.fromLocation.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>To Location:</strong>{" "}
                {selectedTransfer.toLocation.description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Category:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.item.category
                  .description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Brand:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.item.brand
                  .description || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Unit:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.item
                  .unitDescription || "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Lable Price:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.lablePrice !==
                undefined
                  ? `Rs. ${selectedTransfer.itemTransferDetails[0].lablePrice.toFixed(2)}`
                  : "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Retail Price:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.retailPrice !==
                undefined
                  ? `Rs. ${selectedTransfer.itemTransferDetails[0].retailPrice.toFixed(2)}`
                  : "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Wholesale Price:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.wholesalePrice !==
                undefined
                  ? `Rs. ${selectedTransfer.itemTransferDetails[0].wholesalePrice.toFixed(2)}`
                  : "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Retail Discount:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.retailDiscount ||
                  "Unavailable"}
              </p>

              <p className="mb-2">
                <strong>Wholsale Discount:</strong>{" "}
                {selectedTransfer.itemTransferDetails[0]?.wholesaleDiscount ||
                  "Unavailable"}
              </p>

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={
                        selectedTransfer.itemTransferDetails[0]?.item.status
                      }
                      onChange={(e) =>
                        setSelectedTransfer((prev: any) => ({
                          ...prev,
                          itemTransferDetails: [
                            {
                              ...prev.itemTransferDetails[0],
                              item: {
                                ...prev.itemTransferDetails[0].item,
                                status: e.target.value,
                              },
                            },
                            ...prev.itemTransferDetails.slice(1),
                          ],
                        }))
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
                  <strong>Status:</strong>{" "}
                  {
                    selectedTransfer.itemTransferDetails[0]?.item
                      .statusDescription
                  }
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

export default withAuth(Transfer);
