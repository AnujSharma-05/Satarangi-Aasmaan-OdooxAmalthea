# Satarangi Aasmaan - Frontend Implementation Plan

## 🎯 Project Overview
Modern expense management solution for the Odoo x Amalthea Hackathon with a component-driven architecture using React, TypeScript, and shadcn/ui.

## 🏗️ Architecture
- **Design System**: Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: React Context API + Custom Hooks
- **Routing**: react-router-dom
- **Notifications**: react-hot-toast

---

## 📋 Implementation Plan

### 1. Authentication & Initial Setup ✅ (In Progress)

#### A. Signup Page
**Goal**: Create the first Admin and the Company.

**Components**:
- Form with fields: Name, Email, Password, Confirm Password
- **Key Feature**: Country Selection Dropdown → Auto-sets company's base currency
- Uses restcountries.com API for country-currency mapping

**Files to Create**:
- `src/pages/auth/SignupPage.tsx`
- `src/components/organisms/SignupForm.tsx`
- `src/components/molecules/CountrySelector.tsx`

#### B. Sign-in Page
**Goal**: Allow existing users to log in.

**Components**:
- Simple form: Email, Password
- "Login" button

**Files to Create**:
- `src/pages/auth/LoginPage.tsx`
- `src/components/organisms/LoginForm.tsx`

#### C. Admin's First View: User Creation
**Goal**: After first signup, Admin creates other users.

**Components**:
- User table listing (initially just admin)
- "Add New User" form: Name, Email, Role (Manager/Employee)
- "Send Password" button for each user

**Files to Create**:
- `src/pages/admin/UserManagementPage.tsx`
- `src/components/organisms/UserTable.tsx`
- `src/components/organisms/AddUserForm.tsx`

---

### 2. Employee Dashboard

#### A. Main View
**Goal**: Clear overview of all expenses.

**Components**:
- **Tabbed Navigation**: Three tabs by status:
  - To Submit (Drafts)
  - Waiting Approval  
  - Approved
- **Expense Table**: List of expenses per selected tab
- **Action Buttons**: "Upload" and "New" for new expense claims

**Files to Create**:
- `src/pages/employee/EmployeeDashboard.tsx`
- `src/components/organisms/ExpenseTable.tsx`
- `src/components/molecules/ExpenseStatusTabs.tsx`

#### B. Expense Submission Form
**Goal**: Intuitive form for new expense submission.

**Components**:
- Fields: Description, Date, Category, Paid By, Remarks
- **Key Feature 1**: "Attach Receipt" button for OCR scanning
- **Key Feature 2**: Amount + Currency Selection (multi-currency support)
- **Log History**: Read-only approval history section
- "Submit" button

**Files to Create**:
- `src/pages/employee/ExpenseFormPage.tsx`
- `src/components/organisms/ExpenseForm.tsx`
- `src/components/molecules/ReceiptUpload.tsx`
- `src/components/molecules/CurrencyAmountInput.tsx`
- `src/components/molecules/ApprovalHistory.tsx`

---

### 3. Manager Dashboard

#### A. Main View: "Approvals to review"
**Goal**: Simple, scannable queue of pending expenses.

**Components**:
- **Data Table** with all necessary information
- **Key Feature**: "Total amount" column shows original + converted amounts
  - Example: `567$ (= INR) = 49896`
- **Action Buttons**: "Approve" and "Reject" per row
- **UX**: Once approved/rejected, buttons disappear → read-only status

**Files to Create**:
- `src/pages/manager/ManagerDashboard.tsx`
- `src/components/organisms/ApprovalQueue.tsx`
- `src/components/molecules/ApprovalActions.tsx`
- `src/components/molecules/CurrencyDisplay.tsx`

---

### 4. Admin Dashboard (Advanced Configuration)

#### A. Main View: "Approval Rules"
**Goal**: Create and manage expense approval workflows.

**Components**:
- List of existing rules
- Form to create new rule

**Files to Create**:
- `src/pages/admin/AdminDashboard.tsx`
- `src/components/organisms/ApprovalRulesList.tsx`

#### B. Approval Rule Form
**Goal**: Flexible form for complex approval logic.

**Components**:
- Fields: User and their default Manager
- **Approvers List**: Define sequence (1. John, 2. Mitchell, 3. Andreas)
- **Key Logic Checkboxes**:
  - `Is manager an approver?`: Auto-routes to direct manager first
  - `Approvers Sequence?`: Sequential vs parallel approval
- **Conditional Rule**: Minimum Approval percentage field

**Files to Create**:
- `src/pages/admin/ApprovalRuleFormPage.tsx`
- `src/components/organisms/ApprovalRuleBuilder.tsx`
- `src/components/molecules/ApproverSequence.tsx`
- `src/components/molecules/ConditionalRules.tsx`

---

## 📁 Folder Structure

```
frontend/src/
├── components/
│   ├── atoms/                 # Basic building blocks
│   │   ├── StatusChip.tsx     ✅
│   │   ├── Avatar.tsx         ✅
│   │   └── Spinner.tsx        ✅
│   ├── molecules/             # Simple compound components
│   │   ├── FormField.tsx      ✅
│   │   ├── UserCard.tsx       ✅
│   │   ├── CountrySelector.tsx
│   │   ├── CurrencyAmountInput.tsx
│   │   ├── ReceiptUpload.tsx
│   │   ├── ApprovalHistory.tsx
│   │   ├── ApprovalActions.tsx
│   │   ├── CurrencyDisplay.tsx
│   │   ├── ExpenseStatusTabs.tsx
│   │   ├── ApproverSequence.tsx
│   │   └── ConditionalRules.tsx
│   ├── organisms/             # Complex sections
│   │   ├── Header.tsx
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ExpenseTable.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ApprovalQueue.tsx
│   │   ├── UserTable.tsx
│   │   ├── AddUserForm.tsx
│   │   ├── ApprovalRulesList.tsx
│   │   └── ApprovalRuleBuilder.tsx
│   ├── templates/             # Page layouts
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx         ✅
│       ├── input.tsx          ✅
│       ├── card.tsx           ✅
│       ├── tabs.tsx           ✅
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       └── toast.tsx
├── pages/                     # Route components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx
│   │   └── ExpenseFormPage.tsx
│   ├── manager/
│   │   └── ManagerDashboard.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── UserManagementPage.tsx
│       └── ApprovalRuleFormPage.tsx
├── contexts/                  # React contexts
│   ├── AuthContext.tsx
│   └── ExpenseContext.tsx
├── hooks/                     # Custom hooks
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   └── useUsers.ts
├── lib/                       # Utilities
│   ├── utils.ts               ✅
│   ├── api.ts
│   └── constants.ts
└── types/                     # TypeScript types
    ├── auth.ts
    ├── expense.ts
    └── user.ts
```

---

## 🚀 Next Steps

1. **✅ Completed**: Basic component structure with atoms and molecules
2. **🚧 In Progress**: Authentication pages and forms
3. **📋 Next**: Dashboard layouts and role-specific views
4. **🔄 Future**: Employee, Manager, and Admin specific functionality

---

## 🎨 Key UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Real-time Feedback**: Loading states, success/error notifications
- **Currency Conversion**: Multi-currency support with real-time rates
- **OCR Integration**: Receipt scanning for automatic data extraction
- **Drag & Drop**: Approver sequence reordering
- **Progressive Enhancement**: Works without JavaScript for basic functionality

---

## 🔧 Technical Stack

- **React 18**: Latest features with TypeScript
- **Vite**: Fast development and building
- **shadcn/ui**: Modern, accessible components
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Unstyled, accessible primitives
- **Lucide React**: Modern icon library
- **React Router**: Client-side routing
- **React Hook Form**: Efficient form handling
- **Zod**: Schema validation