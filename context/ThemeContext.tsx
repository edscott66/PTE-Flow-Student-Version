import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  secondary: string;
  danger: string;
  success: string;
  warning: string;
  card: string;
}

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  secondary: '#64748B',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  card: '#FFFFFF',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  subtext: '#94A3B8',
  border: '#334155',
  primary: '#3B82F6',
  secondary: '#94A3B8',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  card: '#1E293B',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((savedTheme) => {
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('app_theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
