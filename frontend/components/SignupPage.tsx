import React, { useState, useEffect } from "react";
import { useCountries } from "../hooks/useCountries";
import {
  AuthInput,
  AuthButton,
  AuthMessage,
  AuthPageWrapper,
} from "./AuthComponents";

const SignupPage: React.FC<{
  onSignup: (
    name: string,
    email: string,
    pass: string,
    country: string
  ) => void;
  onSwitchToLogin: () => void;
}> = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { countries, loading, error: countryError } = useCountries();

  // Set default country when countries are loaded
  useEffect(() => {
    if (countries.length > 0 && !country) {
      setCountry(countries[0].name);
    }
  }, [countries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    onSignup(name, email, password, country);
  };

  if (loading) {
    return (
      <AuthPageWrapper title="Loading...">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper title="Admin (Company) Signup Page">
      <form onSubmit={handleSubmit} className="space-y-8">
        <AuthInput
          label="FULL NAME"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
        <AuthInput
          label="EMAIL ADDRESS"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@company.com"
        />
        <AuthInput
          label="PASSWORD"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <AuthInput
          label="CONFIRM PASSWORD"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
        <div>
          <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">
            COUNTRY
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          >
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.currency_code})
              </option>
            ))}
          </select>
        </div>
        {(error || countryError) && (
          <AuthMessage type="error" message={error || countryError} />
        )}
        <AuthButton>CREATE ACCOUNT</AuthButton>
      </form>
      <div className="mt-8 text-center">
        <button
          onClick={onSwitchToLogin}
          className="font-slab text-lg font-bold text-orange-500 hover:underline tracking-wider"
        >
          Already have an account? Login
        </button>
      </div>
    </AuthPageWrapper>
  );
};

export default SignupPage;
