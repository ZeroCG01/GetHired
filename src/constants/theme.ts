import { Platform } from 'react-native';
import { StatusColorKey } from '../types';

export const ThemeColors = {
  dark: {
    background: '#070B12', // Rich Obsidian Navy
    surface: '#0F1623', // Deep Slate Surface
    surfaceElevated: '#162032', // Elevated Slate (Modal/Sheet)
    surfaceHighlight: '#1E293B', // Slate 800 (Press effect)
    border: '#1E293B', // Subtle Slate Border
    borderFocus: '#22D3EE', // Cyan 400
    textPrimary: '#F8FAFC', // Crisp White
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    accent: '#22D3EE', // Cyan / Electric Teal
    accentSoft: 'rgba(34, 211, 238, 0.14)',
    primaryButtonBg: '#F8FAFC', // White Pill CTA
    primaryButtonText: '#070B12', // Dark Text on White Pill
    danger: '#F87171', // Red 400
    dangerSoft: 'rgba(248, 113, 113, 0.15)',
    success: '#34D399',
    successSoft: 'rgba(52, 211, 153, 0.15)',
    cardGlow: 'rgba(34, 211, 238, 0.05)',
    // Backwards compatibility with Expo template
    text: '#F8FAFC',
    backgroundElement: '#162032',
    backgroundSelected: '#1E293B',
  },
  light: {
    background: '#F8FAFC', // Cool Alabaster / Slate 50
    surface: '#FFFFFF', // Pure White
    surfaceElevated: '#F1F5F9', // Slate 100
    surfaceHighlight: '#E2E8F0', // Slate 200
    border: '#E2E8F0', // Light Slate Border
    borderFocus: '#0891B2', // Cyan 600
    textPrimary: '#0F172A', // Deep Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    accent: '#0891B2', // Deep Cyan / Teal 600
    accentSoft: 'rgba(8, 145, 178, 0.10)',
    primaryButtonBg: '#0F172A', // Dark Slate Pill
    primaryButtonText: '#FFFFFF', // White Text
    danger: '#DC2626', // Red 600
    dangerSoft: 'rgba(220, 38, 38, 0.10)',
    success: '#059669',
    successSoft: 'rgba(5, 150, 105, 0.10)',
    cardGlow: 'transparent',
    // Backwards compatibility with Expo template
    text: '#0F172A',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
  },
} as const;

export const Colors = ThemeColors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export interface BadgeColorStyle {
  text: string;
  bg: string;
  border: string;
}

export const StatusColorPresets: Record<
  StatusColorKey,
  {
    name: string;
    dark: BadgeColorStyle;
    light: BadgeColorStyle;
  }
> = {
  cyan: {
    name: 'Cyan',
    dark: {
      text: '#22D3EE',
      bg: 'rgba(34, 211, 238, 0.18)',
      border: 'rgba(34, 211, 238, 0.35)',
    },
    light: {
      text: '#0891B2',
      bg: '#ECFEFF',
      border: 'rgba(8, 145, 178, 0.30)',
    },
  },
  blue: {
    name: 'Blue',
    dark: {
      text: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.16)',
      border: 'rgba(56, 189, 248, 0.30)',
    },
    light: {
      text: '#0284C7',
      bg: '#F0F9FF',
      border: 'rgba(2, 132, 199, 0.30)',
    },
  },
  purple: {
    name: 'Purple',
    dark: {
      text: '#C084FC',
      bg: 'rgba(192, 132, 252, 0.18)',
      border: 'rgba(192, 132, 252, 0.30)',
    },
    light: {
      text: '#7E22CE',
      bg: '#FAF5FF',
      border: 'rgba(126, 34, 206, 0.30)',
    },
  },
  indigo: {
    name: 'Indigo',
    dark: {
      text: '#818CF8',
      bg: 'rgba(129, 140, 248, 0.18)',
      border: 'rgba(129, 140, 248, 0.30)',
    },
    light: {
      text: '#4338CA',
      bg: '#EEF2FF',
      border: 'rgba(67, 56, 202, 0.30)',
    },
  },
  emerald: {
    name: 'Emerald',
    dark: {
      text: '#34D399',
      bg: 'rgba(52, 211, 153, 0.18)',
      border: 'rgba(52, 211, 153, 0.30)',
    },
    light: {
      text: '#047857',
      bg: '#ECFDF5',
      border: 'rgba(4, 120, 87, 0.30)',
    },
  },
  amber: {
    name: 'Amber',
    dark: {
      text: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.16)',
      border: 'rgba(251, 191, 36, 0.30)',
    },
    light: {
      text: '#B45309',
      bg: '#FFFBEB',
      border: 'rgba(180, 83, 9, 0.30)',
    },
  },
  orange: {
    name: 'Orange',
    dark: {
      text: '#FB923C',
      bg: 'rgba(251, 146, 60, 0.16)',
      border: 'rgba(251, 146, 60, 0.30)',
    },
    light: {
      text: '#C2410C',
      bg: '#FFF7ED',
      border: 'rgba(194, 65, 12, 0.30)',
    },
  },
  rose: {
    name: 'Rose',
    dark: {
      text: '#F87171',
      bg: 'rgba(248, 113, 113, 0.18)',
      border: 'rgba(248, 113, 113, 0.30)',
    },
    light: {
      text: '#B91C1C',
      bg: '#FEF2F2',
      border: 'rgba(185, 28, 28, 0.30)',
    },
  },
  slate: {
    name: 'Slate',
    dark: {
      text: '#94A3B8',
      bg: 'rgba(100, 116, 139, 0.16)',
      border: 'rgba(100, 116, 139, 0.30)',
    },
    light: {
      text: '#475569',
      bg: '#F1F5F9',
      border: 'rgba(71, 85, 105, 0.25)',
    },
  },
};
