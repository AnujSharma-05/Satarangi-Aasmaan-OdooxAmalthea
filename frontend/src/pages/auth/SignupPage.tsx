import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { SignupForm } from '@/components/organisms/SignupForm'

interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  country: string
  currency: string
}

export function SignupPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (data: SignupData) => {
    setLoading(true)
    
    try {
      // Simulate API call
      console.log('Signup data:', data)
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, redirect to admin dashboard
      navigate('/admin/users')
    } catch (error) {
      console.error('Signup error:', error)
      // TODO: Show error notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Your Account"
      description="Set up your company's expense management system"
    >
      <SignupForm onSubmit={handleSignup} loading={loading} />
    </AuthLayout>
  )
}