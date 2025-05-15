"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, memo, useCallback } from "react";
import { Moon, Sun } from "lucide-react";

// Componente de ícone do tema
const ThemeIcon = memo(({ theme }: { theme: string | undefined }) => {
  if (theme === "dark") {
    return <Moon className="w-4 h-4" />;
  }
  return <Sun className="w-4 h-4" />;
});
ThemeIcon.displayName = 'ThemeIcon';

// Componente principal
export const ThemeToggle = memo(() => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label="Alternar tema"
        disabled
      >
        <div className="w-4 h-4 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
      aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      <ThemeIcon theme={theme} />
    </button>
  );
});
ThemeToggle.displayName = 'ThemeToggle'; 