import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft" | "outline" | "accent";
type Size = "sm" | "md" | "lg";

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | "as">;

// visual goal: buttons always read as buttons, even on the muted/grey surface.
//   - primary: ink-colored shadow + brand fill so it stands on any ground
//   - ghost:   white fill + ink border → obvious on grey (no camouflage)
//   - soft:    brand tint for secondary CTAs
//   - outline: ink border over transparent → works on dark tiles
//   - accent:  mint→peach gradient for playful / reward CTAs
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white border border-brand-700/20 shadow-[0_2px_0_0_rgba(26,29,38,0.25),0_8px_20px_-6px_rgba(75,110,255,0.55)] hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_rgba(26,29,38,0.25),0_14px_28px_-8px_rgba(75,110,255,0.6)] active:translate-y-0 active:shadow-[0_1px_0_0_rgba(26,29,38,0.25),0_4px_10px_-4px_rgba(75,110,255,0.5)] disabled:bg-brand-500/50 disabled:shadow-none disabled:translate-y-0",
  ghost:
    "bg-white text-ink border border-ink/15 shadow-[0_1px_0_0_rgba(26,29,38,0.06),0_3px_8px_-2px_rgba(26,29,38,0.08)] hover:border-ink/40 hover:shadow-[0_2px_0_0_rgba(26,29,38,0.08),0_6px_14px_-4px_rgba(26,29,38,0.12)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50",
  soft:
    "bg-brand-100 text-brand-700 border border-brand-400/30 shadow-[0_1px_0_0_rgba(75,110,255,0.15)] hover:bg-brand-100/80 hover:border-brand-400/50 disabled:opacity-50",
  outline:
    "bg-transparent text-ink border-2 border-ink/80 hover:bg-ink hover:text-white disabled:opacity-50",
  accent:
    "text-ink border border-ink/15 bg-gradient-to-br from-accent-mint via-accent-peach to-accent-lilac shadow-[0_2px_0_0_rgba(26,29,38,0.25),0_10px_24px_-8px_rgba(199,184,255,0.7)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_rgba(26,29,38,0.25),0_16px_32px_-10px_rgba(199,184,255,0.8)] active:translate-y-0 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 ease-out will-change-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:translate-y-0";

export function Button<T extends ElementType = "button">(props: ButtonProps<T>) {
  const { as, variant = "primary", size = "md", className = "", children, ...rest } = props;
  const Component = (as ?? "button") as ElementType;
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
