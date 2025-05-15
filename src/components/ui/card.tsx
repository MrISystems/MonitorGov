"use client";

import React, { memo, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Tipos
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Componente Card principal
export const Card = memo(forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        variant === 'default' && "bg-white dark:bg-neutral-800 shadow-sm",
        variant === 'outline' && "border border-neutral-200 dark:border-neutral-700",
        variant === 'ghost' && "bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}));
Card.displayName = 'Card';

// Componente de cabeçalho do card
export const CardHeader = memo(({ 
  children,
  className,
  ...props 
}: CardHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

// Componente de título do card
export const CardTitle = memo(({ 
  children,
  className,
  as: Component = 'h2',
  ...props 
}: CardTitleProps) => (
  <Component
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </Component>
));
CardTitle.displayName = 'CardTitle';

// Componente de descrição do card
export const CardDescription = memo(({ 
  children,
  className,
  ...props 
}: CardDescriptionProps) => (
  <p
    className={cn(
      "text-sm text-neutral-500 dark:text-neutral-400",
      className
    )}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

// Componente de conteúdo do card
export const CardContent = memo(({ 
  children,
  className,
  ...props 
}: CardContentProps) => (
  <div
    className={cn(
      "p-6 pt-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

// Componente de rodapé do card
export const CardFooter = memo(({ 
  children,
  className,
  ...props 
}: CardFooterProps) => (
  <div
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter'; 