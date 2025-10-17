"use client";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

export default function Home() {
  const [selectedPage, setSelectedPage] = useState("Dashboard");

  const renderContent = () => {
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="flex">
        <Sidebar
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-dark-900">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
