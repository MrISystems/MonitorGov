"use client";

import React, { memo } from "react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Componente de link do menu
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

const NavLink = memo(({ href, children, className = "", highlight = false }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block p-2 rounded transition-colors",
        highlight
          ? "bg-primary/10 text-primary hover:bg-primary/20 dark:hover:bg-primary/30"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-700",
        isActive && !highlight && "bg-neutral-200 dark:bg-neutral-700",
        className
      )}
    >
      {children}
    </Link>
  );
});
NavLink.displayName = 'NavLink';

// Componente de menu lateral
const Sidebar = memo(() => (
  <aside className="w-full md:w-64 bg-white dark:bg-neutral-800 shadow-md md:h-screen p-4 flex-shrink-0">
    <div className="font-bold text-lg mb-6">MonitorGov</div>
    <nav className="space-y-2">
      <NavLink href="/">Dashboard</NavLink>
      <NavLink href="/processos">Processos</NavLink>
      <NavLink href="/contratos">Contratos</NavLink>
      <NavLink href="/obras">Obras</NavLink>
      <div className="border-t border-neutral-200 dark:border-neutral-700 my-4" />
      <NavLink href="/apresentacao" highlight>
        📊 Apresentação
      </NavLink>
    </nav>
  </aside>
));
Sidebar.displayName = 'Sidebar';

// Componente de cabeçalho
const Header = memo(() => (
  <header className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold">Painel MonitorGov</h1>
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <span className="text-sm text-neutral-500">Usuário</span>
    </div>
  </header>
));
Header.displayName = 'Header';

// Componente principal
const Layout = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900">
      <Sidebar />
      <main className="flex-1 p-4">
        <Header />
        {children}
      </main>
    </div>
  );
});
Layout.displayName = 'Layout';

export default Layout; 