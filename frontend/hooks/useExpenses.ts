import { useState, useCallback } from "react";
import api from "../services/api";
import type { Expense } from "../types";
import { useExpenseCurrency } from "./useExpenseCurrency";

export const useExpenses = (baseCurrency: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { convertExpenses } = useExpenseCurrency(baseCurrency);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedExpenses: Expense[];
      try {
        const response = await api.expenses.getAll();
        fetchedExpenses = response;
      } catch (e) {
        console.warn("Failed to fetch expenses from API, using mock data:", e);
        // TODO: Remove mock data once API is ready
        fetchedExpenses = [
          // ... your mock expenses here
        ];
      }

      // Convert all amounts to base currency
      const expensesWithConversion = await convertExpenses(fetchedExpenses);
      setExpenses(expensesWithConversion);
    } catch (e) {
      console.error("Error fetching expenses:", e);
      setError("Failed to load expenses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [convertExpenses]);

  const createExpense = useCallback(
    async (
      expenseData: Omit<Expense, "id" | "approvers" | "status" | "ruleId">
    ) => {
      setError(null);
      try {
        let newExpense: Expense;
        try {
          newExpense = await api.expenses.create(expenseData);
        } catch (e) {
          console.warn("Failed to create expense via API, using mock data:", e);
          // TODO: Remove mock creation once API is ready
          newExpense = {
            ...expenseData,
            id: `exp-${Date.now()}`,
            status: "Draft",
            approvers: [],
          };
        }

        // Convert amount to base currency if needed
        const expenseWithConversion = await convertExpenses([newExpense]);
        setExpenses((prev) => [...prev, expenseWithConversion[0]]);
        return newExpense;
      } catch (e) {
        console.error("Error creating expense:", e);
        setError("Failed to create expense. Please try again.");
        throw e;
      }
    },
    [convertExpenses]
  );

  const updateExpense = useCallback(
    async (expenseId: string, updateData: Partial<Expense>) => {
      setError(null);
      try {
        let updatedExpense: Expense;
        try {
          updatedExpense = await api.expenses.update(expenseId, updateData);
        } catch (e) {
          console.warn(
            "Failed to update expense via API, using mock update:",
            e
          );
          // TODO: Remove mock update once API is ready
          updatedExpense = {
            ...expenses.find((exp) => exp.id === expenseId)!,
            ...updateData,
          } as Expense;
        }

        // Convert amount to base currency if needed
        const expenseWithConversion = await convertExpenses([updatedExpense]);
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === expenseId ? expenseWithConversion[0] : exp
          )
        );
        return updatedExpense;
      } catch (e) {
        console.error("Error updating expense:", e);
        setError("Failed to update expense. Please try again.");
        throw e;
      }
    },
    [expenses, convertExpenses]
  );

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    setExpenses, // For mock data updates
  };
};
