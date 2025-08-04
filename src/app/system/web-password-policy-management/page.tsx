"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import { IPasswordPolicy } from "@/types";
import { REFDATA, UPDATE, VIEW } from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";

function WebPolicy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originalPassword, setOriginalPassword] =
    useState<IPasswordPolicy | null>(null);

  const [password, setPassword] = useState<IPasswordPolicy>({
    id: 0,
    minUpperCase: 0,
    minLowerCase: 0,
    minNumbers: 0,
    minSpecialCharacters: 0,
    minLength: 0,
    maxLength: 0,
    passwordHistory: 0,
    attemptExceedCount: 0,
    otpExceedCount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Privileges and defaultStatus state
  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    userRolePrivilegeAssign: false,
  });

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/web-password-policy/update",
        {
          ...password,
        },
        UPDATE,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "Policy updated successfully",
        );

        fetchPolicies();
      } else if (response?.success == false && response?.errorCode == 1002) {
        showErrorAlert(
          "Policy Updated Failed",
          response?.message || "Something went wrong!",
        );
      } else {
        showErrorAlert(
          "Policy Updated Failed",
          response?.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
      showErrorAlert(
        "Policy Updated Failed",
        "Sum of min character requirements must be >= minLength & Max length  must be less than 50",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    if (originalPassword) {
      setPassword(originalPassword);
    }
  };

  // Fetch reference data first before tasks
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/web-password-policy/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        fetchPolicies();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch tasks logic

  const fetchPolicies = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/web-password-policy/view",
        {},
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setPassword(response.data);
        setOriginalPassword(response.data); // Save initial policy for reset
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormChanged = () => {
    if (!originalPassword) return false;
    return Object.keys(password).some(
      (key) =>
        password[key as keyof IPasswordPolicy] !==
        originalPassword[key as keyof IPasswordPolicy],
    );
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Password Policy Management" />

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
                <div className="col mb-4 gap-4 md:flex">
                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Min Uppercase <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="minUpperCase"
                      value={password.minUpperCase}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Min Lowercase <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="minLowerCase"
                      value={password.minLowerCase}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Min Numbers <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="minNumbers"
                      value={password.minNumbers}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>
                <div className="col mb-4 gap-4 md:flex">
                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Min Special Characters{" "}
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="minSpecialCharacters"
                      value={password.minSpecialCharacters}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Min Length
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="minLength"
                      value={password.minLength}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Max Length
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxLength"
                      value={password.maxLength}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>
                <div className="col mb-4 gap-4 md:flex">
                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Password History
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="passwordHistory"
                      value={password.passwordHistory}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Attempt Exceed Count
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="attemptExceedCount"
                      value={password.attemptExceedCount}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4 w-full xl:w-1/3">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      OTP Exceed Count
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="otpExceedCount"
                      value={password.otpExceedCount}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex justify-center rounded-lg bg-gray-500 p-3 px-8 py-2 font-medium text-gray hover:bg-gray-400"
                  >
                    Reset
                  </button>

                  {privileges.update && (
                    <button
                      type="submit"
                      disabled={loading || !isFormChanged()}
                      className={`flex justify-center rounded-lg p-3 px-8 py-2 font-medium text-gray ${
                        loading || !isFormChanged()
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-primary hover:bg-hover"
                      }`}
                    >
                      {loading ? "Updating..." : "Update Policies"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default withAuth(WebPolicy);
