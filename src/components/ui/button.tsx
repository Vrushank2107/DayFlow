"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:shadow-zinc-100/20",
        outline:
          "border-2 border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100 hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:hover:border-zinc-600",
        ghost: "text-zinc-900 hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-100 dark:hover:bg-zinc-900",
        secondary: "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-10 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";


