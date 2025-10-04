import React, { useState, useEffect } from "react";
import { Save, Plus } from "lucide-react";
import { AuthMessage } from "./AuthComponents";
import type { Expense } from "../types";
import { useCurrencyConverter } from "../hooks/useCountries";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    expense: Omit<Expense, "id" | "approvers" | "status" | "ruleId">,
    isDraft: boolean
  ) => void;
  employeeId: string;
  expenseToEdit?: Expense | null;
  isOcrSimulated?: boolean;
  baseCurrency: string;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeId,
  expenseToEdit,
  isOcrSimulated,
  baseCurrency,
}) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(baseCurrency);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paidBy, setPaidBy] = useState("Personal");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const {
    convertCurrency,
    loading: conversionLoading,
    error: conversionError,
  } = useCurrencyConverter();

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setDescription(expenseToEdit.description);
        setCategory(expenseToEdit.category);
        setAmount(String(expenseToEdit.amount));
        setCurrency(expenseToEdit.currency);
        setExpenseDate(expenseToEdit.expenseDate);
        setPaidBy(expenseToEdit.paidBy);
        setRemarks(expenseToEdit.remarks || "");
      } else {
        setDescription("");
        setCategory("Food");
        setAmount("");
        setCurrency(baseCurrency);
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setPaidBy("Personal");
        setRemarks("");
      }
    }
  }, [expenseToEdit, isOpen, baseCurrency]);

  useEffect(() => {
    const updateConversion = async () => {
      if (!amount || currency === baseCurrency) {
        setConvertedAmount(null);
        return;
      }

      try {
        const result = await convertCurrency(
          parseFloat(amount),
          currency,
          baseCurrency
        );
        setConvertedAmount(result.converted_amount);
      } catch (err) {
        console.error("Failed to convert amount:", err);
        setConvertedAmount(null);
      }
    };

    updateConversion();
  }, [amount, currency, baseCurrency, convertCurrency]);

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    const expenseData = {
      employeeId,
      description,
      category,
      amount: parseFloat(amount) || 0,
      currency,
      expenseDate,
      paidBy,
      remarks,
      receiptUrl: expenseToEdit?.receiptUrl,
      convertedAmount: convertedAmount || undefined,
    };
    onSave(expenseData, isDraft);
    onClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4">
      <div
        className="bg-gray-50 border-4 border-black w-full max-w-2xl max-h-[90vh] flex flex-col relative transform transition-all duration-300 shadow-[8px_8px_0px_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b-4 border-black bg-white">
          <h3 className="font-slab text-2xl font-bold uppercase">
            {expenseToEdit ? "Edit Expense" : "New Expense"}
          </h3>
          <button
            onClick={onClose}
            className="text-black hover:text-orange-500"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {isOcrSimulated && (
            <AuthMessage
              type="success"
              message="Receipt scanned! We've filled in the details for you."
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
                Expense Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Supplies</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
              >
                <option>Personal</option>
                <option>Company Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
              Total Amount
            </label>
            <div className="flex">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-4 py-3 bg-black text-white border-2 border-black text-lg"
              >
                {/* TODO: Get this list from the API */}
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
              </select>
            </div>
            {convertedAmount !== null && currency !== baseCurrency && (
              <p className="mt-2 text-sm font-bold text-gray-600">
                ≈{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: baseCurrency,
                }).format(convertedAmount)}{" "}
                {baseCurrency}
              </p>
            )}
            {conversionError && (
              <AuthMessage
                type="error"
                message="Failed to convert currency. Please try again."
              />
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-200 text-black font-bold border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !amount || !description}
              className="px-5 py-2.5 bg-orange-500 text-white font-bold border-2 border-black hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || conversionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : null}
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
