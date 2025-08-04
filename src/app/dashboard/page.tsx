"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import withAuth from "@/utils/withAuth";
import {
  ShoppingCart,
  PackageCheck,
  Users,
  DollarSign,
  Warehouse,
  FileText,
  Activity,
  CalendarClock,
  Eye,
  Trash2,
  MapPin,
} from "lucide-react";
import React, { useEffect, useRef } from "react";

function Home() {
  // Start chart
  const chartRef = useRef(null);
  const chartInstance = useRef<any>(null); // Store chart instance globally

  useEffect(() => {
    const loadChart = async () => {
      if (typeof window !== "undefined" && chartRef.current) {
        const ApexCharts = (await import("apexcharts")).default;

        // Clean up old chart before rendering a new one
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const options = {
          chart: {
            type: "bar",
            height: 320,
            fontFamily: "Inter, sans-serif",
            toolbar: { show: false },
          },
          series: [
            {
              name: "Organic",
              data: [
                { x: "Mon", y: 231 },
                { x: "Tue", y: 122 },
                { x: "Wed", y: 63 },
                { x: "Thu", y: 421 },
                { x: "Fri", y: 122 },
                { x: "Sat", y: 323 },
                { x: "Sun", y: 111 },
              ],
            },
            {
              name: "Social Media",
              data: [
                { x: "Mon", y: 232 },
                { x: "Tue", y: 113 },
                { x: "Wed", y: 341 },
                { x: "Thu", y: 224 },
                { x: "Fri", y: 522 },
                { x: "Sat", y: 411 },
                { x: "Sun", y: 243 },
              ],
            },
          ],
          colors: ["#1A56DB", "#FDBA8C"],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "70%",
              borderRadius: 8,
              borderRadiusApplication: "end",
            },
          },
          tooltip: { shared: true, intersect: false },
          dataLabels: { enabled: false },
          legend: { show: false },
          xaxis: {
            labels: {
              style: {
                fontFamily: "Inter, sans-serif",
                cssClass:
                  "text-xs font-normal fill-gray-500 dark:fill-gray-400",
              },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
          yaxis: { show: false },
          fill: { opacity: 1 },
          grid: {
            show: false,
            strokeDashArray: 4,
            padding: { left: 2, right: 2, top: -14 },
          },
          stroke: {
            show: true,
            width: 0,
            colors: ["transparent"],
          },
          states: {
            hover: {
              filter: {
                type: "darken",
                value: 1,
              },
            },
          },
        };

        chartInstance.current = new ApexCharts(chartRef.current, options);
        chartInstance.current.render();
      }
    };

    loadChart();

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  // End chart

  // Start cards
  const cards = [
    {
      title: "Total Sales",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      value: "$12,345",
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      value: "320",
    },
    {
      title: "Products",
      icon: <PackageCheck className="h-6 w-6 text-primary" />,
      value: "150",
    },
    {
      title: "Customers",
      icon: <Users className="h-6 w-6 text-primary" />,
      value: "450",
    },
    {
      title: "Inventory Value",
      icon: <Warehouse className="h-6 w-6 text-primary" />,
      value: "$23,500",
    },
    {
      title: "Invoices Generated",
      icon: <FileText className="h-6 w-6 text-primary" />,
      value: "87",
    },
    {
      title: "System Activity",
      icon: <Activity className="h-6 w-6 text-primary" />,
      value: "Normal",
    },
    {
      title: "Last Sync",
      icon: <CalendarClock className="h-6 w-6 text-primary" />,
      value: "5 min ago",
    },
  ];

  const data = [
    {
      id: "TRX001",
      date: "2025-07-18",
      from: "Warehouse A",
      to: "Shop B",
      items: 12,
      total: "Rs. 35,000",
    },
    {
      id: "TRX002",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX003",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX004",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
    {
      id: "TRX005",
      date: "2025-07-17",
      from: "Main Store",
      to: "Outlet 3",
      items: 8,
      total: "Rs. 21,400",
    },
  ];
  // End cards

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-6  md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Left: Latest Customers */}
        <div className="flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8 md:w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Latest Customers
            </h5>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              View all
            </a>
          </div>
          <div className="flow-root flex-grow">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              <li className="py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Neil Sims
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $320
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Bonnie Green
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $3467
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Michael Gough
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $67
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Lana Byrd
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $367
                  </div>
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Jhone Break
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $367
                  </div>
                </div>
              </li>
              <li className="pb-0 pt-3 sm:pt-4">
                <div className="flex items-center ">
                  <div className="shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src="/admin/images/user.jpg"
                      alt="Customer"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Thomes Lean
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $2367
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Right Side */}
        <div className="w-full max-w-full rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:w-1/2 md:p-6">
          <div className="mb-4 flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex items-center">
              <div className="me-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <svg
                  className="h-6 w-6 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 19"
                >
                  <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
                  <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z" />
                </svg>
              </div>
              <div>
                <h5 className="pb-1 text-2xl font-bold leading-none text-gray-900 dark:text-white">
                  3.4k
                </h5>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Sales per week
                </p>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                <svg
                  className="me-1.5 h-2.5 w-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13V1m0 0L1 5m4-4 4 4"
                  />
                </svg>
                42.5%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <dl className="flex items-center">
              <dt className="me-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                Money spent:
              </dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                $3,232
              </dd>
            </dl>
            <dl className="flex items-center justify-end">
              <dt className="me-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                Conversion rate:
              </dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                1.2%
              </dd>
            </dl>
          </div>

          <div id="chart" ref={chartRef}></div>
          <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pt-5">
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="lastDaysdropdown"
                data-dropdown-placement="bottom"
                className="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button"
              >
                Last 7 days
                <svg
                  className="m-2.5 ms-1.5 w-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                id="lastDaysdropdown"
                className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Yesterday
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Today
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 7 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 30 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 90 days
                    </a>
                  </li>
                </ul>
              </div>
              <a
                href="#"
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold uppercase text-blue-600  hover:bg-gray-100 hover:text-blue-700 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-500 dark:focus:ring-gray-700"
              >
                Sales Report
                <svg
                  className="ms-1.5 h-2.5 w-2.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default withAuth(Home);
