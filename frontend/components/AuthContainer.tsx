import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ResetPasswordPage from "./ResetPasswordPage";
import { useAuth } from "../contexts/AuthContext";

type AuthPage = "login" | "signup" | "reset";

const AuthContainer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AuthPage>("login");
  const [adminExists, setAdminExists] = useState(false);
  const { login, signup, resetPassword } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const success = await login(email, password);
      return success;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    country: string
  ) => {
    try {
      const success = await signup(name, email, password, country);
      if (success) {
        setAdminExists(true);
        setCurrentPage("login");
      }
      return success;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  switch (currentPage) {
    case "signup":
      return (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setCurrentPage("login")}
        />
      );
    case "reset":
      return (
        <ResetPasswordPage
          onResetPassword={handleResetPassword}
          onSwitchToLogin={() => setCurrentPage("login")}
        />
      );
    default:
      return (
        <LoginPage
          onLogin={(email, password) => {
            let result = false;
            handleLogin(email, password).then((success) => {
              result = success;
            });
            return result;
          }}
          onSwitchToSignup={() => setCurrentPage("signup")}
          onNavigateToReset={() => setCurrentPage("reset")}
          adminExists={adminExists}
        />
      );
  }
};

export default AuthContainer;
