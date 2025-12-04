import { AppState, Transaction, BudgetConfig } from '../types';

const STORAGE_KEY = 'lume_app_data_v1';

const DEFAULT_STATE: AppState = {
  transactions: [],
  config: {
    monthlyLimit: 0,
    currencySymbol: '$',
    onboardingComplete: false,
  },
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return DEFAULT_STATE;
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load state", e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
