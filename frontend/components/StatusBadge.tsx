import React from "react";
import type { ExpenseStatus } from "../types";

const statusColors: Record<ExpenseStatus, string> = {
  Draft: "bg-gray-200 text-gray-800",
  "Pending Approval": "bg-amber-200 text-amber-800",
  Approved: "bg-green-200 text-green-800",
  Rejected: "bg-red-200 text-red-800",
};

const StatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => (
  <span className={`px-3 py-1 rounded font-bold ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;
