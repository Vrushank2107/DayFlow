import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppFooter } from "@/components/layout/app-footer";
import { AppNavbar } from "@/components/layout/app-navbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dayflow HRMS",
  description: "Modern Human Resource Management System for employee management, attendance tracking, leave management, and payroll.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Dayflow HRMS",
    description: "Modern Human Resource Management System.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dayflow HRMS",
    description: "Modern Human Resource Management System.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} grid-overlay antialiased`}>
        <AppNavbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <AppFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
