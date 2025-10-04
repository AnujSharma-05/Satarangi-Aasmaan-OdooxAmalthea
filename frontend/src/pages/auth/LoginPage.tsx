import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { LoginForm } from '@/components/organisms/LoginForm'

interface LoginData {
  email: string
  password: string
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (data: LoginData) => {
    setLoading(true)
    
    try {
      // Simulate API call
      console.log('Login data:', data)
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, redirect based on user role
      // This would normally be determined by the API response
      const userRole = data.email.includes('admin') ? 'admin' : 
                      data.email.includes('manager') ? 'manager' : 'employee'
      
      switch (userRole) {
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'manager':
          navigate('/manager/dashboard')
          break
        case 'employee':
        default:
          navigate('/employee/dashboard')
          break
      }
    } catch (error) {
      console.error('Login error:', error)
      // TODO: Show error notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your expense management account"
    >
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  )
}