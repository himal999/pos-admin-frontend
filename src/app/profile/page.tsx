"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Footer from "@/components/Footer/Footer";
import { useState, useEffect } from "react";
import { getSessionData } from "@/utils/session";
import { IUserProfile } from "@/types";
import { IdCard, Mail, Phone, User } from "lucide-react";
import withAuth from "@/utils/withAuth";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

function Profile() {
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />
        <div className="overflow-hidden rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            {/* Transparent overlay */}
            <div className="absolute inset-0 z-10 rounded-tl-sm rounded-tr-sm bg-black bg-opacity-15"></div>

            {/* Image */}
            <img
              src={"/admin/images/bg.svg"}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
            />
          </div>

          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-18 md:-mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                <div className="h-160 w-160 flex items-center justify-center overflow-hidden rounded-full">
                  {/* {userProfile?.profileImg != null ? (
                    <img
                      src={`data:${userProfile?.profileImg?.fileExtensiones};base64,${userProfile?.profileImg?.file}`}
                      className="aspect-square h-auto w-auto rounded-full object-cover"
                      alt="User"
                    />
                  ) : ( */}
                  <img
                    src={"/admin/images/user.gif"}
                    alt="profile cover"
                    className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                  />
                  {/* )} */}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {userProfile.firstName} {userProfile.lastName}
              </h3>
              <p className="mb-4 font-medium">
                {userProfile.userRole.description}
              </p>

              {userProfile.status === "ACTIVE" ? (
                <span className="rounded-full border border-green-200 bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800 dark:border-none dark:bg-green-900 dark:text-green-300">
                  {userProfile.status}
                </span>
              ) : (
                <span className="me-2 rounded-full border border-red-200 bg-red-100 px-4 py-1.5 text-sm font-medium text-red-800 dark:border-none dark:bg-red-900 dark:text-red-300">
                  {userProfile.status}
                </span>
              )}

              <div className="mx-auto mb-5.5 mt-4.5 grid max-w-94 grid-cols-2 rounded-xl border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
                <div className="items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark">
                  <span className="block text-sm font-semibold text-black dark:text-white">
                    {userProfile.lastLoggedDate}
                  </span>
                  <span className="text-xs">Last Logged Date</span>
                </div>
                <div className="items-center justify-center gap-1 border-stroke px-4 dark:border-strokedark xsm:flex-row">
                  <span className="block text-sm font-semibold text-black dark:text-white">
                    {userProfile.passwordExpiredDate}
                  </span>
                  <span className="text-xs">Password Expired Date</span>
                </div>
              </div>

              <div className="mt-4 flex w-full justify-center">
                <div className="w-full max-w-3xl">
                  <div className="mx-auto">
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-strokedark dark:bg-[#37404F]">
                        <div className="absolute -bottom-2 -left-3 rotate-[-10deg]">
                          <User className="h-16 w-16 text-primary" />
                        </div>
                        <p className="mb-1 break-words text-xs font-normal text-gray-500 dark:text-gray-300">
                          User Name
                        </p>
                        <p className="px-12 text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                          {userProfile.username}
                        </p>
                      </div>

                      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-strokedark dark:bg-[#37404F]">
                        <div className="absolute -bottom-1 -left-3 rotate-[-10deg]">
                          <Phone className="h-16 w-16 text-primary" />
                        </div>
                        <p className="mb-1 break-words text-xs font-normal text-gray-500 dark:text-gray-300">
                          Mobile No
                        </p>
                        <p className="px-12 text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                          {userProfile.mobile}
                        </p>
                      </div>

                      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-strokedark dark:bg-[#37404F]">
                        <div className="absolute -bottom-2 -left-3 rotate-[-10deg]">
                          <IdCard className="h-16 w-16 text-primary" />
                        </div>
                        <p className="mb-1 break-words text-xs font-normal text-gray-500 dark:text-gray-300">
                          NIC
                        </p>
                        <p className="px-12 text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                          {userProfile.nic}
                        </p>
                      </div>

                      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-strokedark dark:bg-[#37404F]">
                        <div className="absolute -bottom-2 -left-3 rotate-[-10deg]">
                          <Mail className="h-16 w-16 text-primary" />
                        </div>
                        <p className="mb-1 break-words text-xs font-normal text-gray-500 dark:text-gray-300">
                          E-Mail
                        </p>
                        <p className="px-12 text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mt-4 inline-flex items-center text-xs font-normal text-gray-500  dark:text-gray-400">
                        If you need to update your email or mobile number,
                        please contact the admin.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default withAuth(Profile);
