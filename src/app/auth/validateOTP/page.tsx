"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { IPasswordOTP } from "@/types";
import { postRequest } from "@/services/api.service";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";
import Footer from "@/components/general/footer";
import { REQUESTOTP, VALIDATEOTP } from "@/utils/apiMessage";

export default function ValidateOTP() {
  const router = useRouter();
  const [OTPData, setOTPData] = useState<IPasswordOTP>({
    username: "",
    otp: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [cooldown, setCooldown] = useState<number>(60);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const COOLDOWN_TIME = 60; // seconds

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const usernameFromUrl = params.get("username");
      if (usernameFromUrl) {
        setOTPData((prevData) => ({ ...prevData, username: usernameFromUrl }));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOTPChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (isNaN(Number(e.target.value))) return;

    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (e.target.nextElementSibling && e.target.value) {
      (e.target.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await postRequest(
        "file-analytics//api/v1/otp/validate",
        {
          username: OTPData.username,
          otp: otp.join(""),
        },
        VALIDATEOTP,
        OTPData.username,
      );
      if (response.success) {
        console.log("OTP verification successful:", response.data);
        showSuccessAlert(
          "Verification Successful",
          "Reset your password to get access",
        );
        router.push(`/auth/resetPassword?username=${OTPData.username}`);
      } else {
        setError(response.message);
        showErrorAlert(
          "Verification Failed",
          response?.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    try {
      const response = await postRequest(
        "message-service/api/v1/otp/send",
        {
          username: OTPData.username,
        },
        REQUESTOTP,
        OTPData.username,
      );
      if (response.success) {
        setAttemptCount(response.data.otpRequestAttempt);
        setCooldown(COOLDOWN_TIME);

        setCooldown(COOLDOWN_TIME);
      } else {
        setError(response.message);
        showErrorAlert(
          "OTP Send Faild",
          response?.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error(err);
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
              Validate OTP
            </h1>
            <h1 className="mb-6 text-center text-sm font-semibold text-gray-500">
              Verify your OTP code to reset your password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-5 flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(e, index)}
                    required
                    className="h-12 w-12 rounded-md border border-gray-400 text-center text-xl focus:outline-none focus:ring-2 focus:ring-hover"
                  />
                ))}
              </div>
              <div className="col w-full">
                <button
                  type="submit"
                  className={`mt-2 flex w-full items-center justify-center rounded-2xl py-2 text-sm text-white transition duration-150 ease-in focus:outline-none sm:text-base ${
                    otp.some((digit) => digit === "") || loading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-primary hover:bg-hover"
                  }`}
                  disabled={loading || otp.some((digit) => digit === "")}
                >
                  <span className="mr-2 uppercase">
                    {loading ? "Verifying..." : "Verify OTP"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  className={`mt-2 flex w-full items-center justify-center rounded-2xl py-2 text-sm text-black transition duration-150 ease-in focus:outline-none sm:text-base ${cooldown > 0 ? "cursor-not-allowed opacity-50" : "underline"}`}
                  disabled={cooldown > 0}
                >
                  <span className="mr-2 uppercase">
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </span>
                </button>
                {attemptCount !== null && (
                  <div className="mt-1 text-center text-[12px] font-semibold uppercase  text-red-500">
                    Remaining Attempts : {attemptCount}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
