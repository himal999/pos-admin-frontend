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
import { IUserCreation, IUserFilter, IUserList } from "@/types";
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
import { comma } from "postcss/lib/list";
import withAuth from "@/utils/withAuth";

interface Company {
  code: string;
  description: string;
}

interface GroupedCompanies {
  group: string;
  companies: Company[];
}

function UserAccount() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTooltipNew, setShowTooltipNew] = useState(false);
  const [showTooltipConfirm, setShowTooltipConfirm] = useState(false);
  const [usernamePolicy, setUserNamePolicy] = useState<any>(null);

  // task filter state

  const [user, setUser] = useState<IUserFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      newUsername: "",
      userRole: "",
      nic: "",
      email: "",
      mobile: "",
      firstName: "",
      lastName: "",
      status: "",
      loginStatus: "",
      company: {
        code: "",
        description: "",
      },
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

  const [groups, setGroups] = useState<{ code: string; description: string }[]>(
    [],
  );
  const [groupedCompanies, setGroupedCompanies] = useState<GroupedCompanies[]>(
    [],
  );

  // userRoles
  const [userRole, setUserRole] = useState<
    {
      id: number;
      code: string;
      description: string;
    }[]
  >([]);

  // Validate NIC
  const validateNIC = (nic: string): boolean => {
    const oldNicPattern = /^[0-9]{9}[vVxX]$/; // For the old NIC with the last character being 'v', 'V', 'x', or 'X'.
    const newNicPattern = /^[0-9]{12}$/; // For the new NIC with 12 numeric characters.

    // Check if the NIC matches either the old or new pattern
    if (oldNicPattern.test(nic)) {
      // Old NIC validation logic (modulo 11)
      const kConstantOldNIC = [3, 2, 7, 6, 5, 4, 3, 2, 0];
      const nicPart1 = nic[nic.length - 1].toLowerCase(); // Last character (v, V, x, X)
      const nicPart2 = nic.substring(0, nic.length - 1); // First 9 characters of the NIC

      const numbers = Array.from(nicPart2).map((digit) => parseInt(digit));
      const values = numbers.map((num, index) => num * kConstantOldNIC[index]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const moduleVal = sum % 11;

      const lastDigit = parseInt(nicPart2[nicPart2.length - 1]);

      // Validate the last character based on the module value
      if (moduleVal <= 1) {
        return lastDigit === 0;
      } else {
        const remainingValue = 11 - moduleVal;
        return lastDigit === remainingValue;
      }
    } else if (newNicPattern.test(nic)) {
      // New NIC validation logic (modulo 11)
      const kConstantNewNIC = [8, 4, 3, 2, 7, 6, 5, 8, 4, 3, 2, 0];
      const numbers = Array.from(nic).map((digit) => parseInt(digit));
      const values = numbers.map((num, index) => num * kConstantNewNIC[index]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const moduleVal = sum % 11;

      const lastDigit = parseInt(nic[nic.length - 1]);

      // Validate the last character based on the module value
      if (moduleVal <= 1) {
        return lastDigit === 0;
      } else {
        const remainingValue = 11 - moduleVal;
        return lastDigit === remainingValue;
      }
    }

    return false; // If neither pattern matches
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<IUserCreation>({
    newUsername: "",
    userRole: "",
    nic: "",
    email: "",
    mobile: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateNIC(newUser.nic)) {
      showErrorAlert(
        "Invalid NIC!",
        "Please enter a valid Sri Lankan NIC number.",
      );
      return;
    }

    setLoading(true);
    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/user/add",
        {
          ...newUser,
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
        fetchUser();
        // Reset form fields
        setNewUser({
          newUsername: "",
          userRole: "",
          nic: "",
          email: "",
          mobile: "",
          firstName: "",
          lastName: "",
        });
      } else {
        showErrorAlert(
          "User Create Failed",
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
    setUser((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (user.page > 0) {
      const newPage = user.page - 1;
      setCurrentPage(newPage);
      setUser({ ...user, page: newPage });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecords / size);
    if (user.page < totalPages - 1) {
      const newPage = user.page + 1;
      setCurrentPage(newPage);
      setUser({ ...user, page: newPage });
    }
  };

  // sorting logic

  const handleSort = (column: string) => {
    setUser((prev) => ({
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
    const isActive = user.sortColumn === column;
    const direction = user.sortDirection;

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
    newUsername: "",
    userRole: "",
    nic: "",
    email: "",
    mobile: "",
    firstName: "",
    lastName: "",
    status: "",
    loginStatus: "",
    company: {
      code: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchUser();
  }, [user]);

  // Mosdal logic

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setUser({
      ...user,
      page: 0,
      search: { ...selectedFilters },
    });
  };

  const getUsernamePolicyTooltip = () => {
    if (!usernamePolicy) return "";

    const {
      minLength,
      maxLength,
      minUpperCase,
      minLowerCase,
      minNumbers,
      minSpecialCharacters,
    } = usernamePolicy;

    return `Username must be:
 ${minLength} to ${maxLength} characters long
 At least ${minUpperCase} uppercase letter(s)
 At least ${minLowerCase} lowercase letter(s)
 At least ${minNumbers} number(s)
 At least ${minSpecialCharacters} special character(s)`;
  };

  const resetFilters = () => {
    const clearedFilters = {
      newUsername: "",
      userRole: "",
      nic: "",
      email: "",
      mobile: "",
      firstName: "",
      lastName: "",
      status: "",
      loginStatus: "",
      company: {
        code: "",
        description: "",
      },
    };
    setSelectedFilters(clearedFilters);
    setUser({
      ...user,
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
        "api/v1/user/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setUserRole(response.data.userRole || []);
        setGroups(response.data.group || []);
        setUserNamePolicy(response.data.usernamePolicy || null);

        console.log(response.data.companies);
        const data: Record<string, Company[]> = response.data.companies;
        console.log(data, "data");

        const grouped: GroupedCompanies[] = Object.entries(data).map(
          ([group, companies]) => ({
            group,
            companies,
          }),
        );

        setGroupedCompanies(grouped);

        fetchUser();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/user/filter-list",
        { ...user },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        setUserList(response.data.content || []);
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

  const handleViewUser = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/user/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedUser(response.data);
        setModalMode("view");
        setShowModal(true);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleEditUser = async (id: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/user/view",
        { id },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedUser(response.data);
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
        ...selectedUser,
        userRole: selectedUser.userRole?.code || "", // ✅ only pass the code
      };
      const response = await postLoginRequest(
        "api/v1/user/update",
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
        fetchUser();
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

  const handleDeleteUser = async (id: number) => {
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
          "api/v1/user/delete",
          { id },
          DELETE,
          token,
          username,
        );

        if (response.success) {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUser();
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
      <Breadcrumb pageName="User Account Management" />

      <>
        {privileges.search && (
          <div className="mt-3">
            <div className="col mb-1 gap-4 md:flex">
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.newUsername}
                  onChange={(e) =>
                    handleFilterChange("newUsername", e.target.value)
                  }
                />
              </div>

              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="NIC"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.nic}
                  onChange={(e) => handleFilterChange("nic", e.target.value)}
                />
              </div>
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="text"
                  placeholder="Mobile"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.mobile}
                  onChange={(e) => handleFilterChange("mobile", e.target.value)}
                />
              </div>
            </div>
            <div className="col mb-1 gap-4 md:flex">
              <div className="mb-1 w-full xl:w-1/3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                  value={selectedFilters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                />
              </div>

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
            </div>
            <div className="col mb-1 gap-4 md:flex">
              <div className="mb-1 w-full xl:w-1/3">
                <div className="relative w-full">
                  <select
                    className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.userRole}
                    onChange={(e) =>
                      handleFilterChange("userRole", e.target.value)
                    }
                  >
                    <option value="">User Role</option>
                    {userRole.map((user) => (
                      <option key={user.code} value={user.code}>
                        {user.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>
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
              <div className="mb-1 w-full xl:w-1/3">
                <div className="relative w-full">
                  <select
                    className="w-full appearance-none rounded-xl border p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.loginStatus}
                    onChange={(e) =>
                      handleFilterChange("loginStatus", e.target.value)
                    }
                  >
                    <option value="">Login Status</option>
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
                className="w-20 rounded-lg border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-hover"
              >
                Search
              </button>
              <button
                onClick={resetFilters}
                className="w-20 rounded-lg border border-gray-500 bg-gray-500 px-4 py-1.5 text-sm font-medium text-white hover:border-gray-400 hover:bg-gray-400"
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
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center justify-center">
                      Username {renderSortIcons("username")}
                    </div>
                  </th>
                  <th
                    className="w-[60%] cursor-pointer px-6 py-3 text-center"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center justify-center">
                      Email {renderSortIcons("email")}
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
                {userList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  userList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b bg-white text-center dark:border-gray-700 dark:bg-gray-800"
                    >
                      <td className="w-[10%] px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {privileges.view && (
                            <button
                              onClick={() => handleViewUser(item.id.toString())}
                              title="View User"
                            >
                              <ScanEye className="h-5 w-5 text-primary" />
                            </button>
                          )}
                          {privileges.update && (
                            <button
                              onClick={() => handleEditUser(item.id.toString())}
                              title="Edit User"
                            >
                              <FilePenLine className="h-5 w-5 text-success" />
                            </button>
                          )}
                          {privileges.delete && (
                            <button
                              onClick={() => handleDeleteUser(item.id)}
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
                      <td className="w-[30%] px-6 py-4">{item.newUsername}</td>
                      <td className="w-[50%] px-6 py-4">{item.email}</td>
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
            Page {user.page + 1} of {Math.ceil(totalRecords / size)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={user.page === 0}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                user.page === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={user.page >= Math.ceil(totalRecords / size) - 1}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                user.page >= Math.ceil(totalRecords / size) - 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-600"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && selectedUser && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
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
                  ? "View User Account"
                  : "Edit User Account"}
              </h2>

              {selectedUser.company && (
                <p className="mb-2">
                  <strong>Company:</strong> {selectedUser.company.description}
                </p>
              )}

              <p className="mb-2">
                <strong>User Name:</strong> {selectedUser.newUsername}
              </p>

              <p className="mb-2">
                <strong>User Role:</strong> {selectedUser.userRole.description}
              </p>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>Email:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>First Name:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedUser.firstName}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>First Name:</strong> {selectedUser.firstName}
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
                      value={selectedUser.lastName}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Last Name:</strong> {selectedUser.lastName}
                  </p>
                )}
              </div>

              <div className="mb-2">
                {modalMode === "edit" ? (
                  <>
                    <strong>NIC:</strong>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedUser.nic}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          nic: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>NIC:</strong> {selectedUser.nic}
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
                      value={selectedUser.mobile}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          mobile: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <p className="mb-2">
                    <strong>Mobile:</strong> {selectedUser.mobile}
                  </p>
                )}
              </div>

              {modalMode === "edit" ? (
                <div className="my-2">
                  <strong>Status:</strong>

                  <div className="relative w-full">
                    <select
                      className="mt-1 w-full appearance-none rounded-lg border p-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      value={selectedUser.status}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
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
                  <strong>Status:</strong> {selectedUser.statusDescription}
                </p>
              )}
              <p className="mb-2">
                <strong>Login Status:</strong> {selectedUser.loginStatus}
              </p>
              <p className="mb-2">
                <strong>Created Date:</strong> {selectedUser.createdDate}
              </p>
              <p className="mb-2">
                <strong>Modified Date:</strong> {selectedUser.lastModifiedDate}
              </p>
              <p className="mb-2">
                <strong>Created By:</strong> {selectedUser.createdBy}
              </p>
              <p className="mb-2">
                <strong>Modified By:</strong> {selectedUser.lastModifiedBy}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-20 rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                >
                  Close
                </button>
                {modalMode === "edit" && (
                  <button
                    disabled={loading}
                    onClick={handleSaveEdit}
                    className="w-20 rounded-lg bg-primary px-4 py-2 text-sm text-white"
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
              <h2 className="mb-4 text-lg font-semibold">Add New User</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-2 flex items-center justify-end">
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setShowTooltipNew(true)}
                    onMouseLeave={() => setShowTooltipNew(false)}
                    onClick={() => setShowTooltipNew(!showTooltipNew)}
                  >
                    <svg
                      className="h-4 w-4 text-gray-500 hover:text-gray-900"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
                    </svg>
                    {showTooltipNew && (
                      <div className="absolute right-0 z-10 mt-2 w-72 whitespace-pre-wrap rounded-xl bg-gray-800 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-700">
                        {getUsernamePolicyTooltip()}
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  name="newUsername"
                  onChange={handleChange}
                  pattern="^\S+$"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.newUsername}
                />
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  pattern="[A-Za-z]+"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  pattern="[A-Za-z]+"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.lastName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="NIC"
                  name="nic"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.nic}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  required
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  name="mobile"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  minLength={10}
                  className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newUser.mobile}
                  onChange={handleChange}
                />

                <div className="relative">
                  <select
                    className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                    value={newUser.userRole}
                    required
                    name="userRole"
                    onChange={(e) =>
                      setNewUser({ ...newUser, userRole: e.target.value })
                    }
                  >
                    <option value="">Select Role</option>
                    {userRole.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.description}
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
                    {loading ? "Adding..." : "Add User"}
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

export default withAuth(UserAccount);
