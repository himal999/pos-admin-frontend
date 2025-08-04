"use client";
import React, { useState, useEffect } from "react";
import type { IResetPassword } from "@/types";
import { postRequest } from "@/services/api.service";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";
import Footer from "@/components/general/footer";
import { RESETPASSWORD } from "@/utils/apiMessage";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameFromUrl = searchParams?.get("username") || "";

  const [resetPassword, setResetPassword] = useState<IResetPassword>({
    username: usernameFromUrl,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await postRequest(
        "file-analytics/api/v1/password/reset",
        {
          username: resetPassword.username,
          password: resetPassword.password,
          confirmPassword: resetPassword.confirmPassword,
        },
        RESETPASSWORD,
        resetPassword.username,
      );
      if (response.success) {
        showSuccessAlert("Reset Successful", "Redirecting to login...");
        router.push("/auth/login");
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
    <div className="mx-auto flex h-screen w-full flex-col">
      <div className="flex h-screen">
        <div className="hidden flex-1 items-center justify-center bg-white text-black lg:flex">
          <div className="h-full w-full">
            <img
              src="/jit/images/bg.svg"
              alt="Background Image"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-gray-100 lg:w-2/5">
          <div className="m-3 w-full max-w-md rounded-xl border border-gray-300 p-6 md:m-4">
            <h1 className="mb-6 text-center text-3xl font-semibold text-black">
              Reset Password
            </h1>
            <h1 className="mb-6 text-center text-sm font-semibold text-gray-500">
              Enter your new password to access your account{" "}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="New Password"
                    className="mb-1 text-sm tracking-wide text-gray-600"
                  >
                    New Password:
                  </label>
                  {/* <div
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
                    {showTooltipNew && passwordPolicy && (
                      <div className="absolute right-0 z-10 mt-1 w-60 rounded bg-gray-800 p-3 text-xs text-white shadow-md">
                        <ul className="list-disc pl-4">
                          {passwordPolicy.minLength !== undefined && (
                            <li>
                              Must be at least {passwordPolicy.minLength}{" "}
                              characters long.
                            </li>
                          )}
                          {passwordPolicy.maxLength !== undefined && (
                            <li>
                              Must be no more than {passwordPolicy.maxLength}{" "}
                              characters long.
                            </li>
                          )}
                          {passwordPolicy.minUpperCase > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minUpperCase} uppercase letter(s)
                              (A-Z).
                            </li>
                          )}
                          {passwordPolicy.minLowerCase > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minLowerCase} lowercase letter(s)
                              (a-z).
                            </li>
                          )}
                          {passwordPolicy.minNumbers > 0 && (
                            <li>
                              Must contain at least {passwordPolicy.minNumbers}{" "}
                              number(s) (0-9).
                            </li>
                          )}
                          {passwordPolicy.minSpecialCharacters > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minSpecialCharacters} special
                              character(s) (!@#$%^&*).
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div> */}
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
                    className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-10 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none"
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
                    className="mb-1 text-sm tracking-wide text-gray-600"
                  >
                    Confirm Password:
                  </label>
                  {/* <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setShowTooltipConfirm(true)}
                    onMouseLeave={() => setShowTooltipConfirm(false)}
                    onClick={() => setShowTooltipConfirm(!showTooltipConfirm)}
                  >
                    <svg
                      className="h-4 w-4 text-gray-500 hover:text-gray-900"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
                    </svg>
                    {showTooltipConfirm && passwordPolicy && (
                      <div className="absolute right-0 z-10 mt-1 w-60 rounded bg-gray-800 p-3 text-xs text-white shadow-md">
                        <ul className="list-disc pl-4">
                          {passwordPolicy.minLength !== undefined && (
                            <li>
                              Must be at least {passwordPolicy.minLength}{" "}
                              characters long.
                            </li>
                          )}
                          {passwordPolicy.maxLength !== undefined && (
                            <li>
                              Must be no more than {passwordPolicy.maxLength}{" "}
                              characters long.
                            </li>
                          )}
                          {passwordPolicy.minUpperCase > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minUpperCase} uppercase letter(s)
                              (A-Z).
                            </li>
                          )}
                          {passwordPolicy.minLowerCase > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minLowerCase} lowercase letter(s)
                              (a-z).
                            </li>
                          )}
                          {passwordPolicy.minNumbers > 0 && (
                            <li>
                              Must contain at least {passwordPolicy.minNumbers}{" "}
                              number(s) (0-9).
                            </li>
                          )}
                          {passwordPolicy.minSpecialCharacters > 0 && (
                            <li>
                              Must contain at least{" "}
                              {passwordPolicy.minSpecialCharacters} special
                              character(s) (!@#$%^&*).
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div> */}
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
                    className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-10 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none"
                    placeholder="Enter your confirm password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-primary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                         ? "cursor-not-allowed bg-gray-300"
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
      <Footer />
    </div>
  );
}
