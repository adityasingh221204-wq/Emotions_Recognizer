'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'steam' | 'roman' | 'mars' | 'default';

interface ThemeContextType {
  theme: ThemeName;
  setThemeByEra: (era: string, prompt: string) => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default');

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-steam', 'theme-roman', 'theme-mars', 'theme-default');
      root.classList.add(`theme-${newTheme}`);
    }
  };

  const setThemeByEra = (era: string, prompt: string) => {
    const combined = `${era} ${prompt}`.toLowerCase();
    if (combined.includes('rome') || combined.includes('roman') || combined.includes('antiquity') || combined.includes('caesar')) {
      setTheme('roman');
    } else if (combined.includes('mars') || combined.includes('space') || combined.includes('martian') || combined.includes('rocket')) {
      setTheme('mars');
    } else if (combined.includes('steam') || combined.includes('victorian') || combined.includes('babbage') || combined.includes('1890') || combined.includes('industrial')) {
      setTheme('steam');
    } else {
      setTheme('default'); // Modern cyberpunk/history fallback
    }
  };

  // Sync initial theme class on mount
  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setThemeByEra, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
