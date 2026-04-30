import type { ReactNode } from "react";

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

/** Editorial column: max 720px, left-aligned. */
export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div
      className={`w-full max-w-[720px] text-left ${className}`.trim()}
      style={{ color: "#1C1C1C" }}
    >
      {children}
    </div>
  );
}
