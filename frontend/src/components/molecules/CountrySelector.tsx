import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/molecules/FormField'

interface Country {
  name: { common: string }
  currencies: Record<string, { name: string; symbol: string }>
  cca2: string
}

interface CountrySelectorProps {
  value?: string
  onValueChange: (value: string) => void
  onCurrencyChange: (currency: string) => void
  error?: string
}

export function CountrySelector({
  value,
  onValueChange,
  onCurrencyChange,
  error
}: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,currencies,cca2'
        )
        const data = await response.json()
        
        // Filter countries that have currencies and sort by name
        const validCountries = data
          .filter((country: Country) => country.currencies)
          .sort((a: Country, b: Country) => 
            a.name.common.localeCompare(b.name.common)
          )
        
        setCountries(validCountries)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const handleCountryChange = (countryCode: string) => {
    onValueChange(countryCode)
    
    // Find the selected country and get its currency
    const selectedCountry = countries.find(country => country.cca2 === countryCode)
    if (selectedCountry && selectedCountry.currencies) {
      const currencyCode = Object.keys(selectedCountry.currencies)[0]
      onCurrencyChange(currencyCode)
    }
  }

  return (
    <FormField label="Country" error={error} required>
      <Select value={value} onValueChange={handleCountryChange}>
        <SelectTrigger>
          <SelectValue 
            placeholder={loading ? "Loading countries..." : "Select your country"} 
          />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.cca2} value={country.cca2}>
              {country.name.common}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}