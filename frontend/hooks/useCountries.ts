import { useState, useEffect } from 'react';
import api from '../services/api';
import type { CountryInfo } from '../services/api';

export const useCountries = () => {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await api.getCountriesWithCurrencies();
        setCountries(data);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setError('Failed to load countries. Please try again later.');
        // Fall back to mock data in case of API failure
        setCountries([
          { name: "United States", currency_code: "USD" },
          { name: "India", currency_code: "INR" },
          { name: "Germany", currency_code: "EUR" },
          { name: "United Kingdom", currency_code: "GBP" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

// Hook for currency conversion
export const useCurrencyConverter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertCurrency = async (amount: number, from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.convertCurrency(amount, from, to);
      return result;
    } catch (err) {
      console.error('Failed to convert currency:', err);
      setError('Failed to convert currency. Please try again later.');
      // Fall back to mock conversion in case of API failure
      const mockRate = {
        USD: 1,
        INR: 83.50,
        EUR: 0.92,
        GBP: 0.79,
      }[to] || 1;
      return {
        original_amount: amount,
        base_currency: from,
        target_currency: to,
        conversion_rate: mockRate,
        converted_amount: amount * mockRate
      };
    } finally {
      setLoading(false);
    }
  };

  return { convertCurrency, loading, error };
};