import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const base =
  "inline-flex items-center justify-center bg-black px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-opacity duration-200 hover:opacity-85 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

/** Filled primary control for programme actions */
export function PrimaryButton({
  children,
  className = "",
  href,
  type = "button",
  disabled,
  ...rest
}: PrimaryButtonProps) {
  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`.trim()} style={{ fontFamily: "var(--font-inter)" }}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${className}`.trim()}
      style={{ fontFamily: "var(--font-inter)" }}
      {...rest}
    >
      {children}
    </button>
  );
}
