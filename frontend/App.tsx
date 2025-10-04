import React, { useState, useMemo, useRef, useCallback } from 'react';
import { LogOut, Plus, UploadCloud, UserPlus, Save, Send, X, CheckCircle, Clock, XCircle, Eye, AlertCircle, Info, FileText, Settings, Users, ShieldCheck, ArrowLeft, ChevronsRight, ListOrdered } from 'lucide-react';

// 1. TYPES & INTERFACES
// =================================

type UserRole = 'Admin' | 'Manager' | 'Employee';
type ExpenseStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
type ApproverStatus = 'Pending' | 'Approved' | 'Rejected';
type Page = 'login' | 'signup' | 'resetPassword';
type AdminTab = 'users' | 'rules' | 'expenses';
type ManagerTab = 'approvals' | 'team';


interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
}

interface ApproverAction {
    userId: string;
    status: ApproverStatus;
    comment?: string;
    timestamp?: string;
}

interface Expense {
  id:string;
  employeeId: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paidBy: string;
  remarks?: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  approvers: ApproverAction[];
  ruleId?: string; // Link to the rule that was applied
}

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  managerId?: string; // This can be deprecated if manager is always the employee's manager
  managerIsApprover: boolean;
  approvers: { userId: string; isRequired: boolean }[];
  isSequential: boolean;
  minApprovalPercentage: number;
}

// 2. CONSTANTS & MOCK DATA
// =================================

const CURRENCY_CONVERSION_RATES = {
  USD: 1,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79,
};

const MOCK_USERS: User[] = [
  // No admin initially to allow signup
  { id: 'user-2', name: 'Bob Manager', email: 'manager@odoo.com', role: 'Manager' },
  { id: 'user-3', name: 'Charlie Employee', email: 'employee@odoo.com', role: 'Employee', managerId: 'user-2' },
  { id: 'user-4', name: 'Diana Employee', email: 'employee2@odoo.com', role: 'Employee', managerId: 'user-5' },
  { id: 'user-5', name: 'Sarah Manager', email: 'manager2@odoo.com', role: 'Manager' },
  { id: 'user-6', name: 'John (Finance)', email: 'john@odoo.com', role: 'Manager' },
  { id: 'user-7', name: 'Mitchell (Director)', email: 'mitchell@odoo.com', role: 'Manager' },
  { id: 'user-8', name: 'Andreas (CFO)', email: 'andreas@odoo.com', role: 'Manager' },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', employeeId: 'user-3', description: 'Team Lunch in Bangalore', category: 'Food', amount: 5000, currency: 'INR', expenseDate: '2024-07-15', paidBy: 'Personal', status: 'Pending Approval', remarks: "Lunch with the new interns.", approvers: [{ userId: 'user-2', status: 'Pending' }], ruleId: 'rule-1' },
  { id: 'exp-2', employeeId: 'user-3', description: 'Client Meeting Travel', category: 'Travel', amount: 150, currency: 'USD', expenseDate: '2024-07-12', paidBy: 'Company Card', status: 'Approved', approvers: [{ userId: 'user-2', status: 'Approved', timestamp: '2024-07-13 10:30 AM' }], ruleId: 'rule-1' },
  { id: 'exp-3', employeeId: 'user-4', description: 'Software Subscription', category: 'Supplies', amount: 75, currency: 'EUR', expenseDate: '2024-07-10', paidBy: 'Company Card', status: 'Rejected', approvers: [{ userId: 'user-5', status: 'Rejected', comment: 'Duplicate subscription.', timestamp: '2024-07-11 02:45 PM' }], ruleId: 'rule-1' },
  { id: 'exp-4', employeeId: 'user-3', description: 'Office Supplies', category: 'Supplies', amount: 80, currency: 'USD', expenseDate: '2024-07-05', paidBy: 'Personal', status: 'Approved', approvers: [{ userId: 'user-2', status: 'Approved', timestamp: '2024-07-06 09:00 AM' }], ruleId: 'rule-1' },
  { id: 'exp-5', employeeId: 'user-4', description: 'Business Trip to Berlin', category: 'Travel', amount: 1200, currency: 'EUR', expenseDate: '2024-07-20', paidBy: 'Personal', status: 'Pending Approval', approvers: [{ userId: 'user-5', status: 'Approved', timestamp: '2024-07-21 11:00 AM' }, { userId: 'user-6', status: 'Pending' }], ruleId: 'rule-1' },
  { id: 'exp-6', employeeId: 'user-3', description: 'Coffee with client', category: 'Food', amount: 25, currency: 'USD', expenseDate: '2024-07-18', paidBy: 'Personal', status: 'Draft', approvers: [] },
  { id: 'exp-7', employeeId: 'user-3', description: 'Keyboard for Home Office', category: 'Supplies', amount: 95, currency: 'USD', expenseDate: '2024-07-22', paidBy: 'Personal', status: 'Pending Approval', approvers: [{ userId: 'user-2', status: 'Pending' }], ruleId: 'rule-1' },
  { id: 'exp-8', employeeId: 'user-3', description: 'Taxi to Airport', category: 'Travel', amount: 45, currency: 'USD', expenseDate: '2024-07-23', paidBy: 'Company Card', status: 'Pending Approval', approvers: [{ userId: 'user-2', status: 'Pending' }], ruleId: 'rule-1' },
];

const MOCK_APPROVAL_RULES: ApprovalRule[] = [
    {
        id: 'rule-1',
        name: 'Approval rule for miscellaneous expenses',
        description: 'This rule applies to all miscellaneous expenses submitted by employees.',
        managerIsApprover: true,
        approvers: [
            { userId: 'user-6', isRequired: true }, // Finance
            { userId: 'user-7', isRequired: false }, // Director
            { userId: 'user-8', isRequired: false }, // CFO
        ],
        isSequential: true,
        minApprovalPercentage: 60,
    }
];

const COUNTRIES: Record<string, keyof typeof CURRENCY_CONVERSION_RATES> = {
    "United States": "USD", "India": "INR", "Germany": "EUR", "United Kingdom": "GBP",
};

// 3. REUSABLE UI COMPONENTS
// =================================

const StatusBadge: React.FC<{ status: ExpenseStatus | 'Submitted' | ApproverStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-bold uppercase tracking-wider border-2";
  const colorClasses: Record<string, string> = {
    'Draft': 'bg-gray-200 text-gray-800 border-gray-800',
    'Pending Approval': 'bg-amber-200 text-amber-900 border-amber-900',
    'Submitted': 'bg-amber-200 text-amber-900 border-amber-900',
    'Approved': 'bg-green-200 text-green-900 border-green-900',
    'Rejected': 'bg-red-200 text-red-900 border-red-900',
    'Pending': 'bg-amber-200 text-amber-900 border-amber-900',
  };
  return <span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>;
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-50 border-4 border-black w-full max-w-2xl max-h-[90vh] flex flex-col relative transform transition-all duration-300 shadow-[8px_8px_0px_#000]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b-4 border-black bg-white">
          <h3 className="font-slab text-2xl font-bold uppercase">{title}</h3>
          <button onClick={onClose} className="text-black hover:text-orange-500 border-2 border-black rounded-full w-8 h-8 flex items-center justify-center bg-white hover:bg-black transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 4. AUTHENTICATION SCREENS
// =================================

const OdooLogo: React.FC = () => (
    <span className="font-slab text-5xl font-black text-black tracking-tighter">odoo</span>
);

const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, ...props }, ref) => (
    <div>
        <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">{label}</label>
        <input ref={ref} {...props} className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" />
    </div>
));

const AuthButton: React.FC<{ children: React.ReactNode, onClick?: () => void, type?: "button" | "submit" | "reset", className?: string, disabled?: boolean }> = ({ children, onClick, type = "submit", className, disabled }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`w-full py-4 px-4 bg-orange-500 text-white font-bold text-lg uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:-translate-y-1 hover:translate-x-1 transition-all duration-200 active:bg-orange-600 disabled:bg-gray-400 disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const AuthMessage: React.FC<{ type: 'error' | 'info' | 'success'; message: React.ReactNode; }> = ({ type, message }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-200' : 'bg-gray-200';
    const borderColor = isError ? 'border-red-800' : 'border-gray-800';
    const textColor = isError ? 'text-red-800' : 'text-gray-800';
    const Icon = isError ? AlertCircle : Info;
    return (
        <div className={`p-4 border-2 flex items-start gap-3 ${bgColor} ${borderColor}`}>
            <Icon size={20} className={`mt-0.5 ${textColor} flex-shrink-0`} />
            <div className={`text-sm font-bold ${textColor}`}>{message}</div>
        </div>
    );
};

const AuthPageWrapper: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
        <div className="w-full max-w-md mx-auto p-8 bg-white border-4 border-black shadow-[8px_8px_0px_#111827]">
            <div className="text-center mb-8">
                <OdooLogo/>
                {title && <h2 className="font-slab text-2xl font-bold mt-4 uppercase">{title}</h2>}
            </div>
            {children}
        </div>
    </div>
);

const LoginPage: React.FC<{ onLogin: (email: string, password: string) => boolean; onSwitchToSignup: () => void; onNavigateToReset: () => void; adminExists: boolean; }> = ({ onLogin, onSwitchToSignup, onNavigateToReset, adminExists }) => {
  const [email, setEmail] = useState('employee@odoo.com'); const [password, setPassword] = useState('password');
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: React.ReactNode } | null>(null);
  const clearMessage = () => setMessage(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); clearMessage();
    if (!onLogin(email, password)) setMessage({ type: 'error', text: 'Invalid email or password.' });
  };
  return (
    <AuthPageWrapper title="Signin Page">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput label="Email Address" type="email" value={email} onChange={(e) => {setEmail(e.target.value); clearMessage();}} required placeholder="user@odoo.com" />
        <AuthInput label="Password" type="password" value={password} onChange={(e) => {setPassword(e.target.value); clearMessage();}} required placeholder="••••••••" />
        {message && <AuthMessage type={message.type as 'error'} message={message.text} />}
        <AuthButton>Login</AuthButton>
      </form>
      <div className="mt-6 text-center space-x-4">
          <button onClick={onNavigateToReset} className="text-sm font-bold text-black hover:underline">Forgot password?</button>
           {adminExists ? (
              <span className="text-sm text-gray-500 font-bold" title="Contact your administrator to create a new user.">Sign up (1 admin per company)</span>
           ) : (
              <button onClick={onSwitchToSignup} className="text-sm font-bold text-black hover:underline">Sign up</button>
           )}
      </div>
    </AuthPageWrapper>
  );
};

const SignupPage: React.FC<{ onSignup: (name: string, email: string, pass: string, country: string) => void; onSwitchToLogin: () => void; }> = ({ onSignup, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [country, setCountry] = useState(Object.keys(COUNTRIES)[0]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        onSignup(name, email, password, country);
    };

    return (
        <AuthPageWrapper title="Admin (Company) Signup Page">
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput label="Full Name" type="text" required value={name} onChange={e => setName(e.target.value)} />
                <AuthInput label="Email Address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                <AuthInput label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                <AuthInput label="Confirm password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <div>
                    <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Country Selection</label>
                    <select value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                        {Object.keys(COUNTRIES).map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                {error && <AuthMessage type="error" message={error} />}
                <AuthButton>Create Account</AuthButton>
            </form>
            <div className="mt-6 text-center">
                <button onClick={onSwitchToLogin} className="text-sm font-bold text-black hover:underline">Already have an account? Login</button>
            </div>
        </AuthPageWrapper>
    );
};

const ResetPasswordPage: React.FC<{ onSwitchToLogin: () => void; }> = ({ onSwitchToLogin }) => (
    <AuthPageWrapper>
        <p className="text-center mb-6">Enter your email to receive a password reset link.</p>
        <form className="space-y-6">
            <AuthInput label="Email Address" type="email" required />
            <AuthButton type="button" onClick={() => { alert('If an account exists, a reset link has been sent.'); onSwitchToLogin(); }}>Send Reset Link</AuthButton>
        </form>
        <div className="mt-6 text-center">
            <button onClick={onSwitchToLogin} className="text-sm font-bold text-black hover:underline flex items-center gap-2 justify-center w-full">
                <ArrowLeft size={16} /> Back to Login
            </button>
        </div>
    </AuthPageWrapper>
);


// 5. DASHBOARD COMPONENTS
// =================================

const Header: React.FC<{ user: User, onLogout: () => void, activeTab?: string, onTabChange?: (tab: string) => void }> = ({ user, onLogout, activeTab, onTabChange }) => {
    const navItems = {
        'Employee': [{ key: 'expenses', label: 'My Expenses', icon: FileText }],
        'Manager': [{ key: 'approvals', label: 'Approval Queue', icon: ShieldCheck }, { key: 'team', label: 'Team Expenses', icon: Users }],
        'Admin': [{ key: 'users', label: 'Users', icon: Users }, { key: 'rules', label: 'Approval Rules', icon: Settings }, { key: 'expenses', label: 'All Expenses', icon: ListOrdered }],
    };
    const currentNavs = navItems[user.role];
    return (
        <header className="bg-white border-b-4 border-black p-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
                <OdooLogo />
                {onTabChange && currentNavs.length > 1 && (
                    <nav className="flex items-center gap-2 border-2 border-black p-1 bg-gray-100">
                        {currentNavs.map(nav => (
                            <button key={nav.key} onClick={() => onTabChange(nav.key)} className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === nav.key ? 'bg-black text-white' : 'text-black hover:bg-gray-200'}`}>
                                <nav.icon size={16}/> {nav.label}
                            </button>
                        ))}
                    </nav>
                )}
            </div>
            <div className="flex items-center gap-4">
                 <div>
                    <p className="font-bold text-black text-right text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600 text-right">{user.role}</p>
                </div>
                <button onClick={onLogout} className="bg-black text-white px-3 py-2 text-sm font-bold flex items-center gap-2 hover:bg-orange-500 transition-colors">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </header>
    )
}

const DashboardLayout: React.FC<{ children: React.ReactNode, user: User, onLogout: () => void, activeTab?: string, onTabChange?: (tab: string) => void }> = ({ children, user, onLogout, activeTab, onTabChange }) => (
    <div className="min-h-screen bg-gray-100">
        <Header user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={onTabChange}/>
        <main className="p-8">
            {children}
        </main>
    </div>
);

const ExpenseFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (expense: Omit<Expense, 'id' | 'approvers' | 'status' | 'ruleId'>, isDraft: boolean) => void; employeeId: string; expenseToEdit?: Expense | null; isOcrSimulated?: boolean; }> = ({ isOpen, onClose, onSave, employeeId, expenseToEdit, isOcrSimulated }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidBy, setPaidBy] = useState('Personal');
    const [remarks, setRemarks] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            if (expenseToEdit) {
                setDescription(expenseToEdit.description); setCategory(expenseToEdit.category); setAmount(String(expenseToEdit.amount));
                setCurrency(expenseToEdit.currency); setExpenseDate(expenseToEdit.expenseDate); setPaidBy(expenseToEdit.paidBy); setRemarks(expenseToEdit.remarks || '');
            } else {
                 setDescription(''); setCategory('Food'); setAmount(''); setCurrency('USD');
                 setExpenseDate(new Date().toISOString().split('T')[0]); setPaidBy('Personal'); setRemarks('');
            }
        }
    }, [expenseToEdit, isOpen]);
    
    const handleSubmit = (isDraft: boolean) => {
        const expenseData = {
            employeeId, description, category, amount: parseFloat(amount) || 0, currency, expenseDate,
            paidBy, remarks, receiptUrl: expenseToEdit?.receiptUrl,
        };
        onSave(expenseData, isDraft);
        onClose();
    };
    
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Edit Expense" : "New Expense"}>
      <div className="space-y-6">
        {isOcrSimulated && (
            <AuthMessage type="success" message="Receipt scanned! We've filled in the details for you." />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AuthInput label="Description" type="text" value={description} onChange={e => setDescription(e.target.value)} />
            <AuthInput label="Expense Date" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                    <option>Food</option><option>Travel</option><option>Supplies</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Paid By</label>
                 <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                    <option>Personal</option><option>Company Card</option>
                </select>
            </div>
        </div>
        <div>
            <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Total Amount</label>
            <div className="flex">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" />
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="px-4 py-3 bg-black text-white border-2 border-black text-lg">
                    {Object.keys(CURRENCY_CONVERSION_RATES).map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
        </div>
        <AuthInput label="Remarks (Optional)" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
            <button onClick={() => handleSubmit(true)} className="px-5 py-2.5 bg-gray-200 text-black font-bold border-2 border-black hover:bg-black hover:text-white transition-colors">Save as Draft</button>
            <button onClick={() => handleSubmit(false)} className="px-5 py-2.5 bg-orange-500 text-white font-bold border-2 border-black hover:bg-black transition-colors">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
};

const SummaryCard: React.FC<{ title: string; amount: number; currency: string; icon: React.ElementType; color: string; }> = ({ title, amount, currency, icon: Icon, color }) => (
    <div className={`p-4 bg-white border-2 border-black flex-1 shadow-[4px_4px_0px_#000]`}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider">{title}</p>
            <Icon size={24} className={color}/>
        </div>
        <p className="font-slab text-3xl font-black mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}</p>
    </div>
);

const EmployeeDashboard: React.FC<{ user: User; expenses: Expense[]; users: User[]; onLogout: () => void; onUpdateExpenses: (expenses: Expense[]) => void; baseCurrency: string; approvalRules: ApprovalRule[]; }> = ({ user, expenses, users, onLogout, onUpdateExpenses, baseCurrency, approvalRules }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isOcrSimulated, setIsOcrSimulated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {userExpenses, summary} = useMemo(() => {
    const filtered = expenses.filter(e => e.employeeId === user.id).sort((a,b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
    const summaryData = filtered.reduce((acc, exp) => {
        const amountInBase = (exp.amount / (CURRENCY_CONVERSION_RATES[exp.currency as keyof typeof CURRENCY_CONVERSION_RATES] || 1)) * (CURRENCY_CONVERSION_RATES[baseCurrency as keyof typeof CURRENCY_CONVERSION_RATES] || 1) ;
        if (exp.status === 'Draft') acc.draft += amountInBase;
        else if (exp.status === 'Pending Approval') acc.pending += amountInBase;
        else if (exp.status === 'Approved') acc.approved += amountInBase;
        return acc;
    }, { draft: 0, pending: 0, approved: 0 });
    return { userExpenses: filtered, summary: summaryData };
  }, [expenses, user.id, baseCurrency]);

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'approvers' | 'status' | 'ruleId'>, isDraft: boolean) => {
    const status: ExpenseStatus = isDraft ? 'Draft' : 'Pending Approval';
    const rule = approvalRules[0]; // Assuming one rule for simplicity
    
    let approvers: ApproverAction[] = [];
    if (!isDraft && rule) {
        const employee = users.find(u => u.id === expenseData.employeeId);
        if(rule.managerIsApprover && employee?.managerId) {
            approvers.push({ userId: employee.managerId, status: 'Pending' });
        }
        rule.approvers.forEach(approver => {
            // Avoid adding manager twice
            if(!approvers.some(a => a.userId === approver.userId)) {
                approvers.push({ userId: approver.userId, status: 'Pending' });
            }
        });
    }
    
    let updatedExpenses;
    if (selectedExpense && selectedExpense.id) { 
        const updatedExpense = { ...selectedExpense, ...expenseData, status, approvers, ruleId: rule?.id };
        updatedExpenses = expenses.map(e => e.id === selectedExpense.id ? updatedExpense : e);
    } else { 
        const newExpense: Expense = { ...expenseData, id: `exp-${Date.now()}`, status, approvers, ruleId: rule?.id };
        updatedExpenses = [...expenses, newExpense];
    }
    onUpdateExpenses(updatedExpenses);
    setSelectedExpense(null);
  };
  
  const handleRowClick = (expense: Expense) => {
      if (expense.status === 'Draft') {
        setSelectedExpense(expense);
        setIsFormModalOpen(true);
      } else {
        alert("This expense has been submitted and cannot be edited.");
      }
  };
  
  const handleNewExpenseClick = () => { setSelectedExpense(null); setIsOcrSimulated(false); setIsFormModalOpen(true); }
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
          const simulatedExpenseData = {
              description: `Scanned Receipt: Dinner`, category: 'Food', amount: Math.floor(Math.random() * 150) + 20,
              currency: 'USD', expenseDate: new Date().toISOString().split('T')[0], paidBy: 'Personal', remarks: 'Auto-filled via OCR.',
          };
          const simulatedExpenseForModal: Expense = { ...simulatedExpenseData, id: '', employeeId: user.id, status: 'Draft', approvers: [] };
          setSelectedExpense(simulatedExpenseForModal);
          setIsOcrSimulated(true);
          setIsFormModalOpen(true);
      }
      if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-slab text-4xl font-black uppercase">My Expenses</h1>
          <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button onClick={handleUploadClick} className="px-4 py-3 bg-white text-black font-bold border-2 border-black flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <UploadCloud size={20} /><span>Upload</span>
              </button>
              <button onClick={handleNewExpenseClick} className="px-4 py-3 bg-orange-500 text-white font-bold border-2 border-black flex items-center gap-2 hover:bg-black transition-colors">
                <Plus size={20} /><span>New</span>
              </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SummaryCard title="Draft" amount={summary.draft} currency={baseCurrency} icon={FileText} color="text-gray-500" />
            <SummaryCard title="Waiting Approval" amount={summary.pending} currency={baseCurrency} icon={Clock} color="text-amber-500" />
            <SummaryCard title="Approved" amount={summary.approved} currency={baseCurrency} icon={CheckCircle} color="text-green-500" />
        </div>
        <div className="bg-white border-4 border-black">
          <table className="w-full text-left">
            <thead className="border-b-4 border-black"><tr className="font-bold uppercase tracking-wider text-sm">
                <th className="p-4">Description</th><th className="p-4">Date</th><th className="p-4">Category</th>
                <th className="p-4">Amount</th><th className="p-4 text-center">Status</th>
            </tr></thead>
            <tbody>
              {userExpenses.map(exp => (
                <tr key={exp.id} className="border-b-2 border-black last:border-b-0 hover:bg-gray-100 cursor-pointer" onClick={() => handleRowClick(exp)}>
                  <td className="p-4 font-bold">{exp.description}</td>
                  <td className="p-4">{exp.expenseDate}</td>
                  <td className="p-4">{exp.category}</td>
                  <td className="p-4 font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: exp.currency }).format(exp.amount)}</td>
                  <td className="p-4 text-center"><StatusBadge status={exp.status === 'Pending Approval' ? 'Submitted' : exp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
           {userExpenses.length === 0 && <p className="text-center p-8">No expenses found.</p>}
        </div>
        <ExpenseFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveExpense} employeeId={user.id} expenseToEdit={selectedExpense} isOcrSimulated={isOcrSimulated} />
    </DashboardLayout>
  );
};

const ManagerDashboard: React.FC<{ user: User; expenses: Expense[]; users: User[]; onLogout: () => void; onUpdateExpenses: (expenses: Expense[]) => void; baseCurrency: string; approvalRules: ApprovalRule[] }> = ({ user, expenses, users, onLogout, onUpdateExpenses, baseCurrency, approvalRules }) => {
    const [activeTab, setActiveTab] = useState<ManagerTab>('approvals');

    const { managedExpenses, teamExpenses } = useMemo(() => {
        const approvalQueue = expenses.filter(exp => exp.approvers.some(a => a.userId === user.id)).sort((a,b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
        const teamMemberIds = users.filter(u => u.managerId === user.id).map(u => u.id);
        const teamSubmissions = expenses.filter(exp => teamMemberIds.includes(exp.employeeId)).sort((a,b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
        return { managedExpenses: approvalQueue, teamExpenses: teamSubmissions };
    }, [expenses, user.id, users]);
    
    const calculateExpenseStatus = useCallback((approvers: ApproverAction[], rule: ApprovalRule): ExpenseStatus => {
        if (approvers.some(a => a.status === 'Rejected')) return 'Rejected';
        
        const requiredApprovers = rule.approvers.filter(a => a.isRequired).map(a => a.userId);
        const haveAllRequiredApproved = requiredApprovers.every(reqId => approvers.find(a => a.userId === reqId)?.status === 'Approved');

        const totalApprovers = approvers.length;
        const approvedCount = approvers.filter(a => a.status === 'Approved').length;
        const approvalPercentage = totalApprovers > 0 ? (approvedCount / totalApprovers) * 100 : 0;

        if (haveAllRequiredApproved && approvalPercentage >= rule.minApprovalPercentage) {
             return 'Approved';
        }

        return 'Pending Approval';
    }, []);

    const handleApproval = useCallback((expenseId: string, newStatus: ApproverStatus) => {
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        const rule = approvalRules.find(r => r.id === expense.ruleId);
        if (!rule) {
            console.error("No rule found for expense");
            return;
        }

        onUpdateExpenses(expenses.map(exp => {
            if (exp.id === expenseId) {
                const updatedApprovers = exp.approvers.map(a => a.userId === user.id ? { ...a, status: newStatus, timestamp: new Date().toLocaleString() } : a);
                const finalStatus = calculateExpenseStatus(updatedApprovers, rule);
                return { ...exp, approvers: updatedApprovers, status: finalStatus };
            }
            return exp;
        }));
    }, [expenses, approvalRules, user.id, calculateExpenseStatus, onUpdateExpenses]);
    
    const getEmployeeName = useCallback((employeeId: string) => users.find(u => u.id === employeeId)?.name || 'Unknown', [users]);
    
    const formatConvertedAmount = useCallback((amount: number, currency: string) => {
        const rate = CURRENCY_CONVERSION_RATES[currency as keyof typeof CURRENCY_CONVERSION_RATES] || 1;
        const baseRate = CURRENCY_CONVERSION_RATES[baseCurrency as keyof typeof CURRENCY_CONVERSION_RATES] || 1;
        const convertedAmount = (amount / rate) * baseRate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: baseCurrency }).format(convertedAmount);
    }, [baseCurrency]);

    const isUserTurnToApprove = useCallback((expense: Expense): boolean => {
        const rule = approvalRules.find(r => r.id === expense.ruleId);
        if (!rule || !rule.isSequential) return true; // Not sequential, everyone can approve

        const firstPendingIndex = expense.approvers.findIndex(a => a.status === 'Pending');
        if (firstPendingIndex === -1) return false; // All done

        return expense.approvers[firstPendingIndex].userId === user.id;
    }, [approvalRules, user.id]);

    const renderContent = () => {
        if (activeTab === 'approvals') return (
            <>
                <h1 className="font-slab text-4xl font-black uppercase mb-6">Approval Queue</h1>
                 <div className="bg-white border-4 border-black">
                    <table className="w-full text-left">
                         <thead className="border-b-4 border-black"><tr className="font-bold uppercase tracking-wider text-sm">
                            <th className="p-4">Owner</th><th className="p-4">Description</th><th className="p-4">Amount ({baseCurrency})</th>
                            <th className="p-4 text-center">Your Status</th><th className="p-4 text-center">Actions</th>
                        </tr></thead>
                        <tbody>
                        {managedExpenses.map(exp => {
                            const managerApproval = exp.approvers.find(a => a.userId === user.id);
                            const canApprove = managerApproval?.status === 'Pending' && isUserTurnToApprove(exp);
                            return (
                                <tr key={exp.id} className="border-b-2 border-black last:border-b-0">
                                    <td className="p-4 font-bold">{getEmployeeName(exp.employeeId)}</td>
                                    <td className="p-4">{exp.description}</td>
                                    <td className="p-4 font-bold">{formatConvertedAmount(exp.amount, exp.currency)}</td>
                                    <td className="p-4 text-center"><StatusBadge status={managerApproval?.status || 'Pending'}/></td>
                                    <td className="p-4">
                                        {canApprove ? (
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleApproval(exp.id, 'Approved')} className="px-3 py-1 bg-green-200 text-green-900 font-bold border-2 border-green-900 hover:bg-black hover:text-white transition">Approve</button>
                                                <button onClick={() => handleApproval(exp.id, 'Rejected')} className="px-3 py-1 bg-red-200 text-red-900 font-bold border-2 border-red-900 hover:bg-black hover:text-white transition">Reject</button>
                                            </div>
                                        ) : <div className="text-center text-sm italic">{managerApproval?.status !== 'Pending' ? 'Done' : 'Waiting'}</div>}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                     {managedExpenses.length === 0 && <p className="text-center p-8">Approval queue is empty.</p>}
                </div>
            </>
        )
        if (activeTab === 'team') return (
             <>
                <h1 className="font-slab text-4xl font-black uppercase mb-6">Team Expenses</h1>
                 <div className="bg-white border-4 border-black">
                    <table className="w-full text-left">
                         <thead className="border-b-4 border-black"><tr className="font-bold uppercase tracking-wider text-sm">
                            <th className="p-4">Employee</th><th className="p-4">Description</th><th className="p-4">Date</th>
                            <th className="p-4">Amount</th><th className="p-4 text-center">Status</th>
                        </tr></thead>
                        <tbody>
                        {teamExpenses.map(exp => (
                            <tr key={exp.id} className="border-b-2 border-black last:border-b-0">
                                <td className="p-4 font-bold">{getEmployeeName(exp.employeeId)}</td>
                                <td className="p-4">{exp.description}</td>
                                <td className="p-4">{exp.expenseDate}</td>
                                <td className="p-4 font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: exp.currency }).format(exp.amount)}</td>
                                <td className="p-4 text-center"><StatusBadge status={exp.status}/></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                     {teamExpenses.length === 0 && <p className="text-center p-8">No expenses submitted by your team.</p>}
                </div>
            </>
        )
        return null;
    }

    return (
        // FIX: Cast the tab string from onTabChange to ManagerTab for the state setter.
        <DashboardLayout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as ManagerTab)}>
            {renderContent()}
        </DashboardLayout>
    );
};

const NewUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreateUser: (newUser: Omit<User, 'id'>) => void; managers: User[]; }> = ({ isOpen, onClose, onCreateUser, managers }) => {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Employee'); const [managerId, setManagerId] = useState<string | undefined>(undefined);
  const handleSubmit = () => {
    if (!name || !email) return;
    onCreateUser({ name, email, role, managerId: role === 'Employee' ? managerId : undefined });
    setName(''); setEmail(''); setRole('Employee'); setManagerId(undefined); onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <div className="space-y-6">
        <AuthInput label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        <AuthInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <div>
          <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Role</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg">
            <option value="Employee">Employee</option><option value="Manager">Manager</option>
          </select>
        </div>
        {role === 'Employee' && (
          <div>
            <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Assign Manager</label>
            <select value={managerId || ''} onChange={e => setManagerId(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg">
              <option value="">Select manager...</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end pt-4 border-t-2 border-black">
          <AuthButton type="button" onClick={handleSubmit} className="!w-auto !py-2.5 px-6 !text-base">Create User</AuthButton>
        </div>
      </div>
    </Modal>
  );
};

const AdminDashboard: React.FC<{ user: User; users: User[]; expenses: Expense[]; onLogout: () => void; onUpdateUsers: (users: User[]) => void; onUpdateExpenses: (expenses: Expense[]) => void; approvalRules: ApprovalRule[]; onUpdateRules: (rules: ApprovalRule[]) => void; }> = ({ user, users, expenses, onLogout, onUpdateUsers, onUpdateExpenses, approvalRules, onUpdateRules }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [rule, setRule] = useState<ApprovalRule>(approvalRules[0] || {} as ApprovalRule);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    
    const handleRuleChange = (field: keyof ApprovalRule, value: any) => setRule(prev => ({...prev, [field]: value}));
    const handleApproverChange = (index: number, isRequired: boolean) => {
        const newApprovers = [...rule.approvers];
        newApprovers[index] = {...newApprovers[index], isRequired};
        handleRuleChange('approvers', newApprovers);
    }
    const handleSaveRule = () => { onUpdateRules([rule]); alert('Approval rule saved!'); }

    const handleUserUpdate = (userId: string, field: 'role' | 'managerId', value: string) => onUpdateUsers(users.map(u => u.id === userId ? { ...u, [field]: value === '' ? undefined : value } : u));
    const handleCreateUser = (newUserData: Omit<User, 'id'>) => {
        const newUser: User = { id: `user-${Date.now()}`, ...newUserData };
        onUpdateUsers([...users, newUser]);
        alert(`User "${newUser.name}" created.`);
    };
    const managers = useMemo(() => users.filter(u => u.role === 'Manager'), [users]);
    const getEmployeeName = useCallback((employeeId: string) => users.find(u => u.id === employeeId)?.name || 'Unknown', [users]);

    const handleOverride = (expenseId: string, newStatus: 'Approved' | 'Rejected') => {
        onUpdateExpenses(expenses.map(exp => {
            if (exp.id === expenseId) {
                return {
                    ...exp,
                    status: newStatus,
                    remarks: `${exp.remarks || ''} (Overridden by Admin on ${new Date().toLocaleDateString()})`
                }
            }
            return exp;
        }))
    }
    
    const renderContent = () => {
        if (activeTab === 'users') return (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-slab text-4xl font-black uppercase">User Management</h1>
                    <button onClick={() => setIsNewUserModalOpen(true)} className="px-4 py-3 bg-orange-500 text-white font-bold border-2 border-black flex items-center gap-2 hover:bg-black transition-colors">
                        <UserPlus size={20} /><span>New User</span>
                    </button>
                </div>
                 <div className="bg-white border-4 border-black">
                    <table className="w-full text-left"><thead className="border-b-4 border-black"><tr className="font-bold uppercase tracking-wider text-sm">
                        <th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Manager</th><th className="p-4">Actions</th>
                    </tr></thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b-2 border-black last:border-b-0">
                            <td className="p-4 font-bold">{u.name}</td><td className="p-4">{u.email}</td>
                            <td className="p-4">
                                <select value={u.role} disabled={u.role === 'Admin'} onChange={e => handleUserUpdate(u.id, 'role', e.target.value)} className="bg-white border-2 border-black p-2 disabled:bg-gray-200 disabled:cursor-not-allowed">
                                    {u.role === 'Admin' && <option value="Admin">Admin</option>}<option value="Manager">Manager</option><option value="Employee">Employee</option>
                                </select>
                            </td>
                            <td className="p-4">
                                {u.role === 'Employee' ? (
                                    <select value={u.managerId || ''} onChange={e => handleUserUpdate(u.id, 'managerId', e.target.value)} className="bg-white border-2 border-black p-2">
                                        <option value="">N/A</option>{managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                ) : '—'}
                            </td>
                            <td className="p-4">
                                <button onClick={() => alert(`Password reset sent to ${u.email}`)} className="bg-white text-black p-2 text-sm font-bold flex items-center gap-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                                    <Send size={16} /><span>Send Password</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody></table>
                </div>
            </>
        );
        if (activeTab === 'rules') return (
             <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-slab text-4xl font-black uppercase">{rule.name}</h1>
                    <button onClick={handleSaveRule} className="px-4 py-3 bg-orange-500 text-white font-bold border-2 border-black flex items-center gap-2 hover:bg-black transition-colors">
                        <Save size={20} /><span>Save Rule</span>
                    </button>
                </div>
                <div className="p-8 bg-white border-4 border-black space-y-8">
                    <div>
                        <AuthInput label="Description about rules" type="text" value={rule.description} onChange={e => handleRuleChange('description', e.target.value)} />
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            {/* Manager selection could be removed if it's always the employee's direct manager */}
                             <label className="text-sm font-bold text-black block mb-1 uppercase tracking-widest">Default Manager (Optional)</label>
                            <select value={rule.managerId} onChange={e => handleRuleChange('managerId', e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-black text-lg">
                                <option value="">None</option>
                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center pb-3">
                            <input type="checkbox" id="managerIsApprover" checked={rule.managerIsApprover} onChange={e => handleRuleChange('managerIsApprover', e.target.checked)} className="h-5 w-5 accent-orange-500"/>
                            <label htmlFor="managerIsApprover" className="ml-2 font-bold">Employee's manager is an approver?</label>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-black block mb-2 uppercase tracking-widest">Additional Approvers</label>
                        <div className="space-y-2 border-2 border-black p-4 bg-gray-100">
                            {rule.approvers.map((approver, index) => (
                                <div key={approver.userId} className="flex items-center justify-between p-2 bg-white border-2 border-black">
                                    <span className="font-bold">{index + 1}. {users.find(u => u.id === approver.userId)?.name}</span>
                                    <div className="flex items-center">
                                        <input type="checkbox" id={`req-${index}`} checked={approver.isRequired} onChange={e => handleApproverChange(index, e.target.checked)} className="h-5 w-5 accent-orange-500"/>
                                        <label htmlFor={`req-${index}`} className="ml-2 font-bold">Required</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-4 pt-4 border-t-2 border-black">
                        <div className="flex items-center">
                            <input type="checkbox" id="isSequential" checked={rule.isSequential} onChange={e => handleRuleChange('isSequential', e.target.checked)} className="h-5 w-5 accent-orange-500"/>
                            <label htmlFor="isSequential" className="ml-2 font-bold">Sequential Approval (approvers must approve in order)</label>
                        </div>
                        <div>
                            <AuthInput label="Minimum Approval percentage (%)" type="number" value={rule.minApprovalPercentage} onChange={e => handleRuleChange('minApprovalPercentage', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                </div>
             </div>
        )
        if (activeTab === 'expenses') return (
             <>
                <h1 className="font-slab text-4xl font-black uppercase mb-6">All Company Expenses</h1>
                 <div className="bg-white border-4 border-black">
                    <table className="w-full text-left">
                         <thead className="border-b-4 border-black"><tr className="font-bold uppercase tracking-wider text-sm">
                            <th className="p-4">Employee</th><th className="p-4">Description</th><th className="p-4">Date</th>
                            <th className="p-4">Amount</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th>
                        </tr></thead>
                        <tbody>
                        {expenses.map(exp => (
                            <tr key={exp.id} className="border-b-2 border-black last:border-b-0">
                                <td className="p-4 font-bold">{getEmployeeName(exp.employeeId)}</td>
                                <td className="p-4">{exp.description}</td>
                                <td className="p-4">{exp.expenseDate}</td>
                                <td className="p-4 font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: exp.currency }).format(exp.amount)}</td>
                                <td className="p-4 text-center"><StatusBadge status={exp.status}/></td>
                                <td className="p-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => handleOverride(exp.id, 'Approved')} className="px-3 py-1 bg-green-200 text-green-900 font-bold border-2 border-green-900 hover:bg-black hover:text-white transition">Approve</button>
                                        <button onClick={() => handleOverride(exp.id, 'Rejected')} className="px-3 py-1 bg-red-200 text-red-900 font-bold border-2 border-red-900 hover:bg-black hover:text-white transition">Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
        return null;
    }
    
    // FIX: Cast the tab string from onTabChange to AdminTab for the state setter.
    return (
        <DashboardLayout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AdminTab)}>
            {renderContent()}
            <NewUserModal isOpen={isNewUserModalOpen} onClose={() => setIsNewUserModalOpen(false)} onCreateUser={handleCreateUser} managers={managers} />
        </DashboardLayout>
    );
};

// 6. MAIN APP COMPONENT
// =================================

const App: React.FC = () => {
    const [users, setUsers] = useState(MOCK_USERS);
    const [expenses, setExpenses] = useState(MOCK_EXPENSES);
    const [approvalRules, setApprovalRules] = useState(MOCK_APPROVAL_RULES);
    const [companyBaseCurrency, setCompanyBaseCurrency] = useState('USD');
    
    const adminExists = useMemo(() => users.some(u => u.role === 'Admin'), [users]);
    const [page, setPage] = useState<Page>(adminExists ? 'login' : 'signup');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email === email);
        // Using a static password for demo purposes
        if (user && password === 'password') { 
            setCurrentUser(user); 
            // If user is an admin, set their page to the users tab by default
            return true; 
        }
        return false;
    };
    
    const handleSignup = (name: string, email: string, pass: string, country: string) => {
        if (adminExists) {
            alert("An admin already exists for this company.");
            return;
        }
        const newAdmin: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            role: 'Admin',
        };
        const baseCurrency = COUNTRIES[country];
        setUsers([newAdmin, ...users]);
        setCompanyBaseCurrency(baseCurrency);
        setCurrentUser(newAdmin); // Auto-login the new admin
        alert(`Welcome, ${name}! Your company is set up with ${baseCurrency} as the base currency.`);
    };
    
    const handleLogout = () => { setCurrentUser(null); setPage('login'); };
    
    if (!currentUser) {
        switch (page) {
            case 'signup': return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setPage('login')} />;
            case 'resetPassword': return <ResetPasswordPage onSwitchToLogin={() => setPage('login')} />;
            case 'login':
            default:
                return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} onNavigateToReset={() => setPage('resetPassword')} adminExists={adminExists} />;
        }
    }
    
    const renderDashboard = () => {
        switch (currentUser.role) {
            case 'Employee': return <EmployeeDashboard user={currentUser} expenses={expenses} users={users} onLogout={handleLogout} onUpdateExpenses={setExpenses} baseCurrency={companyBaseCurrency} approvalRules={approvalRules}/>;
            case 'Manager': return <ManagerDashboard user={currentUser} expenses={expenses} users={users} onLogout={handleLogout} onUpdateExpenses={setExpenses} baseCurrency={companyBaseCurrency} approvalRules={approvalRules}/>;
            case 'Admin': return <AdminDashboard user={currentUser} users={users} expenses={expenses} onLogout={handleLogout} onUpdateUsers={setUsers} onUpdateExpenses={setExpenses} approvalRules={approvalRules} onUpdateRules={setApprovalRules} />;
            default: return <div>Invalid Role</div>;
        }
    };

    return <div className="antialiased">{renderDashboard()}</div>;
};

export default App;