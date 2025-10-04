export type UserRole = "Admin" | "Manager" | "Employee";
export type ExpenseStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected";
export type ApproverStatus = "Pending" | "Approved" | "Rejected";
export type Page = "login" | "signup" | "resetPassword";
export type AdminTab = "users" | "rules" | "expenses";
export type ManagerTab = "approvals" | "team";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
}

export interface ApproverAction {
  userId: string;
  status: ApproverStatus;
  comment?: string;
  timestamp?: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  convertedAmount?: number; // Amount in company's base currency
  expenseDate: string;
  paidBy: string;
  remarks?: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  approvers: ApproverAction[];
  ruleId?: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  managerIsApprover: boolean;
  approvers: { userId: string; isRequired: boolean }[];
  isSequential: boolean;
  minApprovalPercentage: number;
}
