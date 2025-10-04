import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignupPage } from '@/pages/auth/SignupPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/atoms/StatusChip'
import { Avatar } from '@/components/atoms/Avatar'
import { UserCard } from '@/components/molecules/UserCard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/manager/*" element={<ManagerRoutes />} />
          <Route path="/employee/*" element={<EmployeeRoutes />} />
          
          {/* Demo Route */}
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

// Admin Routes
function AdminRoutes() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Admin User"
      userEmail="admin@company.com"
    >
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/rules" element={<ApprovalRules />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

// Manager Routes
function ManagerRoutes() {
  return (
    <DashboardLayout
      userRole="manager"
      userName="Manager User"
      userEmail="manager@company.com"
    >
      <Routes>
        <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/approvals" element={<PendingApprovals />} />
        <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

// Employee Routes
function EmployeeRoutes() {
  return (
    <DashboardLayout
      userRole="employee"
      userName="Employee User"
      userEmail="employee@company.com"
    >
      <Routes>
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/expenses" element={<MyExpenses />} />
        <Route path="/new" element={<NewExpense />} />
        <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

// Placeholder Dashboard Components
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your expense management system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Expenses</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Total expenses processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Create and manage employee accounts</p>
        </div>
        <Button>Add New User</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Users</CardTitle>
          <CardDescription>Manage employee and manager accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <UserCard name="Anuj Sharma" email="anuj@company.com" role="Admin" />
            <UserCard name="Meet Jain" email="meet@company.com" role="Manager" />
            <UserCard name="Jayneel Mahiwal" email="jayneel@company.com" role="Employee" />
            <UserCard name="Vedesh Pandya" email="vedesh@company.com" role="Employee" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ApprovalRules() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
          <p className="text-gray-600">Configure expense approval workflows</p>
        </div>
        <Button>Create New Rule</Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No approval rules configured
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first approval workflow
            </p>
            <Button>Create First Rule</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Review and approve team expenses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Expenses waiting for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Total approved expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PendingApprovals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600">Review team expense requests</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pending approvals
            </h3>
            <p className="text-gray-600">
              All team expenses have been reviewed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600">Manage your expense claims</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Draft Expenses</CardTitle>
            <CardDescription>Ready to submit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Total expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,240</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MyExpenses() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600">Track all your expense claims</p>
        </div>
        <Button>New Expense</Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Office Supplies</h4>
                <p className="text-sm text-gray-600">Oct 1, 2025</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">$150.00</span>
                <StatusChip status="approved" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Client Lunch</h4>
                <p className="text-sm text-gray-600">Sep 28, 2025</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">$85.50</span>
                <StatusChip status="pending" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Travel Expenses</h4>
                <p className="text-sm text-gray-600">Sep 25, 2025</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">$320.00</span>
                <StatusChip status="waiting-approval" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NewExpense() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Expense</h1>
        <p className="text-gray-600">Submit a new expense claim</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Expense Form Coming Soon
            </h3>
            <p className="text-gray-600">
              The expense submission form will be implemented next
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Demo page to showcase components
function DemoPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Satarangi Aasmaan</h1>
        <p className="text-lg text-muted-foreground">
          Expense Management System - Component Demo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Buttons Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        {/* Status Chips Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
            <CardDescription>Expense status chips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusChip status="pending" />
            <StatusChip status="approved" />
            <StatusChip status="rejected" />
            <StatusChip status="draft" />
            <StatusChip status="waiting-approval" />
          </CardContent>
        </Card>

        {/* User Cards Demo */}
        <Card>
          <CardHeader>
            <CardTitle>User Components</CardTitle>
            <CardDescription>Avatar and user card examples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Avatar name="John Doe" size="sm" />
              <Avatar name="Jane Smith" size="md" />
              <Avatar name="Bob Johnson" size="lg" />
            </div>
            <UserCard
              name="Anuj Sharma"
              email="anuj@example.com"
              role="Admin"
            />
            <UserCard
              name="Meet Jain"
              email="meet@example.com"
              role="Manager"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Modern expense management solution for the Odoo x Amalthea Hackathon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <ul className="space-y-2">
              <li>✅ Frontend folder structure setup</li>
              <li>✅ Shadcn/UI integration complete</li>
              <li>✅ Atomic design component hierarchy</li>
              <li>✅ Authentication pages complete</li>
              <li>✅ Dashboard layouts implemented</li>
              <li>🚧 Role-specific views (in progress)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
