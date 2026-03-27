/**
 * ThemeProvider Component
 * 
 * Purpose:
 * Provides React context for managing application-wide light/dark theme state.
 * Persists user preference to localStorage and applies theme class to document root.
 * 
 * Approach:
 * - Uses React Context for global theme state distribution
 * - Stores preference in localStorage under 'capitalops-theme' key
 * - Defaults to 'dark' theme for capitalops branding
 * - Applies 'dark' class to <html> element (Tailwind CSS dark mode pattern)
 * - Also removes 'dim' class (capitalops-specific extra dark variant)
 * 
 * Security Considerations:
 * - No security implications; purely presentational state
 * - localStorage is client-side only and not sensitive
 * - Theme switching is a user preference with no auth requirements
 * 
 * Usage:
 * Wrap your app root with:
 * <ThemeProvider>{children}</ThemeProvider>
 * 
 * Access theme in components via:
 * const { theme, toggleTheme, setTheme } = useTheme();
 */

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Theme type representing available theme options.
 * Currently supports light and dark modes.
 */
type Theme = "light" | "dark";

/**
 * ThemeContext shape for theme state and mutation functions.
 * @interface ThemeContextType
 * @property theme - Current active theme ('light' or 'dark')
 * @property toggleTheme - Convenience function to flip between themes
 * @property setTheme - Function to explicitly set a specific theme
 */
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

/**
 * ThemeProvider wraps the application and supplies theme context.
 * 
 * Initialization:
 * - Reads stored preference from localStorage on mount
 * - Falls back to 'dark' theme if no preference or invalid value
 * 
 * Side Effects:
 * - Updates document.documentElement className when theme changes
 * - Persists preference to localStorage on every theme change
 * 
 * @param children - Child React nodes to render within provider
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage; SSR-safe with window check
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      // localStorage key: 'capitalops-theme'
      // Falls back to 'dark' if not set or invalid
      return (localStorage.getItem("capitalops-theme") as Theme) || "dark";
    }
    return "dark";
  });

  /**
   * Effect: Sync theme to DOM and localStorage.
   * 
   * Tailwind dark mode pattern: Add 'dark' class to <html> to enable dark styles.
   * Also removes 'dim' class (capitalops-specific variant for extra darkness).
   * 
   * Runs on every theme change; cleanup not needed as this is idempotent.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("dim");
    } else {
      root.classList.remove("dark");
      root.classList.remove("dim");
    }
    // Persist to localStorage for session restoration
    localStorage.setItem("capitalops-theme", theme);
  }, [theme]);

  /**
   * Toggle handler: switches between light and dark themes.
   * Provided as convenience for simple toggle buttons.
   */
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    // ThemeContext.Provider distributes theme state and mutation functions
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context in functional components.
 * 
 * Usage:
 * const { theme, toggleTheme, setTheme } = useTheme();
 * 
 * Must be called within a ThemeProvider subtree.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
