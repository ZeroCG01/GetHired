import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ThemeColors } from '../constants/theme';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);

  const resolvedTheme: 'dark' | 'light' =
    themeMode === 'system' ? (systemColorScheme === 'light' ? 'light' : 'dark') : themeMode;

  const colors = ThemeColors[resolvedTheme];
  const isDark = resolvedTheme === 'dark';

  return {
    themeMode,
    resolvedTheme,
    isDark,
    colors,
  };
}

