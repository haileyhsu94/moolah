export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  timestamp: number;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  expense?: Expense;
}

export interface ChatbotSettings {
  name: string;
  avatar: string;
  personality: 'sarcastic' | 'encouraging' | 'neutral';
  customTags: string[];
  userName: string;
  language: 'en' | 'ja' | 'zh' | 'bilingual';
  currency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  exchangeRate: number;
}

export interface ExpenseReport {
  period: 'daily' | 'weekly' | 'monthly' | 'annual';
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
  expenseCount: number;
  averageExpense: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  tagBreakdown?: Record<string, number>;
  topTags?: Array<{ tag: string; amount: number; percentage: number }>;
}

export interface EditableExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export interface Language {
  code: 'en' | 'ja' | 'zh' | 'bilingual';
  name: string;
  flag: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}