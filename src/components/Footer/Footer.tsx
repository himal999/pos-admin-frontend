import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-2 rounded-lg bg-white shadow-sm dark:bg-gray-800">
      <div className="flex w-full  flex-col items-center p-4 text-center md:flex-row md:justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          © {currentYear} AVENTA POS. All Rights Reserved.
        </span>
        <ul className="mt-3 flex flex-col items-center text-sm font-medium text-gray-500 dark:text-gray-400 md:mt-0 md:flex-row">
          <li>Version 1.0.0</li>
        </ul>
      </div>
    </footer>
  );
}
