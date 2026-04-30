import type { ReactNode } from "react";
import Link from "next/link";

type CTAButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

/** Minimal text control; hover opacity 0.6 / 200ms */
export function CTAButton({
  children,
  className = "",
  href,
  onClick,
  type = "button",
  disabled,
}: CTAButtonProps) {
  const base =
    "inline-flex items-center bg-transparent p-0 font-normal text-[#1C1C1C] transition-opacity duration-200 ease-out hover:opacity-60 motion-reduce:transition-none focus:outline-none focus-visible:opacity-80 disabled:pointer-events-none disabled:opacity-40";

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`.trim()}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`.trim()}>
      {children}
    </button>
  );
}
