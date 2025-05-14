import React from 'react';

export function Select({ value, onValueChange, children }: any) {
  return (
    <select
      className="border rounded p-2"
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children, className }: any) {
  return <div className={className}>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <option value="">{placeholder}</option>;
}

export function SelectContent({ children }: any) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: any) {
  return <option value={value}>{children}</option>;
} 