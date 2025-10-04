import React, { forwardRef } from "react";
import { AlertCircle, Info } from "lucide-react";

// Logo Component
export const OdooLogo: React.FC = () => (
  <span className="font-slab text-5xl font-black text-black tracking-tighter">
    odoo
  </span>
);

// Input Component
export const AuthInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, ...props }, ref) => (
  <div>
    <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
      {label}
    </label>
    <input
      ref={ref}
      {...props}
      className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
    />
  </div>
));

// Button Component
export const AuthButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, type = "submit", className = "", disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 px-4 bg-orange-500 text-white font-bold text-lg uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:-translate-y-1 hover:translate-x-1 transition-all duration-200 active:bg-orange-600 disabled:bg-gray-400 disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// Message Component
export const AuthMessage: React.FC<{
  type: "error" | "info" | "success";
  message: React.ReactNode;
}> = ({ type, message }) => {
  const isError = type === "error";
  const bgColor = isError
    ? "bg-red-200"
    : type === "success"
    ? "bg-green-200"
    : "bg-gray-200";
  const borderColor = isError
    ? "border-red-800"
    : type === "success"
    ? "border-green-800"
    : "border-gray-800";
  const textColor = isError
    ? "text-red-800"
    : type === "success"
    ? "text-green-800"
    : "text-gray-800";
  const Icon = isError ? AlertCircle : Info;

  return (
    <div
      className={`p-4 border-2 flex items-start gap-3 ${bgColor} ${borderColor}`}
    >
      <Icon size={20} className={`mt-0.5 ${textColor} flex-shrink-0`} />
      <div className={`text-sm font-bold ${textColor}`}>{message}</div>
    </div>
  );
};

// Page Wrapper Component
export const AuthPageWrapper: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => (
  <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
    <div className="w-full max-w-md mx-auto p-8 bg-white border-4 border-black shadow-[8px_8px_0px_#111827]">
      <div className="text-center mb-8">
        <OdooLogo />
        {title && (
          <h2 className="font-slab text-2xl font-bold mt-4 uppercase">
            {title}
          </h2>
        )}
      </div>
      {children}
    </div>
  </div>
);
