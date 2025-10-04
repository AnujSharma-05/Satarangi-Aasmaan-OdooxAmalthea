import React, { useState } from "react";
import {
  AuthInput,
  AuthButton,
  AuthMessage,
  AuthPageWrapper,
} from "./AuthComponents";

interface ResetPasswordPageProps {
  onResetPassword: (email: string) => void;
  onSwitchToLogin: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onResetPassword,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "error" | "info" | "success";
    text: React.ReactNode;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }
    onResetPassword(email);
    setMessage({
      type: "success",
      text: "If an account exists with this email, you will receive reset instructions.",
    });
  };

  return (
    <AuthPageWrapper title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-8">
        <AuthInput
          label="EMAIL"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(null);
          }}
          required
          placeholder="user@odoo.com"
        />
        {message && <AuthMessage type={message.type} message={message.text} />}
        <AuthButton>SEND RESET LINK</AuthButton>
      </form>
      <div className="mt-8 text-center">
        <button
          onClick={onSwitchToLogin}
          className="font-slab text-lg font-bold text-orange-500 hover:underline tracking-wider"
        >
          Back to Login
        </button>
      </div>
    </AuthPageWrapper>
  );
};

export default ResetPasswordPage;
