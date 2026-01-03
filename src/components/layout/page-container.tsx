"use client";

import { ReactNode } from "react";
import { AppNavbar } from "./app-navbar";
import { AppFooter } from "./app-footer";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className={`flex-1 ${className}`}>{children}</main>
      <AppFooter />
    </div>
  );
}
