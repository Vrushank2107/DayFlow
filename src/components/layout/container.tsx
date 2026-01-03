"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
};

export function Container({ 
  children, 
  className = "", 
  size = "xl" 
}: ContainerProps) {
  return (
    <div className={cn(
      "mx-auto w-full px-4 sm:px-6 lg:px-8",
      maxWidths[size],
      className
    )}>
      {children}
    </div>
  );
}
