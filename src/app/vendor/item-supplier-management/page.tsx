"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  ChevronDown,
  ChevronUp,
  FilePenLine,
  LockOpen,
  ScanEye,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { ISupplierFilter, ISupplierList, ISupplierCreation } from "@/types";
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

interface Company {
  code: string;
  description: string;
}

interface GroupedCompanies {
  group: string;
  companies: Company[];
}

function Supplier() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierList, setSupplierList] = useState<ISupplierList[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // task filter state

  const [supplier, setSupplier] = useState<ISupplierFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      firstName: "",
      lastName: "",
      primaryMobile: "",
      primaryEmail: "",
      company: "",
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
    userRolePrivilegeAssign: false,
    passwordReset: false,
  });

  const [defaultStatus, setDefaultStatus] = useState<
    { code: string; description: string }[]
  >([]);

  const [title, setTitle] = useState<{ code: string; description: string }[]>(
    [],
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState<ISupplierCreation>({
    title: "",
    firstName: "",
    lastName: "",
    primaryMobile: "",
    primaryEmail: "",
    company: "",
    status: "ACTIVE",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupplier((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/item-supplier/add",
        {
          ...newSupplier,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "User created successfully",
        );
        setShowAddModal(false);
        fetchSupplier();
        // Reset form fields
        setNewSupplier({
          title: "",
          firstName: "",
          lastName: "",
          primaryMobile: "",
          primaryEmail: "",
          company: "",
          status: "",
        });
      } else {
        showErrorAlert(
          "Supplier Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic

  const handlePageChange = (newPage: number) => {
    setSupplier((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (supplier.page > 0) {
      const newPage = supplier.page - 1;
      setCurrentPage(newPage);
      setSupplier({ ...supplier, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (supplier.page < totalPages - 1) {
      const newPage = supplier.page + 1;
      setCurrentPage(newPage);
      setSupplier({ ...supplier, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setSupplier((prev) => ({
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
    const isActive = supplier.sortColumn === column;
    const direction = supplier.sortDirection;

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
    firstName: "",
    lastName: "",
    primaryMobile: "",
    primaryEmail: "",
    company: "",
    status: "",
  });

  useEffect(() => {
    fetchSupplier();
  }, [supplier]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setSupplier({
      ...supplier,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const resetFilters = () => {
    const clearedFilters = {
      firstName: "",
      lastName: "",
      primaryMobile: "",
      primaryEmail: "",
      company: "",
      status: "",
    };
    setSelectedFilters(clearedFilters);
    setSupplier({
      ...supplier,
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
        "api/v1/item-supplier/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setTitle(response.data.title || []);
        fetchSupplier();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-supplier/filter-list",
        { ...supplier },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setSupplierList(response.data.content || []);
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

  const handleViewSupplier = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-supplier/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedSupplier(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditSupplier = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item-supplier/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedSupplier(response.data);
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
      const payload = {
        ...selectedSupplier,
      };
      const response = await postLoginRequest(
        "api/v1/item-supplier/update",
        payload,
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
        fetchSupplier();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // Reset Password
  // const handleResetPasswordUser = async (id: number) => {
  //   const result = await Swal.fire({
  //     title: "Are you sure to reset password?",
  //     text: "You won’t be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, reset it!",
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       const token = getSessionData("accessToken") || "";
  //       const username = getSessionData("userProfile")?.username || "";
  //       const userToReset = userList.find((u) => u.id === id);

  //       const response = await postLoginRequest(
  //         "file-analytics/api/v1/user/sent-otp",
  //         { newUsername: userToReset?.newUsername || "" },
  //         UPDATE,
  //         token,
  //         username,
  //       );

  //       if (response.success) {
  //         Swal.fire(
  //           "OTP sent successfully",
  //           "Check your mobile and get new password.",
  //           "success",
  //         );
  //         fetchUser();
  //       } else {
  //         showErrorAlert(response.message);
  //       }
  //     } catch (error) {
  //       console.error("Reset error:", error);
  //     }
  //   }
  // };

  const handleDeleteSupplier = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getSessionData("accessToken") || "";
        const username = getSessionData("userProfile")?.username || "";
        const response = await postLoginRequest(
          "api/v1/item-supplier/delete",
          { id },
          DELETE,
          token,
          username,
        );

        if (response.success) {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchSupplier();
        } else {
          showErrorAlert(response.message);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Supplier Management" />

      <>
        {privileges.search && (
          <div className="mt-3">
            <div className="col mb-1 gap-4 md:flex">
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.firstName}
                  onChange={(e) =>
                    handleFilterChange("firstName", e.target.value)
                  }
                />
              </div>
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.lastName}
                  onChange={(e) =>
                    handleFilterChange("lastName", e.target.value)
                  }
                />
              </div>
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="Company"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.company}
                  onChange={(e) =>
                    handleFilterChange("company", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col mb-1 gap-4 md:flex">
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.primaryEmail}
                  onChange={(e) =>
                    handleFilterChange("primaryEmail", e.target.value)
                  }
                />
              </div>
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="Mobile"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.primaryMobile}
                  onChange={(e) =>
                    handleFilterChange("primaryMobile", e.target.value)
                  }
                />
              </div>
              <div className="mb-1 w-full xl:w-1/3">
                <div className="relative w-full">
                  <select
                    className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
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
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          {/* Add Button on the left */}
          {privileges.add && (
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
            >
              Add
            </button>
          )}

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
                    className="w-[20%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center justify-center">
                      First Name {renderSortIcons("firstName")}
                    </div>
                  </th>
                  <th
                    className="w-[20%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("lastName")}
                  >
                    <div className="flex items-center justify-center">
                      lastName {renderSortIcons("lastName")}
                    </div>
                  </th>
                  <th
                    className="w-[40%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("primaryMobile")}
                  >
                    <div className="flex items-center justify-center">
                      Mobile {renderSortIcons("primaryMobile")}
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
                {supplierList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  supplierList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800"
                    >
                      <td className="w-[10%] px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {privileges.view && (
                            <button
                              onClick={() =>
                                handleViewSupplier(item.id.toString())
                              }
                              title="View User"
                            >
                              <ScanEye className="h-5 w-5 text-primary" />
                            </button>
                          )}
                          {privileges.update && (
                            <button
                              onClick={() =>
                                handleEditSupplier(item.id.toString())
                              }
                              title="Edit User"
                            >
                              <FilePenLine className="h-5 w-5 text-success" />
                            </button>
                          )}
                          {privileges.delete && (
                            <button
                              onClick={() => handleDeleteSupplier(item.id)}
                              title="Delete User"
                            >
                              <Trash2 className="h-5 w-5 text-danger" />
                            </button>
                          )}
                          {/* {privileges.passwordReset && (
                            <button
                              onClick={() => handleResetPasswordUser(item.id)}
                              title="Reset Password"
                            >
                              <LockOpen className="h-5 w-5 text-gray-500" />
                            </button>
                          )} */}
                        </div>
                      </td>
                      <td className="w-[20%] px-6 py-4">{item.firstName}</td>
                      <td className="w-[20%] px-6 py-4">{item.lastName}</td>
                      <td className="w-[40%] px-6 py-4">
                        {item.primaryMobile}
                      </td>
                      <td className="w-[10%] px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {item.statusDescription}
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
            Page {supplier.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={supplier.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                supplier.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={supplier.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                supplier.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedSupplier && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40 ">
            <div className="hide-scrollbar relative m-2 max-h-[500px] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
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
                {modalMode === "view"
                  ? "View Supplier Account"
                  : "Edit Supplier Account"}
              </h2>

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Title:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.title}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          title: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a title</option>
                      {title.map((title) => (
                        <option key={title.code} value={title.code}>
                          {title.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              ) : (
                <p className="mb-2">
                  <strong>Status:</strong> {selectedSupplier.statusDescription}
                </p>
              )}

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>First Name:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.firstName}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>First Name:</strong> {selectedSupplier.firstName}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>Last Name:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.lastName}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Last Name:</strong> {selectedSupplier.lastName}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>Mobile:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.primaryMobile}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          primaryMobile: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Mobile:</strong> {selectedSupplier.primaryMobile}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>Email:</strong>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.primaryEmail}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          primaryEmail: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Email:</strong> {selectedSupplier.primaryEmail}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>Comapny:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.company}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          company: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Company:</strong> {selectedSupplier.company || "Unavailable"}
                  </p>
                )}
              </div>

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedSupplier.status}
                      onChange={(e) =>
                        setSelectedSupplier({
                          ...selectedSupplier,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a status</option>
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
                  <strong>Status:</strong> {selectedSupplier.statusDescription}
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
                    disabled={loading}
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add user modal  */}
        {showAddModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
            <div className="hide-scrollbar relative m-2 max-h-[500px] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
              {/* Close Icon Top-Right */}
              <button
                onClick={() => setShowAddModal(false)}
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
              <h2 className="mb-4 text-lg font-semibold">Add New Supplier</h2>
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <select
                    className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={newSupplier.title}
                    required
                    name="title"
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, title: e.target.value })
                    }
                  >
                    <option value="">Select Title</option>
                    {title.map((title) => (
                      <option key={title.code} value={title.code}>
                        {title.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  pattern="[A-Za-z]+"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newSupplier.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  pattern="[A-Za-z]+"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newSupplier.lastName}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  placeholder="Email"
                  name="primaryEmail"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newSupplier.primaryEmail}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  name="primaryMobile"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  minLength={10}
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newSupplier.primaryMobile}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Company"
                  name="company"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newSupplier.company}
                  onChange={handleChange}
                />
                <div className="relative">
                  <select
                    className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={newSupplier.status}
                    required
                    name="status"
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, status: e.target.value })
                    }
                  >
                    <option value="">Select Status</option>
                    {defaultStatus.map((status) => (
                      <option key={status.code} value={status.code}>
                        {status.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-hover"
                  >
                    {loading ? "Adding..." : "Add Supplier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </DefaultLayout>
  );
}

export default withAuth(Supplier);
