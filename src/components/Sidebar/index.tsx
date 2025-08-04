"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  LayoutDashboard,
  Users,
  FileCog,
  LockKeyhole,
  Settings,
  AppWindow,
  FileStack,
  User,
  PackageSearch,
  MapPinHouse,
  Warehouse,
  UserCircle,
  MapPin,
  ShoppingCart,
  CalendarSync,
} from "lucide-react";
import { getSessionData } from "@/utils/session";
import { IoCogSharp } from "react-icons/io5";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const [menuGroups, setMenuGroups] = useState<any[]>([]);

  useEffect(() => {
    const sessionPages = getSessionData("pages");

    if (sessionPages) {
      const iconMap: Record<string, JSX.Element> = {
        PRIM: <LockKeyhole className="h-5 w-5" />,
        SYSC: <Settings className="h-5 w-5" />,
        APPM: <AppWindow className="h-5 w-5" />,
        USRM: <Users className="h-5 w-5" />,
        FILM: <FileStack className="h-5 w-5" />,
        BRMP: <PackageSearch className="h-5 w-5" />,
        SPMP: <Users className="h-5 w-5" />,
        ITMM: <PackageSearch className="h-5 w-5" />,
        SUPM: <UserCircle className="h-5 w-5" />,
        LOCM: <MapPin className="h-5 w-5" />,
        GRNM: <ShoppingCart className="h-5 w-5" />,
        TRAM: <CalendarSync className="h-5 w-5" />,
      };

      const dynamicMenuItems = Object.entries(sessionPages).map(
        ([moduleKey, moduleValue]: any) => ({
          icon: iconMap[moduleKey] || <FileCog className="h-5 w-5" />,
          label: moduleValue.description,
          route: "#",
          children: moduleValue.pages.map((page: any) => ({
            label: page.description,
            route: `/${page.url}`,
          })),
        }),
      );

      setMenuGroups([
        {
          name: "MENU",
          menuItems: [
            {
              icon: <LayoutDashboard className="h-5 w-5" />,
              label: "Dashboard",
              route: "/dashboard",
            },
            ...dynamicMenuItems,
          ],
        },
        {
          name: "OTHERS",
          menuItems: [
            {
              icon: <User className="h-5 w-5" />,
              label: "Profile",
              route: "/profile",
            },
            {
              icon: <IoCogSharp className="h-5 w-5" />,
              label: "Settings",
              route: "/settings",
            },
          ],
        },
      ]);
    }
  }, []);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`border-strok fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r bg-gray-50 duration-300 ease-linear dark:border-boxdark-2 dark:bg-black  lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        {/* <div className="m-2 mt-0 flex items-center justify-between gap-2 rounded-b-xl bg-white px-2 py-1 dark:border-gray-600  md:justify-center md:px-6 lg:px-6 lg:py-1">
          <Link href="/dashboard">
            <div className="m-1 flex items-center">
              <img
                className="h-auto w-80"
                src={"/jit/images/logo/logo-3.png"}
                alt="Icon"
              />
            </div>
          </Link> */}
        <div className="m-2 mt-0 flex items-center justify-between gap-2 bg-gray-50 px-2 py-1 dark:bg-transparent md:justify-center md:px-6 lg:px-6 lg:py-1">
          <Link href="/dashboard">
            <div className="m-1 mt-4 flex gap-1 items-center">
              <img
                className="h-auto w-8"
                src={"/admin/images/logo/icon.png"}
                alt="Icon"
              />
              <span className="text-2xl font-extrabold text-secondary dark:text-white">
                AVENTA<span className="text-primary">POS</span>
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-0 px-1.5 py-4 md:mt-0 md:px-1.5">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem: any, menuIndex: number) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* <div className="mx-2 mt-auto flex items-center justify-center rounded-t-xl bg-white py-2">
          <div className="flex items-center">
            <span className="text-sm font-bold text-black">Powered By </span>
            <img
              className="ml-1.5 w-20"
              src={"/jit/images/logo/footer-logo.png"}
              alt="Company Logo"
            />
          </div>
        </div> */}
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
