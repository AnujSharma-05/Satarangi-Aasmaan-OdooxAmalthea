import React, { useState } from "react";
import {
  AuthInput,
  AuthButton,
  AuthMessage,
  AuthPageWrapper,
} from "./AuthComponents";

interface LoginPageProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  onSwitchToSignup: () => void;
  onNavigateToReset: () => void;
  adminExists: boolean;
  isAsync?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onSwitchToSignup,
  onNavigateToReset,
  adminExists,
}) => {
  const [email, setEmail] = useState("employee@odoo.com");
  const [password, setPassword] = useState("password");
  const [message, setMessage] = useState<{
    type: "error" | "info" | "success";
    text: React.ReactNode;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const clearMessage = () => setMessage(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setMessage({
          type: "error",
          text: result.error || "Invalid email or password.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageWrapper title="Login">
      <form onSubmit={handleSubmit} className="space-y-8">
        <AuthInput
          label="EMAIL"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearMessage();
          }}
          required
          placeholder="user@odoo.com"
        />
        <AuthInput
          label="PASSWORD"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearMessage();
          }}
          required
          placeholder="••••••••"
        />
        {message && <AuthMessage type={message.type} message={message.text} />}
        <AuthButton disabled={loading}>
          {loading ? "Logging in..." : "LOGIN"}
        </AuthButton>
      </form>
      <div className="mt-8 text-center space-y-4">
        <button
          onClick={onNavigateToReset}
          className="font-slab text-lg font-bold text-orange-500 hover:underline tracking-wider"
        >
          Forgot password?
        </button>
        <div>
          {adminExists ? (
            <span
              className="font-slab text-lg font-bold text-gray-400 tracking-wider"
              title="Contact your administrator to create a new user."
            >
              Sign up (1 admin per company)
            </span>
          ) : (
            <button
              onClick={onSwitchToSignup}
              className="font-slab text-lg font-bold text-orange-500 hover:underline tracking-wider"
            >
              Sign up
            </button>
          )}
        </div>
      </div>
    </AuthPageWrapper>
  );
};

export default LoginPage;
