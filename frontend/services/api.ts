import axios from "axios";
import type { User } from "../types";

const BASE_URL = "http://localhost:8000";

export interface CountryInfo {
  name: string;
  currency_code: string;
}

export interface CurrencyConversionResult {
  original_amount: number;
  base_currency: string;
  target_currency: string;
  conversion_rate: number;
  converted_amount: number;
}

const api = {
  // Countries and Currency Endpoints
  getCountriesWithCurrencies: async (): Promise<CountryInfo[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/utils/countries`);
      return response.data;
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },

  convertCurrency: async (
    amount: number,
    baseCurrency: string,
    targetCurrency: string
  ): Promise<CurrencyConversionResult> => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/utils/convert-currency`,
        {
          params: {
            amount,
            base_currency: baseCurrency,
            target_currency: targetCurrency,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error converting currency:", error);
      throw error;
    }
  },

  auth: {
    login: async (
      email: string,
      password: string
    ): Promise<{ user: User; access_token: string }> => {
      try {
        // Backend expects username and password fields in TokenRequest
        const response = await axios.post(`${BASE_URL}/api/v1/login/token`, {
          username: email,
          password,
        });
        return response.data;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    signup: async (
      name: string,
      email: string,
      password: string,
      country: string
    ): Promise<{ user: User; access_token: string }> => {
      try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/signup`, {
          name,
          email,
          password,
          country,
        });
        return response.data;
      } catch (error) {
        console.error("Signup failed:", error);
        throw error;
      }
    },

    resetPassword: async (email: string): Promise<{ message: string }> => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/reset-password`,
          {
            email,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Reset password failed:", error);
        throw error;
      }
    },
  },

  users: {
    getAll: async () => {
      // TODO: Implement get users endpoint
      throw new Error("Not implemented");
    },

    create: async (userData: any) => {
      // TODO: Implement create user endpoint
      throw new Error("Not implemented");
    },

    update: async (userId: string, data: any) => {
      // TODO: Implement update user endpoint
      throw new Error("Not implemented");
    },
  },

  expenses: {
    getAll: async () => {
      // TODO: Implement get expenses endpoint
      throw new Error("Not implemented");
    },

    create: async (expenseData: any) => {
      // TODO: Implement create expense endpoint
      throw new Error("Not implemented");
    },

    update: async (expenseId: string, data: any) => {
      // TODO: Implement update expense endpoint
      throw new Error("Not implemented");
    },
  },

  rules: {
    getAll: async () => {
      // TODO: Implement get rules endpoint
      throw new Error("Not implemented");
    },

    update: async (ruleData: any) => {
      // TODO: Implement update rules endpoint
      throw new Error("Not implemented");
    },
  },
};

export default api;
