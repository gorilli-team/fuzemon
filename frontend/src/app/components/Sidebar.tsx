"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 text-white flex flex-col bg-dark-800 h-screen sticky top-0 border-r border-dark-600 overflow-y-auto">
      <div className="h-16 text-xl font-bold flex items-center ps-6 lg:ps-6">
        <div className="text-2xl font-bold text-accent-purple">Fuzemon</div>
      </div>

      <nav className="flex-1 p-4 overflow-hidden">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 block ${
                pathname === "/dashboard" ? "bg-dark-700 text-white" : ""
              }`}
            >
              <i className="fa-solid fa-chart-line pr-2"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/deploy-funds"
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 block ${
                pathname === "/deploy-funds" ? "bg-dark-700 text-white" : ""
              }`}
            >
              <i className="fa-solid fa-money-bill pr-2"></i>
              <span>Deploy Funds</span>
            </Link>
          </li>
          <li>
            <Link
              href="/orders"
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 block ${
                pathname === "/orders" ? "bg-dark-700 text-white" : ""
              }`}
            >
              <i className="fa-solid fa-list-ol pr-2"></i>
              <span>Orders</span>
            </Link>
          </li>
          <li>
            <Link
              href="/tokens"
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 block ${
                pathname.startsWith("/tokens") ? "bg-dark-700 text-white" : ""
              }`}
            >
              <i className="fa-solid fa-coins pr-2"></i>
              <span>Tokens</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-dark-600 p-4">
        <div className="flex items-center pl-3 mt-4 text-xs text-dark-200">
          <span className="mr-2">Powered by</span>
          <Image src="/gorilliLogo.svg" alt="Gorilli" width={70} height={70} />
        </div>
      </div>
    </aside>
  );
}
