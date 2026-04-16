import type { ProfileAvatarKey } from "@/services/api";

// shared avatar-to-tailwind mapping so HUD, switcher, dashboard, and modal
// all stay visually in lockstep.
export const AVATAR_BG: Record<ProfileAvatarKey, string> = {
  peach: "bg-accent-peach text-ink",
  mint: "bg-accent-mint text-ink",
  lilac: "bg-accent-lilac text-ink",
  brand: "bg-brand-500 text-white",
};

export const AVATAR_KEYS: ProfileAvatarKey[] = ["peach", "mint", "lilac", "brand"];

export function initialOf(name: string | null | undefined): string {
  return (name ?? "?")[0]?.toUpperCase() ?? "?";
}
