import type { ReactNode } from "react";

type LargeTitleProps = {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
  /** Smaller editorial pages (About / static) */
  variant?: "default" | "compact";
};

export function LargeTitle({
  children,
  as: Tag = "h1",
  className = "",
  variant = "default",
}: LargeTitleProps) {
  const size =
    variant === "compact"
      ? { fontSize: "clamp(32px, 4.25vw, 48px)", lineHeight: 1.1 }
      : { fontSize: "clamp(48px, 6vw, 72px)", lineHeight: 1.08 };

  return (
    <Tag
      className={`font-medium tracking-tight text-[#1C1C1C] ${className}`.trim()}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        ...size,
      }}
    >
      {children}
    </Tag>
  );
}
