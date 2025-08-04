"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { RESETPASSWORD } from "@/utils/apiMessage";
import React, { useState, useEffect } from "react";
import type { IResetPassword, IUserProfile } from "@/types";
import { postRequest } from "@/services/api.service";
import { useRouter, useSearchParams } from "next/navigation";
import { getSessionData } from "@/utils/session";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";

import withAuth from "@/utils/withAuth";
import { Info } from "lucide-react";

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [resetPassword, setResetPassword] = useState<IResetPassword>({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPassword((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const details = await getSessionData("userProfile");
        console.log("User Profile Details", details);
        if (details) {
          setUserProfile(details);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };
    fetchUserData();
  }, []);

  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading details...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userProfile = getSessionData("userProfile");
      const response = await postRequest(
        "api/v1/password/reset",
        {
          password: resetPassword.password,
          confirmPassword: resetPassword.confirmPassword,
        },
        RESETPASSWORD,
        userProfile?.username,
      );
      if (response.success) {
        showSuccessAlert(
          "Password Reset Successful",
          "Please log in using your new password.",
        );

        setResetPassword({
          username: userProfile.username,
          password: "",
          confirmPassword: "",
        });
      } else {
        showErrorAlert(
          "Reset Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8 xl:h-full xl:items-stretch">
          <div className="col-span-5 flex h-full flex-col xl:col-span-3">
            <div className="h-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Reset Your Password
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="New Password"
                        className="mb-1 text-sm tracking-wide text-gray-600 dark:text-gray-300"
                      >
                        New Password:
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                        <i className="fas fa-lock text-primary"></i>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={resetPassword.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-10 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2 text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <i className="fas fa-eye-slash"></i>
                        ) : (
                          <i className="fas fa-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-col">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="Confirm Password"
                        className="mb-1 text-sm tracking-wide text-gray-600 dark:text-gray-300"
                      >
                        Confirm Password:
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                        <i className="fas fa-lock text-primary"></i>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={resetPassword.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-10 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter your confirm password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2 text-primary"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <i className="fas fa-eye-slash"></i>
                        ) : (
                          <i className="fas fa-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !resetPassword.password ||
                        !resetPassword.confirmPassword ||
                        resetPassword.password !== resetPassword.confirmPassword
                      }
                      className={`mt-2 flex w-full items-center justify-center rounded-2xl py-2 text-sm text-white transition duration-150 ease-in focus:outline-none sm:text-base
                     ${
                       loading ||
                       !resetPassword.password ||
                       !resetPassword.confirmPassword ||
                       resetPassword.password !== resetPassword.confirmPassword
                         ? "cursor-not-allowed bg-gray-300 dark:bg-gray-600"
                         : "bg-primary hover:bg-hover"
                     }
                     `}
                    >
                      <span className="mr-2 uppercase">
                        {loading ? "Resetting..." : "Reset Password"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="relative col-span-5 flex h-full flex-col overflow-hidden xl:col-span-2">
            <div className="h-full rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center border-b border-stroke px-7 py-4 dark:border-strokedark">
                <Info className="h-6 w-6 text-red-500" />
                <span className="ms-1 flex-1 whitespace-nowrap text-start font-medium text-red-500">
                  About Password
                </span>
              </div>
              <div className="p-7">
                <div className="text-sm font-medium">
                  Password Expired Date :{" "}
                  <span className="font-bold">
                    {userProfile.passwordExpiredDate}
                  </span>
                </div>
                <p className="mt-4 text-xs">
                  Your password is set to expire on{" "}
                  {userProfile.passwordExpiredDate}. As that date approaches,
                  the system will notify you in advance, allowing you to reset
                  your password on time. Please ensure to update your password
                  before the expiration to avoid any login issues.
                </p>
              </div>
              <div className="-mt-15">
                <img
                  src="/admin/images/reset-password.png"
                  alt="Image"
                  className="relative -bottom-10 -left-5 h-40 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default withAuth(Settings);
