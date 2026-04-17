import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { GamificationLayer } from "@/modules/gamification/GamificationLayer";
import { HUD } from "@/modules/gamification/HUD";
import { ProfileSwitcher } from "@/modules/profile/ProfileSwitcher";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/90 backdrop-blur-md">
      <div className="container-page flex h-14 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-xs font-bold text-white">
            H
          </span>
          HighFive
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <NavLink href="/learn">learn</NavLink>
          <NavLink href="/live">live</NavLink>
          <NavLink href="/mirror">mirror</NavLink>
          <NavLink href="/family">family</NavLink>
          <NavLink href="/educator">educator</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-3">
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
      className="rounded-lg px-3 py-1.5 text-ink-soft transition hover:bg-surface-muted hover:text-ink"
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 py-6">
      <div className="container-page flex items-center justify-between text-xs text-ink-faint">
        <span className="font-display font-medium text-ink">HighFive</span>
        <span>real-time sign language learning</span>
      </div>
    </footer>
  );
}
