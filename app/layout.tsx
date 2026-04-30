import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { NetworkIndicator } from "@/components/NetworkIndicator";
import { RouteFade } from "@/components/RouteFade";
import { SignMark } from "@/components/SignMark";
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
            <main className="flex-1">
              <RouteFade>{children}</RouteFade>
            </main>
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
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-base font-bold tracking-tight"
        >
          <SignMark size={30} className="transition-transform group-hover:-rotate-6" />
          <span>
            High<span className="text-brand-500">Five</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <NavLink href="/learn">learn</NavLink>
          <NavLink href="/live">live</NavLink>
          <NavLink href="/mirror">mirror</NavLink>
          <NavLink href="/family">family</NavLink>
          <NavLink href="/educator">educator</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <NetworkIndicator />
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
      className="relative rounded-lg px-3 py-1.5 text-ink-soft transition hover:bg-white hover:text-ink hover:shadow-soft"
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-white py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />
      <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-ink-faint">
        <div className="flex items-center gap-2">
          <SignMark size={20} />
          <span className="font-display font-semibold text-ink">HighFive</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">real-time sign language learning</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-mint animate-pulseRing" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-mint" />
            </span>
            on-device vision
          </span>
          <span>·</span>
          <span>21 landmarks</span>
          <span>·</span>
          <span>no account</span>
        </div>
      </div>
    </footer>
  );
}
