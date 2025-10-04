import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/atoms/Avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardLayoutProps {
  children: ReactNode
  userRole: 'admin' | 'manager' | 'employee'
  userName: string
  userEmail: string
}

export function DashboardLayout({ 
  children, 
  userRole, 
  userName, 
  userEmail 
}: DashboardLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Clear authentication state
    navigate('/login')
  }

  const roleBasedNavigation = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'User Management', path: '/admin/users' },
      { label: 'Approval Rules', path: '/admin/rules' },
    ],
    manager: [
      { label: 'Dashboard', path: '/manager/dashboard' },
      { label: 'Pending Approvals', path: '/manager/approvals' },
    ],
    employee: [
      { label: 'Dashboard', path: '/employee/dashboard' },
      { label: 'My Expenses', path: '/employee/expenses' },
      { label: 'New Expense', path: '/employee/new' },
    ],
  }

  const navigation = roleBasedNavigation[userRole]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Satarangi Aasmaan
                </h1>
              </Link>
              
              <nav className="ml-8 flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Role Indicator */}
              <span className="text-sm text-gray-500 capitalize">
                {userRole}
              </span>

              {/* User Avatar and Menu */}
              <div className="flex items-center space-x-3">
                <Avatar name={userName} size="sm" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userEmail}
                  </div>
                </div>
                
                <Select>
                  <SelectTrigger className="w-auto border-none shadow-none">
                    <User className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </div>
                    </SelectItem>
                    <SelectItem value="settings">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </div>
                    </SelectItem>
                    <SelectItem value="logout" onSelect={handleLogout}>
                      <div className="flex items-center text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}