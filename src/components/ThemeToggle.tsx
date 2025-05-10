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
      className="p-2 rounded bg-neutral-800 text-white hover:bg-neutral-700 transition"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
    </button>
  );
} 