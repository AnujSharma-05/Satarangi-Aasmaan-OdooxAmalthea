import { useCallback } from "react";
import { useCurrencyConverter } from "./useCountries";
import type { Expense } from "../types";

// Currency conversion hook for expense components
export const useExpenseCurrency = (companyBaseCurrency: string) => {
  const {
    convertCurrency,
    loading: conversionLoading,
    error: conversionError,
  } = useCurrencyConverter();

  const convertExpenseAmount = useCallback(
    async (expense: Expense): Promise<Expense> => {
      if (expense.currency === companyBaseCurrency) {
        return { ...expense, convertedAmount: expense.amount };
      }

      try {
        const result = await convertCurrency(
          expense.amount,
          expense.currency,
          companyBaseCurrency
        );
        return {
          ...expense,
          convertedAmount: result.converted_amount,
        };
      } catch (error) {
        console.error("Failed to convert expense amount:", error);
        return expense;
      }
    },
    [companyBaseCurrency, convertCurrency]
  );

  const convertExpenses = useCallback(
    async (expenses: Expense[]): Promise<Expense[]> => {
      const promises = expenses.map(convertExpenseAmount);
      const convertedExpenses = await Promise.all(promises);
      return convertedExpenses as Expense[];
    },
    [convertExpenseAmount]
  );

  return {
    convertExpenseAmount,
    convertExpenses,
    loading: conversionLoading,
    error: conversionError,
  };
};
