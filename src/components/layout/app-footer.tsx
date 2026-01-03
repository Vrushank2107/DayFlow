import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-white/60 backdrop-blur dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-zinc-600 dark:text-zinc-400 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Dayflow HRMS. Human Resource Management System.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-indigo-500">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-indigo-500">
            Terms
          </Link>
          <Link href="/support" className="hover:text-indigo-500">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}


