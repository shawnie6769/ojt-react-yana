import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import AppBackground from "@/components/AppBackground";

export const metadata: Metadata = {
  title: "My OJT Journal",
  description: "A gentle place to track your on-the-job training hours",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-text transition-colors">
        <AppBackground />
        <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
          <header className="mb-5 flex items-center justify-between">
            <Link href="/" className="font-heading text-lg font-semibold text-text">
              Yana's OJT Journal🌟
            </Link>
            <ThemeToggle />
          </header>
          {children}
          <footer className="mt-6 pb-1 text-center text-[10px] uppercase tracking-[0.2em] text-muted/70">
            Made with love by your bf 💖
          </footer>
        </div>
        <Nav />
      </body>
    </html>
  );
}
