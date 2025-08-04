"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { postLoginRequest } from "@/services/api.service";
import { IAssignTask, IPrivilages } from "@/types";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import { ASSIGNEDTASK, GETASSIGNTASK, REFDATA } from "@/utils/apiMessage";
import { getSessionData } from "@/utils/session";
import withAuth from "@/utils/withAuth";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

function Privilege() {
  const [selectedTasksToAssign, setSelectedTasksToAssign] = useState<string[]>(
    [],
  );

  const [privilages, setPrivilages] = useState<IPrivilages>({
    page: "",
    userRole: "",
  });

  const [assign, setAssign] = useState<IAssignTask>({
    assignedTask: "",
    userRole: "",
    page: "",
  });

  const [section, setSection] = useState<
    { code: string; description: string }[]
  >([]);
  const [pagesBySection, setPagesBySection] = useState<
    Record<string, { code: string; description: string }[]>
  >({});
  const [userRole, setUserRole] = useState<
    { code: string; description: string }[]
  >([]);

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [selectedPage, setSelectedPage] = useState("");

  const [assignedTasks, setAssignedTasks] = useState<
    { code: string; description: string }[]
  >([]);
  const [unassignedTasks, setUnassignedTasks] = useState<
    { code: string; description: string }[]
  >([]);
  const [taskFetchSuccess, setTaskFetchSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [AddLoading, setAddLoading] = useState(false);
  const [RemoveLoading, setRemoveLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/privilege/assigned-unassigned-task",
        {
          userRole: selectedUserRole,
          page: selectedPage,
        },
        GETASSIGNTASK,
        token,
        userProfile?.username,
      );

      if (response.success) {
        setAssignedTasks(response.data.assignedTask || []);
        setUnassignedTasks(response.data.unAssignedTask || []);
        setTaskFetchSuccess(true); // Only show tables if this is true
        showSuccessAlert(
          "Privilege Check Success",
          response.message || "Privileges validated successfully!",
        );
      } else {
        setTaskFetchSuccess(false);
        showErrorAlert(
          "Check Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      setTaskFetchSuccess(false);
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTasksOnly = async () => {
    setAddLoading(true);
    setError(null);
    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");

      // Merge new selections with already assigned tasks to avoid overwriting
      const mergedTasks = Array.from(
        new Set([
          ...assignedTasks.map((t) => t.code),
          ...selectedTasksToAssign,
        ]),
      );

      const response = await postLoginRequest(
        "api/v1/privilege/assigned-privilege",
        {
          assignedTask: mergedTasks,
          userRole: selectedUserRole,
          page: selectedPage,
        },
        ASSIGNEDTASK,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Assignment Success",
          response.message || "Tasks assigned successfully.",
        );

        // Update the assignedTasks state by merging new tasks
        const newlyAssigned = unassignedTasks.filter((t) =>
          selectedTasksToAssign.includes(t.code),
        );
        setAssignedTasks((prev) => {
          const existingCodes = new Set(prev.map((t) => t.code));
          const merged = [...prev];
          newlyAssigned.forEach((task) => {
            if (!existingCodes.has(task.code)) {
              merged.push(task);
            }
          });
          return merged;
        });

        // Remove selected tasks from unassigned list
        setUnassignedTasks((prev) =>
          prev.filter((t) => !selectedTasksToAssign.includes(t.code)),
        );

        setSelectedTasksToAssign([]);
      } else {
        showErrorAlert(
          "Assignment Failed",
          response.message || "Failed to assign tasks.",
        );
      }
    } catch (error) {
      console.error("Assign privilege error:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveTasksOnly = async () => {
    setRemoveLoading(true);
    setError(null);
    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");

      // Calculate remaining tasks that should stay assigned
      const remainingAssignedTaskCodes = assignedTasks
        .filter((task) => !selectedTasksToAssign.includes(task.code))
        .map((task) => task.code);

      const response = await postLoginRequest(
        "api/v1/privilege/assigned-privilege",
        {
          assignedTask: remainingAssignedTaskCodes, // Send only the tasks that should remain
          userRole: selectedUserRole,
          page: selectedPage,
        },
        ASSIGNEDTASK,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Removal Success",
          response.message || "Tasks removed successfully.",
        );

        const removedTasks = assignedTasks.filter((task) =>
          selectedTasksToAssign.includes(task.code),
        );

        setAssignedTasks((prev) =>
          prev.filter((task) => !selectedTasksToAssign.includes(task.code)),
        );
        setUnassignedTasks((prev) => [...prev, ...removedTasks]);

        setSelectedTasksToAssign([]);
      } else {
        showErrorAlert(
          "Removal Failed",
          response.message || "Failed to remove tasks.",
        );
      }
    } catch (error) {
      console.error("Remove privilege error:", error);
    } finally {
      setRemoveLoading(false);
    }
  };

  useEffect(() => {
    const referenceData = async () => {
      try {
        var token = getSessionData("accessToken") || "";
        const userProfile = getSessionData("userProfile");
        const response = await postLoginRequest(
          "api/v1/privilege/reference-data",
          {},
          REFDATA,
          token,
          userProfile.username,
        );

        if (response.success) {
          console.log("Reference data load successful.");
          setUserRole(response.data.userRole || []);
          setSection(response.data.section || []);
          setPagesBySection(response.data.page || {});
        }
      } catch (error) {
        console.error("Error calling reference data:", error);
      }
    };

    referenceData();
  }, []);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="User Role Task Management" />

      <div className="grid grid-cols-1">
        <div className="flex flex-col gap-9">
          <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                User Role Task Management
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* User Role */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    User Role <span className="text-meta-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="userRole"
                      value={selectedUserRole}
                      onChange={(e) => setSelectedUserRole(e.target.value)}
                      required
                      className="w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled>
                        Select a user role
                      </option>
                      {userRole.map((role) => (
                        <option key={role.code} value={role.code}>
                          {role.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                {/* Section */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Section <span className="text-meta-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="section"
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setSelectedPage(""); // Reset page selection when section changes
                      }}
                      required
                      className="w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled>
                        Select a section
                      </option>
                      {section.map((sectionItem) => (
                        <option key={sectionItem.code} value={sectionItem.code}>
                          {sectionItem.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                {/* Page */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Page <span className="text-meta-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="page"
                      value={selectedPage}
                      onChange={(e) => setSelectedPage(e.target.value)}
                      required
                      className="w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled>
                        Select a page
                      </option>
                      {pagesBySection[selectedSection]?.length > 0 ? (
                        pagesBySection[selectedSection].map((pageItem) => (
                          <option key={pageItem.code} value={pageItem.code}>
                            {pageItem.description}
                          </option>
                        ))
                      ) : (
                        <option disabled>No pages available</option>
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center rounded-lg bg-primary p-3 px-8 py-2 font-medium text-gray hover:bg-hover"
                >
                  {loading ? "Checking..." : "Check Privileges"}
                </button>
              </div>
            </form>
          </div>

          {taskFetchSuccess && (
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Unassigned Task Table */}
              <div className="w-full md:w-1/2">
                <div className="relative overflow-x-auto rounded-2xl shadow-md">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          UnAssigned Task
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedTasks.length > 0 ? (
                        unassignedTasks.map((task) => (
                          <tr
                            key={task.code}
                            className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-between">
                                <span>{task.description}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedTasksToAssign.includes(
                                    task.code,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTasksToAssign((prev) => [
                                        ...prev,
                                        task.code,
                                      ]);
                                    } else {
                                      setSelectedTasksToAssign((prev) =>
                                        prev.filter((t) => t !== task.code),
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4">No unassigned tasks</td>
                        </tr>
                      )}
                    </tbody>
                    <button
                      type="button"
                      onClick={handleAssignTasksOnly}
                      disabled={
                        selectedTasksToAssign.length === 0 || AddLoading
                      }
                      className="flex-end m-2 flex rounded-lg bg-primary px-5 py-2 text-center text-sm font-medium text-white hover:bg-hover"
                    >
                      {AddLoading ? "Assigning..." : "Assign Permissions"}
                    </button>
                  </table>
                </div>
              </div>
              {/* Assigned Task Table */}
              <div className="w-full md:w-1/2">
                <div className="relative overflow-x-auto rounded-2xl shadow-md">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Assigned Task
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedTasks.length > 0 ? (
                        assignedTasks.map((task) => (
                          <tr
                            key={task.code}
                            className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-between">
                                <span>{task.description}</span>

                                <input
                                  type="checkbox"
                                  checked={selectedTasksToAssign.includes(
                                    task.code,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTasksToAssign((prev) => [
                                        ...prev,
                                        task.code,
                                      ]);
                                    } else {
                                      setSelectedTasksToAssign((prev) =>
                                        prev.filter((t) => t !== task.code),
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4">No assigned tasks</td>
                        </tr>
                      )}
                    </tbody>
                    <button
                      type="button"
                      onClick={handleRemoveTasksOnly}
                      disabled={
                        selectedTasksToAssign.length === 0 || RemoveLoading
                      }
                      className="flex-end m-2 flex rounded-lg bg-primary px-5 py-2 text-center text-sm font-medium text-white hover:bg-hover"
                    >
                      {RemoveLoading ? "Removing..." : "Remove Permissions"}
                    </button>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setError(arg0: null) {
  throw new Error("Function not implemented.");
}

export default withAuth(Privilege);
