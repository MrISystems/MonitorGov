"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 transition text-xs min-w-[32px] min-h-[32px] flex items-center justify-center"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
} 