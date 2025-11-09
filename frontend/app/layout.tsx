import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WorkSchedule",
  description: "Platform do zarządzania grafikami pracy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
              <Link href="/" className="text-lg font-semibold">
                WorkSchedule
              </Link>
              <nav
                className="flex items-center gap-4 text-sm font-medium text-slate-600"
                aria-label="Główna nawigacja"
              >
                <Link className="transition hover:text-blue-600" href="/employees">
                  Pracownicy
                </Link>
                <Link className="transition hover:text-blue-600" href="/settings">
                  Ustawienia
                </Link>
                <Link className="transition hover:text-blue-600" href="/generator">
                  Generator
                </Link>
                <Link className="transition hover:text-blue-600" href="/schedule">
                  Grafik
                </Link>
                <Link className="transition hover:text-blue-600" href="/absences">
                  Nieobecności
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
