import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { GamificationLayer } from "@/modules/gamification/GamificationLayer";
import { HUD } from "@/modules/gamification/HUD";
import { ProfileSwitcher } from "@/modules/profile/ProfileSwitcher";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HighFive — learn sign language, live",
  description:
    "Real-time, computer-vision-powered sign language learning for families, educators, and therapists.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfaf7",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <GamificationLayer />
        </Providers>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft">
            H
          </span>
          HighFive
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/learn">learn</NavLink>
          <NavLink href="/mirror">mirror</NavLink>
          <NavLink href="/family">family</NavLink>
          <NavLink href="/educator">educator</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <HUD />
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-ink-soft transition hover:bg-surface-muted hover:text-ink"
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 py-8">
      <div className="container-page flex flex-col items-start justify-between gap-2 text-sm text-ink-faint md:flex-row md:items-center">
        <span>HighFive · built for real conversations</span>
        <span>phase 6 · educator + analytics</span>
      </div>
    </footer>
  );
}
