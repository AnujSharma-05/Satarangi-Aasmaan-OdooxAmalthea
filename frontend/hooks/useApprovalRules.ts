import { useState, useCallback } from "react";
import api from "../services/api";
import type { ApprovalRule } from "../types";

export const useApprovalRules = () => {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedRules: ApprovalRule[];
      try {
        fetchedRules = await api.rules.getAll();
      } catch (e) {
        console.warn("Failed to fetch rules from API, using mock data:", e);
        // TODO: Remove mock data once API is ready
        fetchedRules = [
          {
            id: "rule-1",
            name: "Approval rule for miscellaneous expenses",
            description:
              "This rule applies to all miscellaneous expenses submitted by employees.",
            managerIsApprover: true,
            approvers: [
              { userId: "user-6", isRequired: true }, // Finance
              { userId: "user-7", isRequired: false }, // Director
              { userId: "user-8", isRequired: false }, // CFO
            ],
            isSequential: true,
            minApprovalPercentage: 60,
          },
        ];
      }
      setRules(fetchedRules);
    } catch (e) {
      console.error("Error fetching rules:", e);
      setError("Failed to load approval rules. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRules = useCallback(async (ruleData: ApprovalRule[]) => {
    setError(null);
    try {
      let updatedRules: ApprovalRule[];
      try {
        updatedRules = await api.rules.update(ruleData);
      } catch (e) {
        console.warn("Failed to update rules via API, using mock update:", e);
        // TODO: Remove mock update once API is ready
        updatedRules = ruleData;
      }
      setRules(updatedRules);
      return updatedRules;
    } catch (e) {
      console.error("Error updating rules:", e);
      setError("Failed to update approval rules. Please try again.");
      throw e;
    }
  }, []);

  return {
    rules,
    loading,
    error,
    fetchRules,
    updateRules,
    setRules, // For mock data updates
  };
};
