import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/molecules/FormField'
import { CountrySelector } from '@/components/molecules/CountrySelector'
import { Spinner } from '@/components/atoms/Spinner'

interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  country: string
  currency: string
}

interface SignupFormProps {
  onSubmit: (data: SignupData) => void
  loading?: boolean
}

export function SignupForm({ onSubmit, loading = false }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    currency: ''
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof SignupData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={handleInputChange('name')}
        error={errors.name}
        required
        disabled={loading}
      />

      <InputField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        error={errors.email}
        required
        disabled={loading}
      />

      <CountrySelector
        value={formData.country}
        onValueChange={(country) => {
          setFormData(prev => ({ ...prev, country }))
          if (errors.country) {
            setErrors(prev => ({ ...prev, country: undefined }))
          }
        }}
        onCurrencyChange={(currency) => {
          setFormData(prev => ({ ...prev, currency }))
        }}
        error={errors.country}
      />

      {formData.currency && (
        <div className="text-sm text-muted-foreground">
          Company currency will be set to: <strong>{formData.currency}</strong>
        </div>
      )}

      <InputField
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        error={errors.password}
        required
        disabled={loading}
      />

      <InputField
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        error={errors.confirmPassword}
        required
        disabled={loading}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}