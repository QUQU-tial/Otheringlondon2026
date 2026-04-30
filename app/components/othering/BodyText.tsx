import type { ReactNode } from "react";

type BodyTextProps = {
  children: ReactNode;
  as?: "p" | "div" | "span";
  className?: string;
  variant?: "default" | "compact";
};

export function BodyText({
  children,
  as: Tag = "p",
  className = "",
  variant = "default",
}: BodyTextProps) {
  const size =
    variant === "compact"
      ? { fontSize: "clamp(14px, 1.05vw, 15px)", lineHeight: 1.6 }
      : { fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: 1.6 };

  return (
    <Tag
      className={`font-normal text-[#1C1C1C] ${className}`.trim()}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        ...size,
      }}
    >
      {children}
    </Tag>
  );
}
