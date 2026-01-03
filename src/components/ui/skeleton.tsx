import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-zinc-200/60 dark:bg-zinc-800", className)} />;
}


