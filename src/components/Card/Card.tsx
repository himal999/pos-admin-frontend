import { Users } from "lucide-react";
import React from "react";

export default function Card() {
  const claims = [
    { name: "Health Insurance", category: "Normal Claim", date: "2025/01/25" },
    { name: "Life Insurance", category: "Death Claim", date: "2025/02/10" },
    { name: "Auto Insurance", category: "Normal Claim", date: "2025/03/05" },
    {
      name: "Property Insurance",
      category: "Normal Claim",
      date: "2025/04/15",
    },
    {
      name: "Accidental Insurance",
      category: "Death Claim",
      date: "2025/05/20",
    },
    { name: "Travel Insurance", category: "Normal Claim", date: "2025/06/30" },
  ];

  return (
    <div className="h-full w-full rounded-lg bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Claim History
        </h5>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
        >
          View all
        </a>
      </div>
      <div className="flow-root">
        <ul
          role="list"
          className="divide-y divide-gray-200 dark:divide-gray-700"
        >
          {claims.map((claim, index) => (
            <li key={index} className="py-3 sm:py-4">
              <div className="flex items-center">
                <div className="shrink-0">
                  <img
                    className="h-10 w-10"
                    src={
                      claim.category === "Normal Claim"
                        ? "https://cdn3d.iconscout.com/3d/premium/thumb/medical-shield-3d-icon-download-in-png-blend-fbx-gltf-file-formats--protection-health-pack-technology-icons-8539006.png"
                        : "https://cdn-icons-png.flaticon.com/512/921/921128.png"
                    }
                    alt="Claim Icon"
                  />
                </div>
                <div className="ms-4 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {claim.name}
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {claim.category}
                  </p>
                </div>
                <div className="inline-flex items-center text-xs font-semibold text-gray-900 dark:text-white">
                  {claim.date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
