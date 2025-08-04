"use client";
import React, { useState } from "react";
import type { ILoginData } from "@/types";
import { useRouter } from "next/navigation";
import { postLoginRequest, postRequest } from "@/services/api.service";
import { getSessionData, setSessionData } from "@/utils/session";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";
import Footer from "@/components/general/footer";
import { LOGIN, PAGES } from "@/utils/apiMessage";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loginData, setLoginData] = useState<ILoginData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
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
        "api/v1/login/login",
        {
          // username: loginData.username,
          password: loginData.password,
        },
        LOGIN,
        loginData?.username,
      );

      if (response?.success) {
        console.log("Login successful:", response?.data);
        // Set Token
        setSessionData("accessToken", response?.data?.tokenDetails.accessToken);
        setSessionData(
          "refreshToken",
          response?.data?.tokenDetails.refreshToken,
        );
        setSessionData("userProfile", response?.data?.profileDetails);

        // Store Pages Data in Session Storage
        var token = getSessionData("accessToken") || "";
        const authResponse = await postLoginRequest(
          "api/v1/login/left-menu",
          {},
          PAGES,
          token,
          loginData?.username,
        );

        if (authResponse?.success) {
          setSessionData("pages", authResponse.data);
          router.push("/dashboard");
          showSuccessAlert("Login Successful", "Redirecting to dashboard...");
          console.log("Authorization data:", authResponse.data);
        } else {
          showErrorAlert(
            "Login Failed",
            authResponse?.message || "You are user role is inactive or delete.",
          );
        }
      }

      // State Handle
      else if (
        (response?.success == false && response?.errorCode == 1004) ||
        response?.errorCode == 1003
      ) {
        showErrorAlert(
          "Login Failed",
          response?.message || "Something went wrong!",
          "Reset Password",
          undefined,
          `/admin/auth/resetPassword?username=${encodeURIComponent(loginData.username)}`,
        );
      } else if (
        (response?.success == false && response?.errorCode == 1006) ||
        response?.errorCode == 1005
      ) {
        showErrorAlert(
          "Login Failed",
          response?.message || "Something went wrong!",
        );
      } else {
        // setError(response?.message);
        showErrorAlert(
          "Login Failed",
          response?.message || "Something went wrong!",
        );
      }
    } catch (err) {
      showErrorAlert(
        "Login Failed",
        "Username or password invalid, Please try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
      <div
        className="flex flex-grow flex-col items-center justify-center bg-gray-100 p-5 md:p-0 lg:p-0"
        style={{
          backgroundImage: "url('/admin/images/bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute top-0 z-10 ">
          <div className="flex items-center gap-1 rounded-b-2xl bg-white bg-opacity-90 px-4 py-3">
            <img
              className="h-auto w-8"
              src={"/admin/images/logo/icon.png"}
              alt="Icon"
            />
            <span className="text-2xl font-extrabold text-secondary dark:text-white">
              AVENTA<span className="text-primary">POS</span>
            </span>
          </div>
        </div>

        <div className="flex max-w-md flex-col rounded-3xl border-2 border-primary bg-white px-6 py-8 shadow-md sm:px-6 md:px-8 lg:px-10">
          <div className="self-center text-2xl font-medium text-gray-800 sm:text-3xl">
            Welcome Back
          </div>
          <div className="mt-4 self-center text-sm text-gray-800 sm:text-sm">
            Enter your credentials to access your account
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-5 flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-1 text-sm tracking-wide text-gray-600"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                    <i className="fas fa-at text-primary"></i>
                  </div>

                  <input
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-4 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="mb-2 flex flex-col">
                <label
                  htmlFor="password"
                  className="mb-1 text-sm tracking-wide text-gray-600"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                    <span>
                      <i className="fas fa-lock text-primary"></i>
                    </span>
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
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
              <div className="mb-4 flex flex-col">
                <a
                  href="/auth/requestOTP"
                  className="text-end text-xs font-semibold text-primary"
                >
                  Forgot your password?
                </a>
              </div>

              <div className="flex w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary py-2 text-sm text-white transition duration-150 ease-in hover:bg-hover focus:outline-none sm:text-base"
                >
                  <span className="mr-2 uppercase">
                    {loading ? "Logging in..." : "Login"}
                  </span>
                  <span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>We&apos;ll never share your information with anyone else.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
