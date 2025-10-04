import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { useUsers } from "./hooks/useUsers";
import { useExpenses } from "./hooks/useExpenses";
import { useApprovalRules } from "./hooks/useApprovalRules";
import { useCountries } from "./hooks/useCountries";
import type { User, Page, ApprovalRule } from "./types/index";
import api from "./services/api";

const App: React.FC = () => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("login");

  // Company settings
  const [companyBaseCurrency, setCompanyBaseCurrency] = useState("USD");

  // Data hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
    setUsers,
  } = useUsers();
  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    fetchExpenses,
    setExpenses,
  } = useExpenses(companyBaseCurrency);
  const {
    rules: approvalRules,
    loading: rulesLoading,
    error: rulesError,
    fetchRules,
    updateRules,
  } = useApprovalRules();
  const { countries } = useCountries();

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchExpenses();
      fetchRules();
    }
  }, [currentUser, fetchUsers, fetchExpenses, fetchRules]);

  const adminExists = users.some((u) => u.role === "Admin");

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.auth.login(email, password);
      setCurrentUser(result.user);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.detail || "Invalid email or password.",
      };
    }
  };

  const handleSignup = (
    name: string,
    email: string,
    password: string,
    country: string
  ) => {
    if (adminExists) {
      alert("An admin already exists for this company.");
      return;
    }
    const newAdmin: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: "Admin",
    };
    const selectedCountry = countries.find((c) => c.name === country);
    const baseCurrency = selectedCountry?.currency_code || "USD";
    setUsers([newAdmin, ...users]);
    setCompanyBaseCurrency(baseCurrency);
    setCurrentUser(newAdmin);
    alert(
      `Welcome, ${name}! Your company is set up with ${baseCurrency} as the base currency.`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
  };

  const handleResetPassword = (email: string) => {
    // Mock reset password handler
    alert(`If an account exists for ${email}, a reset link will be sent.`);
  };

  if (!currentUser) {
    switch (page) {
      case "signup":
        return (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={() => setPage("login")}
          />
        );
      case "resetPassword":
        return (
          <ResetPasswordPage
            onResetPassword={handleResetPassword}
            onSwitchToLogin={() => setPage("login")}
          />
        );
      case "login":
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setPage("signup")}
            onNavigateToReset={() => setPage("resetPassword")}
            adminExists={adminExists}
            isAsync={true}
          />
        );
    }
  }

  if (usersLoading || expensesLoading || rulesLoading) {
    return <div>Loading...</div>;
  }

  if (usersError || expensesError || rulesError) {
    return <div>Error loading data. Please refresh the page.</div>;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case "Employee":
        return (
          <EmployeeDashboard
            user={currentUser}
            expenses={expenses}
            users={users}
            onLogout={handleLogout}
            onUpdateExpenses={setExpenses}
            baseCurrency={companyBaseCurrency}
            approvalRules={approvalRules}
          />
        );
      case "Manager":
        return (
          <ManagerDashboard
            user={currentUser}
            expenses={expenses}
            users={users}
            onLogout={handleLogout}
            onUpdateExpenses={setExpenses}
            baseCurrency={companyBaseCurrency}
            approvalRules={approvalRules}
          />
        );
      case "Admin":
        return (
          <AdminDashboard
            user={currentUser}
            users={users}
            expenses={expenses}
            onLogout={handleLogout}
            onUpdateUsers={setUsers}
            onUpdateExpenses={setExpenses}
            approvalRules={approvalRules}
            onUpdateRules={updateRules}
          />
        );
      default:
        return <div>Invalid Role</div>;
    }
  };

  return <div className="antialiased">{renderDashboard()}</div>;
};

export default App;
