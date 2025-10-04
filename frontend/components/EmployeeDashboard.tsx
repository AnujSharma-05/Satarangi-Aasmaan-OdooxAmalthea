import React from "react";
import DashboardLayout from "./DashboardLayout";
import SummaryCard from "./SummaryCard";
import ExpenseFormModal from "./ExpenseFormModal";
import type {
  User,
  Expense,
  ApprovalRule,
  ExpenseStatus,
  ApproverAction,
} from "../types";

const EmployeeDashboard: React.FC<{
  user: User;
  expenses: Expense[];
  users: User[];
  onLogout: () => void;
  onUpdateExpenses: (expenses: Expense[]) => void;
  baseCurrency: string;
  approvalRules: ApprovalRule[];
}> = ({
  user,
  expenses,
  users,
  onLogout,
  onUpdateExpenses,
  baseCurrency,
  approvalRules,
}) => {
  // ...existing code from App.tsx for EmployeeDashboard...
  return <div>Employee Dashboard (stub)</div>;
};

export default EmployeeDashboard;
