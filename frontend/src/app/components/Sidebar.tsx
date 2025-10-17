"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  selectedPage: string;
  setSelectedPage: React.Dispatch<React.SetStateAction<string>>;
}

export default function Sidebar({
  selectedPage,
  setSelectedPage,
}: SidebarProps) {
  const router = useRouter();

  const handlePageChange = (page: string) => {
    setSelectedPage(page);
    // Since we only have Dashboard, just stay on the root page
    router.push("/");
  };

  return (
    <aside className="w-64 text-white flex flex-col bg-dark-800 h-screen sticky top-0 border-r border-dark-600 overflow-y-auto">
      <div className="h-16 text-xl font-bold flex items-center ps-6 lg:ps-6">
        <div className="text-2xl font-bold text-accent-purple">Fuzemon</div>
      </div>

      <nav className="flex-1 p-4 overflow-hidden">
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 ${
                selectedPage === "Dashboard" ? "bg-dark-700 text-white" : ""
              }`}
              onClick={() => handlePageChange("Dashboard")}
            >
              <i className="fa-solid fa-chart-line pr-2"></i>
              <span>Dashboard</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-dark-600 p-4">
        <div className="flex items-center pl-3 text-xs text-dark-200">
          <span className="mr-2">Powered by</span>
          <span className="text-accent-purple font-semibold">Fuzemon</span>
        </div>
      </div>
    </aside>
  );
}
