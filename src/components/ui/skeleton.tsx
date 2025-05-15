import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse rounded bg-muted ${className ?? ""}`}
      style={{ minHeight: 16, minWidth: 16 }}
    />
  );
} 