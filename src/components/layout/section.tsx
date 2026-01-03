"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  fullWidth?: boolean;
}

export function Section({ 
  children, 
  className = "", 
  id,
  fullWidth = false
}: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        "py-16 md:py-24",
        fullWidth ? "w-full" : "container mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </section>
  );
}
