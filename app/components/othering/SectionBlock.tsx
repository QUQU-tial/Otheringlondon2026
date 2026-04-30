import type { ReactNode } from "react";

type SectionBlockProps = {
  children: ReactNode;
  className?: string;
  /** Vertical padding clamp 80–120px between sections */
  spacing?: "default" | "tight";
  staggerIndex?: number;
};

export function SectionBlock({
  children,
  className = "",
  spacing = "default",
  staggerIndex = 0,
}: SectionBlockProps) {
  const py =
    spacing === "tight"
      ? "py-[clamp(3rem,6vw,5rem)]"
      : "py-[clamp(5rem,10vw,7.5rem)]";
  return (
    <section
      className={`othering-enter ${py} ${className}`.trim()}
      style={{ animationDelay: `${staggerIndex * 80}ms` }}
    >
      {children}
    </section>
  );
}
