export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  note?: string;
  category?: string; // Emoji
}

export interface BudgetConfig {
  monthlyLimit: number;
  currencySymbol: string;
  onboardingComplete: boolean;
}

export interface DailyStats {
  date: string;
  spent: number;
  dailyLimit: number; // The calculated limit for this specific day
  isUnderBudget: boolean;
}

export interface AppState {
  transactions: Transaction[];
  config: BudgetConfig;
}

export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}
