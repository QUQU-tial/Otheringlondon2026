import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

type SecondaryButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const base =
  "inline-flex items-center justify-center border border-[#1C1C1C] bg-transparent px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-[#1C1C1C] transition-opacity duration-200 hover:opacity-60 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

export function SecondaryButton({
  children,
  className = "",
  href,
  type = "button",
  disabled,
  onClick,
  ...rest
}: SecondaryButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={`${base} ${className}`.trim()}
        style={{ fontFamily: "var(--font-inter)" }}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${className}`.trim()}
      style={{ fontFamily: "var(--font-inter)" }}
      {...rest}
    >
      {children}
    </button>
  );
}
