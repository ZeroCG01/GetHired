import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage, ThemeMode } from '../types';
import i18n from '../i18n';

interface AppState {
  themeMode: ThemeMode;
  language: AppLanguage;
  currency: string;
  dataVersion: number; // Increment to trigger refetches in screens
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  triggerDataRefresh: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEYS = {
  THEME_MODE: '@jobtrack_theme_mode',
  LANGUAGE: '@jobtrack_language',
  CURRENCY: '@jobtrack_currency',
};

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'dark', // Signature dark mode from jobmetry.app
  language: 'id',
  currency: 'IDR',
  dataVersion: 0,
  isHydrated: false,

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (e) {
      console.warn('Failed to save theme mode to storage', e);
    }
  },

  setLanguage: async (lang: AppLanguage) => {
    set({ language: lang });
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Failed to change and persist language', e);
    }
  },

  setCurrency: async (curr: string) => {
    set({ currency: curr });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    } catch (e) {
      console.warn('Failed to save currency to storage', e);
    }
  },

  triggerDataRefresh: () => {
    set((state) => ({ dataVersion: state.dataVersion + 1 }));
  },

  hydrate: async () => {
    try {
      const [savedTheme, savedLang, savedCurr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY),
      ]);

      const themeMode = (savedTheme as ThemeMode) || 'dark';
      const language = (savedLang as AppLanguage) || 'id';
      const currency = savedCurr || 'IDR';

      await i18n.changeLanguage(language);

      set({
        themeMode,
        language,
        currency,
        isHydrated: true,
      });
    } catch (e) {
      console.warn('Failed to hydrate app store', e);
      set({ isHydrated: true });
    }
  },
}));

