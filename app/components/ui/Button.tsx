import Link from "next/link";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-twilight-indigo text-creamsicle-dream hover:bg-midnight-plum",
  secondary:
    "bg-sunlit-amber/20 text-twilight-indigo hover:bg-sunlit-amber/40",
  ghost:
    "bg-transparent text-twilight-indigo hover:bg-twilight-indigo/5",
  danger:
    "bg-scarlet-ember/15 text-scarlet-ember hover:bg-scarlet-ember/25",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button(
  props:
    | (CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)
    | (CommonProps & { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>),
) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;
  const cls = cx(
    "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
  );
  if ("href" in rest && rest.href) {
    return (
      <Link {...(rest as React.ComponentProps<typeof Link>)} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      className={cls}
    >
      {children}
    </button>
  );
}
