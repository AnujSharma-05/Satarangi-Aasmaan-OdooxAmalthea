import React, { useState, useMemo } from 'react';
import { LogOut, PlusCircle, UploadCloud, UserPlus, Save, Send, X, CheckCircle, Clock, XCircle, Eye, AlertCircle, Info } from 'lucide-react';

// 1. TYPES & INTERFACES
// =================================

type UserRole = 'Admin' | 'Manager' | 'Employee';
type ExpenseStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
type ApproverStatus = 'Pending' | 'Approved' | 'Rejected';

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
}

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  managerIsApprover: boolean;
  approvers: { userId: string; isRequired: boolean }[];
  isSequential: boolean;
  minApprovalPercentage: number;
}

// 2. CONSTANTS & MOCK DATA
// =================================

const COMPANY_BASE_CURRENCY = 'USD';
const CURRENCY_CONVERSION_RATES = {
  USD: 1,
  INR: 83.50,
  EUR: 0.92,
};

const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Admin', email: 'admin@odoo.com', role: 'Admin' },
  { id: 'user-2', name: 'Bob Manager', email: 'manager@odoo.com', role: 'Manager' },
  { id: 'user-3', name: 'Charlie Employee', email: 'employee@odoo.com', role: 'Employee', managerId: 'user-2' },
  { id: 'user-4', name: 'Diana Employee', email: 'employee2@odoo.com', role: 'Employee', managerId: 'user-5' },
  { id: 'user-5', name: 'Sarah Manager', email: 'manager2@odoo.com', role: 'Manager' },
  { id: 'user-6', name: 'John', email: 'john@odoo.com', role: 'Manager' },
  { id: 'user-7', name: 'Mitchell', email: 'mitchell@odoo.com', role: 'Manager' },
  { id: 'user-8', name: 'Andreas', email: 'andreas@odoo.com', role: 'Manager' },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', employeeId: 'user-3', description: 'Team Lunch in Bangalore', category: 'Food', amount: 5000, currency: 'INR', expenseDate: '2024-07-15', paidBy: 'Personal', status: 'Pending Approval', remarks: "Lunch with the new interns.", approvers: [{ userId: 'user-2', status: 'Pending' }] },
  { id: 'exp-2', employeeId: 'user-3', description: 'Client Meeting Travel', category: 'Travel', amount: 150, currency: 'USD', expenseDate: '2024-07-12', paidBy: 'Company Card', status: 'Approved', approvers: [{ userId: 'user-2', status: 'Approved', timestamp: '2024-07-13 10:30 AM' }] },
  { id: 'exp-3', employeeId: 'user-4', description: 'Software Subscription', category: 'Supplies', amount: 75, currency: 'EUR', expenseDate: '2024-07-10', paidBy: 'Company Card', status: 'Rejected', approvers: [{ userId: 'user-5', status: 'Rejected', comment: 'Duplicate subscription.', timestamp: '2024-07-11 02:45 PM' }] },
  { id: 'exp-4', employeeId: 'user-3', description: 'Office Supplies', category: 'Supplies', amount: 80, currency: 'USD', expenseDate: '2024-07-05', paidBy: 'Personal', status: 'Approved', approvers: [{ userId: 'user-2', status: 'Approved', timestamp: '2024-07-06 09:00 AM' }] },
  { id: 'exp-5', employeeId: 'user-4', description: 'Business Trip to Berlin', category: 'Travel', amount: 1200, currency: 'EUR', expenseDate: '2024-07-20', paidBy: 'Personal', status: 'Pending Approval', approvers: [{ userId: 'user-5', status: 'Approved', timestamp: '2024-07-21 11:00 AM' }, { userId: 'user-6', status: 'Pending' }] },
  { id: 'exp-6', employeeId: 'user-3', description: 'Coffee with client', category: 'Food', amount: 25, currency: 'USD', expenseDate: '2024-07-18', paidBy: 'Personal', status: 'Draft', approvers: [] },
  { id: 'exp-7', employeeId: 'user-4', description: 'Keyboard and Mouse', category: 'Supplies', amount: 120, currency: 'USD', expenseDate: '2024-07-19', paidBy: 'Company Card', status: 'Approved', remarks: "Ergonomic set for home office", approvers: [{ userId: 'user-5', status: 'Approved', timestamp: '2024-07-20 03:20 PM' }] },
  { id: 'exp-8', employeeId: 'user-3', description: 'Train ticket', category: 'Travel', amount: 45, currency: 'EUR', expenseDate: '2024-07-21', paidBy: 'Personal', status: 'Pending Approval', approvers: [{ userId: 'user-2', status: 'Pending' }] },
];

const MOCK_APPROVAL_RULES: ApprovalRule[] = [
    {
        id: 'rule-1',
        name: 'Approval rule for miscellaneous expenses',
        description: 'This rule applies to all miscellaneous expenses submitted by employees.',
        managerId: 'user-5',
        managerIsApprover: true,
        approvers: [
            { userId: 'user-6', isRequired: true },
            { userId: 'user-7', isRequired: false },
            { userId: 'user-8', isRequired: false },
        ],
        isSequential: false,
        minApprovalPercentage: 50,
    }
];

const COUNTRIES = {
    "United States": "USD",
    "India": "INR",
    "Germany": "EUR",
    "United Kingdom": "GBP",
};

// 3. REUSABLE UI COMPONENTS
// =================================

const StatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const colorClasses = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Pending Approval': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${colorClasses[status]}`}>{status.replace(' ', '\u00A0')}</span>;
};

const ApproverStatusBadge: React.FC<{ status: ApproverStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5";
  const icons = {
      'Pending': <Clock size={12} />,
      'Approved': <CheckCircle size={12} />,
      'Rejected': <XCircle size={12} />,
  }
  const colorClasses = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${colorClasses[status]}`}>{icons[status]} {status}</span>;
};


const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 4. AUTHENTICATION SCREENS
// =================================

const OdooLogo = () => (
    <div className="text-center mb-8">
        <span className="text-5xl font-bold text-purple-700">odoo</span>
    </div>
);

const AuthCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {children}
    </div>
);

const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, ...props }, ref) => (
    <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">{label}</label>
        <input ref={ref} {...props} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition" />
    </div>
));

const AuthButton: React.FC<{ children: React.ReactNode, onClick?: () => void, type?: "button" | "submit" | "reset" }> = ({ children, onClick, type = "submit" }) => (
    <button type={type} onClick={onClick} className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition duration-200">
        {children}
    </button>
);

const AuthMessage: React.FC<{ type: 'error' | 'info' | 'success'; message: React.ReactNode; }> = ({ type, message }) => {
    const isError = type === 'error';
    const isSuccess = type === 'success';
    const bgColor = isError ? 'bg-red-50' : isSuccess ? 'bg-green-50' : 'bg-blue-50';
    const textColor = isError ? 'text-red-700' : isSuccess ? 'text-green-700' : 'text-blue-700';
    const Icon = isError ? AlertCircle : isSuccess ? CheckCircle : Info;

    return (
        <div className={`p-3 rounded-md flex items-start gap-2 ${bgColor}`}>
            <Icon size={20} className={`mt-0.5 ${textColor}`} />
            <div className={`text-sm ${textColor}`}>{message}</div>
        </div>
    );
};


const LoginPage: React.FC<{ onLogin: (email: string, password: string) => boolean; onSwitchToSignup: () => void; onNavigateToReset: () => void; }> = ({ onLogin, onSwitchToSignup, onNavigateToReset }) => {
  const [email, setEmail] = useState('employee@odoo.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: React.ReactNode } | null>(null);

  const clearMessage = () => setMessage(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();
    const success = onLogin(email, password);
    if (!success) {
      setMessage({ type: 'error', text: 'Invalid email or password. Please try again.' });
    }
  };

  const handleForgotPassword = () => {
      clearMessage();
      setMessage({ type: 'info', text: (
          <span>
              A password reset link has been sent to your email. (Simulation) <br />
              <button onClick={onNavigateToReset} className="font-semibold text-blue-800 hover:underline">Click here to reset your password.</button>
          </span>
      )});
  }
    
  const testAccounts = [
      { role: 'Admin', email: 'admin@odoo.com' },
      { role: 'Manager', email: 'manager@odoo.com' },
      { role: 'Employee', email: 'employee@odoo.com' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <AuthCard>
        <OdooLogo />
        <h2 className="text-2xl font-bold text-center text-gray-800">Login to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput label="Email" type="email" value={email} onChange={(e) => {setEmail(e.target.value); clearMessage();}} required placeholder="employee@odoo.com" />
          <div>
              <AuthInput label="Password" type="password" value={password} onChange={(e) => {setPassword(e.target.value); clearMessage();}} required placeholder="password" />
              <div className="text-right mt-1">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-purple-600 hover:underline">Forgot password?</button>
              </div>
          </div>
          {message && <AuthMessage type={message.type} message={message.text} />}
          <AuthButton>Login</AuthButton>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <button onClick={onSwitchToSignup} className="font-medium text-purple-600 hover:underline">Sign up</button>
        </p>
        <div className="mt-6 border-t pt-4">
            <h3 className="text-center text-sm font-semibold text-gray-600 mb-2">Quick Access Test Accounts</h3>
            <div className="space-y-2 text-xs text-center text-gray-500">
                {testAccounts.map(acc => (
                    <div key={acc.role}>
                        <strong>{acc.role}:</strong> <button onClick={() => {setEmail(acc.email); clearMessage();}} className="font-mono text-purple-600 hover:underline">{acc.email}</button>
                    </div>
                ))}
                 <div>(Password: <span className="font-mono">password</span>)</div>
            </div>
        </div>
      </AuthCard>
    </div>
  );
};

const SignupPage: React.FC<{ onSignup: () => void; onSwitchToLogin: () => void; }> = ({ onSignup, onSwitchToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthCard>
        <OdooLogo />
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an account</h2>
        <form className="space-y-4" onSubmit={e => {e.preventDefault(); onSignup();}}>
          <AuthInput label="Name" type="text" required placeholder="John Doe"/>
          <AuthInput label="Email" type="email" required placeholder="john.doe@example.com"/>
          <AuthInput label="Password" type="password" required />
          <AuthInput label="Confirm Password" type="password" required />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Country Selection</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition">
              {Object.keys(COUNTRIES).map(country => <option key={country} value={country}>{country}</option>)}
            </select>
          </div>
          <AuthButton>Signup</AuthButton>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <button onClick={onSwitchToLogin} className="font-medium text-purple-600 hover:underline">Log in</button>
        </p>
      </AuthCard>
    </div>
  );
};

const ResetPasswordPage: React.FC<{ onPasswordReset: () => void; onSwitchToLogin: () => void; }> = ({ onPasswordReset, onSwitchToLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setMessage({ type: 'success', text: 'Your password has been reset successfully! You will be redirected to login.' });
        setTimeout(() => {
            onPasswordReset();
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthCard>
                <OdooLogo />
                <h2 className="text-2xl font-bold text-center text-gray-800">Reset Your Password</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <AuthInput label="New Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <AuthInput label="Confirm New Password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    {message && <AuthMessage type={message.type} message={message.text} />}
                    <AuthButton>Reset Password</AuthButton>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Remember your password? <button onClick={onSwitchToLogin} className="font-medium text-purple-600 hover:underline">Log in</button>
                </p>
            </AuthCard>
        </div>
    );
};


// 5. DASHBOARD COMPONENTS
// =================================

const DashboardHeader: React.FC<{ title: string; onLogout: () => void; }> = ({ title, onLogout }) => (
  <header className="bg-white shadow-sm p-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <button onClick={onLogout} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition">
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  </header>
);

const ExpenseFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (expense: Omit<Expense, 'id' | 'approvers'>) => void; employeeId: string; expenseToEdit?: Expense | null; }> = ({ isOpen, onClose, onSave, employeeId, expenseToEdit }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidBy, setPaidBy] = useState('Personal');
    const [remarks, setRemarks] = useState('');

    React.useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            setCategory(expenseToEdit.category);
            setAmount(String(expenseToEdit.amount));
            setCurrency(expenseToEdit.currency);
            setExpenseDate(expenseToEdit.expenseDate);
            setPaidBy(expenseToEdit.paidBy);
            setRemarks(expenseToEdit.remarks || '');
        } else {
            // Reset form for new expense
            setDescription(''); setCategory('Food'); setAmount(''); setCurrency('USD');
            setExpenseDate(new Date().toISOString().split('T')[0]); setPaidBy('Personal'); setRemarks('');
        }
    }, [expenseToEdit, isOpen]);

    const handleSubmit = () => {
        const expenseData = {
            employeeId,
            description,
            category,
            amount: parseFloat(amount) || 0,
            currency,
            expenseDate,
            paidBy,
            remarks,
            status: 'Pending Approval' as ExpenseStatus,
            receiptUrl: expenseToEdit?.receiptUrl,
        };
        onSave(expenseData);
        onClose();
    };
    
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Edit Expense" : "New Expense"}>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
            <UploadCloud className="text-blue-500 mt-1" size={24}/>
            <div>
                <h4 className="font-semibold text-blue-800">Auto-fill with a receipt</h4>
                <p className="text-sm text-blue-600">Attach a receipt and our OCR can auto-fill the details for you!</p>
                <button className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Attach Receipt</button>
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Supplies</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <div className="flex">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-l-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 block border-gray-300 rounded-r-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50">
                        {Object.keys(CURRENCY_CONVERSION_RATES).map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Expense Date</label>
                <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Paid By</label>
                <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                    <option>Personal</option>
                    <option>Company Card</option>
                </select>
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Submit</button>
        </div>
      </div>
    </Modal>
  );
};

const ExpenseDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; expense: Expense | null; users: User[] }> = ({ isOpen, onClose, expense, users }) => {
    if (!expense) return null;

    const getApproverName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
    
    const InfoField: React.FC<{label: string, value: React.ReactNode}> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md text-gray-800">{value}</p>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Expense Details">
            <div className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-gray-800">{expense.description}</h4>
                        <StatusBadge status={expense.status} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoField label="Amount" value={`${new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency }).format(expense.amount)}`} />
                        <InfoField label="Category" value={expense.category} />
                        <InfoField label="Expense Date" value={expense.expenseDate} />
                        <InfoField label="Paid By" value={expense.paidBy} />
                    </div>
                    {expense.remarks && <InfoField label="Remarks" value={expense.remarks} />}
                </div>

                <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Approval History</h5>
                    <div className="border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Approver</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expense.approvers.map((approver, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-2">{getApproverName(approver.userId)}</td>
                                        <td className="px-4 py-2"><ApproverStatusBadge status={approver.status} /></td>
                                        <td className="px-4 py-2 text-gray-500">{approver.timestamp || 'N/A'}</td>
                                    </tr>
                                ))}
                                {expense.approvers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-gray-500">No approval history yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
                </div>
            </div>
        </Modal>
    );
};


const SummaryCard: React.FC<{ title: string; amount: number; currency: string; }> = ({ title, amount, currency }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex-1 text-center md:text-left">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
        </p>
    </div>
);

const EmployeeDashboard: React.FC<{ user: User; expenses: Expense[]; users: User[]; onLogout: () => void; onUpdateExpenses: (expenses: Expense[]) => void; }> = ({ user, expenses, users, onLogout, onUpdateExpenses }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const userExpenses = useMemo(() => expenses.filter(e => e.employeeId === user.id), [expenses, user.id]);

  const summary = useMemo(() => {
    const totals = { draft: 0, pending: 0, approved: 0 };
    userExpenses.forEach(exp => {
        const rate = CURRENCY_CONVERSION_RATES[exp.currency as keyof typeof CURRENCY_CONVERSION_RATES] || 1;
        const amountInBase = exp.amount / rate;
        if (exp.status === 'Draft') totals.draft += amountInBase;
        else if (exp.status === 'Pending Approval') totals.pending += amountInBase;
        else if (exp.status === 'Approved') totals.approved += amountInBase;
    });
    return totals;
  }, [userExpenses]);

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'approvers'>) => {
    const managerId = MOCK_USERS.find(u => u.id === expenseData.employeeId)?.managerId;
    const approvers: ApproverAction[] = managerId ? [{ userId: managerId, status: 'Pending' }] : [];
    
    if (selectedExpense) { // Editing existing expense
        const updatedExpenses = expenses.map(e => e.id === selectedExpense.id ? {...e, ...expenseData, approvers} : e);
        onUpdateExpenses(updatedExpenses);
    } else { // Creating new expense
        const newExpense: Expense = {
            ...expenseData,
            id: `exp-${Date.now()}`,
            approvers,
        };
        onUpdateExpenses([...expenses, newExpense]);
    }
  };
  
  const handleRowClick = (expense: Expense) => {
      setSelectedExpense(expense);
      if (expense.status === 'Draft') {
          setIsFormModalOpen(true);
      } else {
          setIsDetailsModalOpen(true);
      }
  };
  
  const handleNewExpenseClick = () => {
      setSelectedExpense(null);
      setIsFormModalOpen(true);
  }

  const getStatusBadge = (status: ExpenseStatus) => {
    if (status === 'Pending Approval') {
        return <span className="px-3 py-1 text-xs font-medium rounded-full inline-block bg-green-100 text-green-800">Submitted</span>;
    }
    return <StatusBadge status={status} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Employee Dashboard" onLogout={onLogout} />
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard title="To submit" amount={summary.draft} currency={COMPANY_BASE_CURRENCY} />
            <SummaryCard title="Waiting approval" amount={summary.pending} currency={COMPANY_BASE_CURRENCY} />
            <SummaryCard title="Approved" amount={summary.approved} currency={COMPANY_BASE_CURRENCY} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">My Expenses</h2>
          <div className="flex items-center gap-2">
              <button onClick={handleNewExpenseClick} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                <UploadCloud size={20} />
                <span>Upload</span>
              </button>
              <button onClick={handleNewExpenseClick} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                <PlusCircle size={20} />
                <span>New</span>
              </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Employee</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Paid By</th>
                <th scope="col" className="px-6 py-3">Remarks</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {userExpenses.map(exp => (
                <tr key={exp.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(exp)}>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4">{exp.description}</td>
                  <td className="px-6 py-4">{exp.expenseDate}</td>
                  <td className="px-6 py-4">{exp.category}</td>
                  <td className="px-6 py-4">{exp.paidBy}</td>
                  <td className="px-6 py-4">{exp.remarks || 'None'}</td>
                  <td className="px-6 py-4">{new Intl.NumberFormat('en-US', { style: 'currency', currency: exp.currency }).format(exp.amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(exp.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {userExpenses.length === 0 && <p className="text-center text-gray-500 mt-8">You have not submitted any expenses yet.</p>}
      </main>
      <ExpenseFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveExpense} employeeId={user.id} expenseToEdit={selectedExpense} />
      <ExpenseDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} expense={selectedExpense} users={users} />
    </div>
  );
};

const ManagerDashboard: React.FC<{ user: User; expenses: Expense[]; users: User[]; onLogout: () => void; onUpdateExpenses: (expenses: Expense[]) => void; }> = ({ user, expenses, users, onLogout, onUpdateExpenses }) => {
    const managedExpenses = useMemo(() => expenses.filter(exp => 
        exp.approvers.some(a => a.userId === user.id)
    ), [expenses, user.id]);
    
    const handleApproval = (expenseId: string, newStatus: ApproverStatus) => {
        const updatedExpenses = expenses.map(exp => {
            if (exp.id === expenseId) {
                const updatedApprovers = exp.approvers.map(a =>
                    a.userId === user.id ? { ...a, status: newStatus, timestamp: new Date().toLocaleString() } : a
                );
                
                const isRejected = updatedApprovers.some(a => a.status === 'Rejected');
                const allApproved = updatedApprovers.every(a => a.status === 'Approved');
                const finalStatus: ExpenseStatus = isRejected ? 'Rejected' : (allApproved ? 'Approved' : 'Pending Approval');

                return { ...exp, approvers: updatedApprovers, status: finalStatus };
            }
            return exp;
        });
        onUpdateExpenses(updatedExpenses);
    };

    const getEmployeeName = (employeeId: string) => users.find(u => u.id === employeeId)?.name || 'Unknown';

    const formatConvertedAmount = (amount: number, currency: string) => {
        if (currency === COMPANY_BASE_CURRENCY) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: COMPANY_BASE_CURRENCY }).format(amount);
        }
        const rate = CURRENCY_CONVERSION_RATES[currency as keyof typeof CURRENCY_CONVERSION_RATES] || 1;
        const convertedAmount = amount / rate;
        const originalAmountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
        return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: COMPANY_BASE_CURRENCY }).format(convertedAmount)} (${originalAmountFormatted})`;
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="Manager Dashboard" onLogout={onLogout} />
            <main className="p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">Approvals to Review</h2>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Approval Subject</th>
                            <th scope="col" className="px-6 py-3">Request Owner</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Request Status</th>
                            <th scope="col" className="px-6 py-3">Total Amount</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {managedExpenses.map(exp => {
                            const managerApproval = exp.approvers.find(a => a.userId === user.id);
                            return (
                                <tr key={exp.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{exp.description}</td>
                                <td className="px-6 py-4">{getEmployeeName(exp.employeeId)}</td>
                                <td className="px-6 py-4">{exp.category}</td>
                                <td className="px-6 py-4">
                                    {managerApproval && <ApproverStatusBadge status={managerApproval.status} />}
                                </td>
                                <td className="px-6 py-4">{formatConvertedAmount(exp.amount, exp.currency)}</td>
                                <td className="px-6 py-4">
                                    {managerApproval?.status === 'Pending' ? (
                                        <div className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleApproval(exp.id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold">Approve</button>
                                            <button onClick={() => handleApproval(exp.id, 'Rejected')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">Reject</button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 text-xs italic">Completed</div>
                                    )}
                                </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
                 {managedExpenses.length === 0 && <p className="text-center text-gray-500 mt-8">No expenses are currently assigned to you.</p>}
            </main>
        </div>
    );
};

const NewUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreateUser: (newUser: Omit<User, 'id'>) => void; managers: User[]; }> = ({ isOpen, onClose, onCreateUser, managers }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [managerId, setManagerId] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (!name || !email) {
      alert("Name and Email are required.");
      return;
    }
    onCreateUser({
      name,
      email,
      role,
      managerId: role === 'Employee' ? managerId : undefined,
    });
    // Reset form and close
    setName('');
    setEmail('');
    setRole('Employee');
    setManagerId(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        {role === 'Employee' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Manager</label>
            <select value={managerId || ''} onChange={e => setManagerId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
              <option value="">Select a manager...</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Create User</button>
        </div>
      </div>
    </Modal>
  );
};


const AdminDashboard: React.FC<{ user: User; users: User[]; onLogout: () => void; onUpdateUsers: (users: User[]) => void; approvalRules: ApprovalRule[]; onUpdateRules: (rules: ApprovalRule[]) => void; }> = ({ user, users, onLogout, onUpdateUsers, approvalRules, onUpdateRules }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [rule, setRule] = useState(approvalRules[0]);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

    const handleRuleChange = <K extends keyof ApprovalRule>(key: K, value: ApprovalRule[K]) => {
        setRule(prev => ({...prev, [key]: value}));
    };
    
    const handleUserUpdate = (userId: string, field: 'role' | 'managerId', value: string) => {
        const updatedUsers = users.map(u => 
            u.id === userId ? { ...u, [field]: value } : u
        );
        onUpdateUsers(updatedUsers);
    };

    const handleCreateUser = (newUserData: Omit<User, 'id'>) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...newUserData,
        };
        onUpdateUsers([...users, newUser]);
        alert(`User "${newUser.name}" created successfully. A temporary password has been sent to ${newUser.email}.`);
    };

    const handleSaveRule = () => {
        onUpdateRules([rule]);
        alert("Approval rule saved successfully!");
    };
    
    const managers = useMemo(() => users.filter(u => u.role === 'Manager'), [users]);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="Admin Dashboard" onLogout={onLogout} />
            <main className="p-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Users
                        </button>
                        <button onClick={() => setActiveTab('rules')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'rules' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Approval Rules
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-700">Manage Users</h2>
                                <button onClick={() => setIsNewUserModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                                <UserPlus size={20} />
                                <span>New User</span>
                                </button>
                            </div>
                            <div className="bg-white rounded-lg shadow overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Manager</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                    <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{u.name}</td>
                                        <td className="px-6 py-4">
                                            <select value={u.role} onChange={e => handleUserUpdate(u.id, 'role', e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-1.5">
                                                <option value="Admin">Admin</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Employee">Employee</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'Employee' && (
                                                <select value={u.managerId || ''} onChange={e => handleUserUpdate(u.id, 'managerId', e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-1.5">
                                                    <option value="">N/A</option>
                                                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4"><button onClick={() => alert(`A new password has been sent to ${u.email}.`)} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Send size={12}/> Send password</button></td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'rules' && (
                        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{rule.name}</h2>
                            
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description about rules</label>
                                    <input type="text" value={rule.description} onChange={e => handleRuleChange('description', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                                <div>
                                    <div className="flex items-end gap-6">
                                        <div className="flex-1">
                                            <label htmlFor="manager-select" className="block text-sm font-medium text-gray-700">Manager</label>
                                            <select id="manager-select" value={rule.managerId} onChange={e => handleRuleChange('managerId', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center pb-1">
                                            <input id="manager-approver" type="checkbox" checked={rule.managerIsApprover} onChange={e => handleRuleChange('managerIsApprover', e.target.checked)} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                                            <label htmlFor="manager-approver" className="ml-2 block text-sm text-gray-900">Is manager an approver?</label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">If this field is checked then by default the approve request would go to his/her manager first, before going to other approvers.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Approvers</label>
                                    <div className="space-y-3">
                                        {rule.approvers.map((approver, index) => (
                                            <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                                                <span className="text-gray-500 font-mono text-sm">{index + 1}</span>
                                                <select className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" value={approver.userId} onChange={e => {
                                                    const newApprovers = [...rule.approvers];
                                                    newApprovers[index].userId = e.target.value;
                                                    handleRuleChange('approvers', newApprovers);
                                                }}>
                                                    {users.filter(u => u.role === 'Manager').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                                <div className="flex items-center">
                                                    <input id={`required-${index}`} type="checkbox" checked={approver.isRequired} onChange={e => {
                                                        const newApprovers = [...rule.approvers];
                                                        newApprovers[index].isRequired = e.target.checked;
                                                        handleRuleChange('approvers', newApprovers);
                                                    }} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                                                    <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">Required</label>
                                                </div>
                                            </div>
                                        ))}
                                        <p className="text-xs text-gray-500 pl-8">If "Required" is ticked, then anyhow approval of this approver is required in any approval combination scenarios.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="sequential-approval" type="checkbox" checked={rule.isSequential} onChange={e => handleRuleChange('isSequential', e.target.checked)} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="sequential-approval" className="font-medium text-gray-700">Approvers Sequence</label>
                                            <p className="text-gray-500 text-xs">If this field is ticked then the above mentioned sequence of approvers matters, that is first the request goes to John, if he approves/rejects then only request goes to mitchell and so on. If the required approver rejects the request, then expense request is auto-rejected. If not ticked then send approver request to all approvers at the same time.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="min-approval" className="block text-sm font-medium text-gray-700">Minimum Approval percentage</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <input type="number" id="min-approval" value={rule.minApprovalPercentage} onChange={e => handleRuleChange('minApprovalPercentage', parseInt(e.target.value))} className="focus:ring-purple-500 focus:border-purple-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="50" />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">%</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Specify the number of percentage approvers required in order to get the request approved.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleSaveRule} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                                    <Save size={20} />
                                    <span>Save Rule</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <NewUserModal
                isOpen={isNewUserModalOpen}
                onClose={() => setIsNewUserModalOpen(false)}
                onCreateUser={handleCreateUser}
                managers={managers}
            />
        </div>
    );
};

// 6. MAIN APP COMPONENT
// =================================

const App: React.FC = () => {
    const [page, setPage] = useState<'login' | 'signup' | 'resetPassword'>('login');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState(MOCK_USERS);
    const [expenses, setExpenses] = useState(MOCK_EXPENSES);
    const [approvalRules, setApprovalRules] = useState(MOCK_APPROVAL_RULES);
    
    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email === email);
        // For mock purposes, any user exists and password is 'password'
        if (user && password === 'password') {
            setCurrentUser(user);
            return true;
        }
        return false;
    };
    
    const handleSignup = () => {
        alert('Signup successful! Logging you in as the default admin.');
        setCurrentUser(users.find(u => u.role === 'Admin')!);
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setPage('login');
    };
    
    if (!currentUser) {
        switch (page) {
            case 'login':
                return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} onNavigateToReset={() => setPage('resetPassword')} />;
            case 'signup':
                return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setPage('login')} />;
            case 'resetPassword':
                return <ResetPasswordPage onPasswordReset={() => setPage('login')} onSwitchToLogin={() => setPage('login')} />;
            default:
                return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} onNavigateToReset={() => setPage('resetPassword')} />;
        }
    }
    
    const renderDashboard = () => {
        switch (currentUser.role) {
            case 'Employee':
                return <EmployeeDashboard user={currentUser} expenses={expenses} users={users} onLogout={handleLogout} onUpdateExpenses={setExpenses} />;
            case 'Manager':
                return <ManagerDashboard user={currentUser} expenses={expenses} users={users} onLogout={handleLogout} onUpdateExpenses={setExpenses} />;
            case 'Admin':
                return <AdminDashboard user={currentUser} users={users} onLogout={handleLogout} onUpdateUsers={setUsers} approvalRules={approvalRules} onUpdateRules={setApprovalRules} />;
            default:
                return <div>Invalid Role</div>;
        }
    };

    return <div className="antialiased">{renderDashboard()}</div>;
};

export default App;
