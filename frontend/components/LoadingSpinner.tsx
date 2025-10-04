import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = "h-12 w-12",
}) => (
  <div className="flex justify-center items-center">
    <div
      className={`animate-spin rounded-full border-4 border-orange-500 border-t-transparent ${className}`}
    />
  </div>
);

export default LoadingSpinner;
