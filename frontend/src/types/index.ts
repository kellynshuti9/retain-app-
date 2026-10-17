// ============ USER & AUTH ============
export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  adminKey?: string;
}

// ============ CATEGORY ============
export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============ EXPENSE ============
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile';

export interface Expense {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseDto {
  title: string;
  amount: number;
  category: string;
  date?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: Pagination;
}

// ============ BUDGET ============
export type BudgetStatus = 'within' | 'approaching' | 'over' | 'no_budget';

export interface Budget {
  _id: string;
  userId: string;
  month: string;
  amount: number;
}

export interface BudgetStatusResponse {
  month: string;
  budget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
}

// ============ ADMIN ============
export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  monthlyExpensesCount: number;
  spendingByCategory: { name: string; total: number; count: number }[];
  topCategories: { name: string; total: number; count: number }[];
  bottomCategories: { name: string; total: number; count: number }[];
  recentExpenses: Expense[];
  recentUsers: (Pick<User, 'name' | 'email' | 'role'> & { createdAt: string })[];
}

// ============ FILTERS (Redux) ============
export type SortBy = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface FiltersState {
  search: string;
  category: string;
  paymentMethod: string;
  from: string;
  to: string;
  sortBy: SortBy;
  order: SortOrder;
  page: number;
  limit: number;
}