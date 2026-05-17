import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

export type ThemeColors = {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  sectionHeader: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  success: string;
  red: string;
  amber: string;
  green: string;
  blue: string;
  purple: string;
  pink: string;
  white: string;
  tabBar: string;
  tabActive: string;
  overlay: string;
};

export const darkColors: ThemeColors = {
  bg: '#0A0A0A',
  card: '#161618',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  sectionHeader: '#8B8578',
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  success: '#10B981',
  red: '#EF4444',
  amber: '#FBBF24',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  white: '#FFFFFF',
  tabBar: '#0D0D0D',
  tabActive: 'rgba(245,158,11,0.12)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const lightColors: ThemeColors = {
  bg: '#F5F5F7',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.08)',
  text: '#1C1C1E',
  textSecondary: '#6B6B6F',
  sectionHeader: '#8B8578',
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  success: '#10B981',
  red: '#EF4444',
  amber: '#FBBF24',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  white: '#1C1C1E',
  tabBar: '#FFFFFF',
  tabActive: 'rgba(245,158,11,0.12)',
  overlay: 'rgba(0,0,0,0.3)',
};

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: darkColors,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    getSettings().then((s) => setIsDark(s.darkMode));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    saveSettings({ darkMode: next });
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
