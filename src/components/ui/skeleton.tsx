import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className ?? ""}`}
      style={{ minHeight: 16, minWidth: 16 }}
    />
  );
} 