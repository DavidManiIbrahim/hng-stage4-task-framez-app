import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme as NavLight, DarkTheme as NavDark } from '@react-navigation/native';

const ThemeContext = createContext({
  theme: 'light',
  navTheme: NavLight,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [theme, setTheme] = useState(system || 'light');

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const navTheme = useMemo(() => (theme === 'dark' ? NavDark : NavLight), [theme]);

  const value = useMemo(() => ({ theme, navTheme, toggleTheme }), [theme, navTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeContext);

