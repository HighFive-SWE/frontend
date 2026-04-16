import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Accent = "mint" | "peach" | "lilac" | "brand";

type CardOwnProps = {
  title: string;
  subtitle?: string;
  accent?: Accent;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

type CardProps<T extends ElementType> = CardOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps | "as">;

const accentRing: Record<Accent, string> = {
  mint: "bg-accent-mint/25",
  peach: "bg-accent-peach/40",
  lilac: "bg-accent-lilac/35",
  brand: "bg-brand-100",
};

export function Card<T extends ElementType = "div">(props: CardProps<T>) {
  const {
    as,
    title,
    subtitle,
    accent = "brand",
    disabled = false,
    children,
    className = "",
    ...rest
  } = props;
  const Component = (as ?? "div") as ElementType;

  const base =
    "group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-ink/5 bg-white p-6 shadow-soft transition";
  const state = disabled
    ? "opacity-60 cursor-not-allowed"
    : "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(26,29,38,0.25)]";

  return (
    <Component className={`${base} ${state} ${className}`.trim()} aria-disabled={disabled} {...rest}>
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${accentRing[accent]}`} />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {subtitle && <p className="text-ink-soft">{subtitle}</p>}
      {children}
      {!disabled && (
        <span className="mt-2 text-sm font-medium text-brand-600 transition group-hover:text-brand-700">
          open →
        </span>
      )}
    </Component>
  );
}
