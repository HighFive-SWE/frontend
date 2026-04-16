import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft";
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

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-soft hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-500/50",
  ghost: "bg-surface-muted text-ink hover:bg-ink/5 disabled:opacity-50",
  soft: "bg-brand-100 text-brand-700 hover:bg-brand-100/70 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:cursor-not-allowed";

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
