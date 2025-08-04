"use client";
import React, { useState } from "react";
import type { IRequestPasswordOTP } from "@/types";
import { postRequest } from "@/services/api.service";
import { useRouter } from "next/navigation";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";
import Footer from "@/components/general/footer";
import { REQUESTOTP } from "@/utils/apiMessage";

export default function RequestOTP() {
  const router = useRouter();
  const [requestOTP, setRequestOTP] = useState<IRequestPasswordOTP>({
    username: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestOTP((prevData) => ({
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
        "file-analytics/api/v1/password/sent-otp",
        {
          username: requestOTP.username,
        },
        REQUESTOTP,
        requestOTP.username,
      );
      if (response.success) {
        console.log("OTP successfully Sent!:", response);
        showSuccessAlert(
          "Password Sent Successful",
          "Check your email get your new password",
        );
        router.push("/auth/login");
        // Navigate to next page with username as query parameter
        // router.push(
        //   `/auth/validateOTP?username=${encodeURIComponent(requestOTP.username)}`,
        // );
      } else {
        setError(response.message);
        showErrorAlert(
          "OTP Sent Failed",
          response?.message || "Something went wrong!",
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
          <div className="m-4 w-full max-w-md rounded-xl border border-gray-300 p-6 md:m-4">
            <h1 className="mb-6 text-center text-3xl font-semibold text-black">
              Request OTP
            </h1>
            <h1 className="mb-6 text-center text-sm font-semibold text-gray-500">
              Enter your username to request an OTP
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-5 flex flex-col">
                <label
                  htmlFor="User Name"
                  className="mb-1 text-sm tracking-wide text-gray-600"
                >
                  Username:
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                    <i className="fas fa-user text-primary"></i>
                  </div>

                  <input
                    type="text"
                    name="username"
                    value={requestOTP.username}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-400 py-2 pl-10 pr-4 text-sm text-black placeholder-gray-500 focus:border-hover focus:outline-none"
                    placeholder="Enter your username or email"
                  />
                </div>
              </div>
              <div className="flex w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary py-2 text-sm text-white transition duration-150 ease-in hover:bg-hover focus:outline-none sm:text-base"
                >
                  <span className="mr-2 uppercase">
                    {loading ? "Requesting..." : "Request"}
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
