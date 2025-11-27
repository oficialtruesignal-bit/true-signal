import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Always force dark mode - remove any light class and add dark
    root.classList.remove('light');
    if (!root.classList.contains('dark')) {
      root.classList.add('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, actualTheme: 'dark' }}>
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
