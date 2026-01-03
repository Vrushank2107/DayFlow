import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] hover:border-zinc-200 dark:border-zinc-900/60 dark:bg-zinc-950 dark:hover:border-zinc-800 dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4 text-sm text-zinc-600 dark:text-zinc-300", className)} {...props} />;
}


