import React from "react";
import type { User, Expense, ApprovalRule } from "../types";

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  activeTab,
  onTabChange,
  children,
}) => (
  <div className="min-h-screen bg-gray-100">
    <header className="flex justify-between items-center p-4 border-b-4 border-black bg-white">
      <div className="font-slab text-2xl font-black uppercase">Dashboard</div>
      <div className="flex items-center gap-4">
        <span className="font-bold">
          {user.name} ({user.role})
        </span>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-orange-500 text-white font-bold border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
    {activeTab && onTabChange && (
      <nav className="flex gap-4 p-4 border-b-2 border-black bg-gray-50">
        {["users", "rules", "expenses", "approvals", "team"].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-2 font-bold border-2 border-black ${
              activeTab === tab
                ? "bg-orange-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    )}
    <main className="p-8">{children}</main>
  </div>
);

export default DashboardLayout;
