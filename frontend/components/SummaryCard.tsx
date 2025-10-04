import React from "react";

interface SummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  currency,
  color,
}) => (
  <div
    className={`p-4 bg-white border-2 border-black flex-1 shadow-[4px_4px_0px_#000]`}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold uppercase tracking-wider">{title}</p>
      <span className={color}>●</span>
    </div>
    <p className="font-slab text-3xl font-black mt-2">
      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        amount
      )}
    </p>
  </div>
);

export default SummaryCard;
