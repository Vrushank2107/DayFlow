import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  count?: number;
};

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-900/60 dark:bg-zinc-950 animate-pulse">
          <Skeleton className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-24 w-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-10 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}


