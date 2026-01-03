"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-700 dark:focus-visible:border-indigo-400",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";


