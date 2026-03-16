import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "dim";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("capitalops-theme") as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("dim");
    } else if (theme === "dim") {
      root.classList.add("dim");
      root.classList.remove("dark");
    } else {
      root.classList.remove("dark");
      root.classList.remove("dim");
    }
    localStorage.setItem("capitalops-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("dim");
    } else if (theme === "dim") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
