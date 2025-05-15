"use client";

import React, { memo, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Tipos
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder: string;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

// Componente Select principal
export const Select = memo(forwardRef<HTMLSelectElement, SelectProps>(({
  value,
  onValueChange,
  children,
  label,
  error,
  helperText,
  className,
  ...props
}, ref) => {
  const id = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-md border border-neutral-300 dark:border-neutral-700",
          "bg-white dark:bg-neutral-800",
          "px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500 dark:border-red-400",
          className
        )}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p 
          id={`${id}-error`}
          className="text-sm text-red-500 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p 
          id={`${id}-helper`}
          className="text-sm text-neutral-500 dark:text-neutral-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}));
Select.displayName = 'Select';

// Componente de trigger do select
export const SelectTrigger = memo(({ 
  children, 
  className,
  ...props 
}: SelectTriggerProps) => (
  <div 
    className={cn(
      "flex items-center justify-between",
      "px-3 py-2 text-sm",
      "border border-neutral-300 dark:border-neutral-700",
      "rounded-md bg-white dark:bg-neutral-800",
      "focus:outline-none focus:ring-2 focus:ring-primary/50",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectTrigger.displayName = 'SelectTrigger';

// Componente de valor do select
export const SelectValue = memo(({ 
  placeholder,
  className 
}: SelectValueProps) => (
  <option 
    value="" 
    className={cn(
      "text-neutral-500 dark:text-neutral-400",
      className
    )}
  >
    {placeholder}
  </option>
));
SelectValue.displayName = 'SelectValue';

// Componente de conteúdo do select
export const SelectContent = memo(({ 
  children,
  className 
}: SelectContentProps) => (
  <div 
    className={cn(
      "py-1",
      className
    )}
  >
    {children}
  </div>
));
SelectContent.displayName = 'SelectContent';

// Componente de item do select
export const SelectItem = memo(({ 
  value, 
  children,
  disabled,
  className 
}: SelectItemProps) => (
  <option 
    value={value}
    disabled={disabled}
    className={cn(
      "px-3 py-2 text-sm",
      "cursor-pointer",
      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </option>
));
SelectItem.displayName = 'SelectItem'; 