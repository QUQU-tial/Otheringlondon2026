"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AboutUsDarkNavBar } from "./AboutUsDarkNavBar";

const NAV_DEFAULT = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About us" },
  { href: "/submit", label: "Take part" },
  { href: "/partners", label: "All our partners" },
  { href: "/login", label: "Login" },
] as const;

type StaticSiteShellProps = {
  children: ReactNode;
  /** About layout: 3:7 split, left bullet nav */
  variant?: "default" | "about";
};

export function StaticSiteShell({ children, variant = "default" }: StaticSiteShellProps) {
  const pathname = usePathname();
  const isAboutShell = variant === "about";

  const asideClasses = isAboutShell
    ? "flex shrink-0 flex-col bg-[#1C1C1C] min-[860px]:min-w-0 min-[860px]:flex-[3] min-[860px]:shrink"
    : "panel-primary flex shrink-0 flex-col bg-[#1C1C1C] min-[860px]:min-w-0 min-[860px]:shrink";

  const mainClasses = isAboutShell
    ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-white text-[#1C1C1C] scrollbar-hide min-[860px]:flex-[7] min-[860px]:shrink"
    : "panel-detail flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-white text-[#1C1C1C] scrollbar-hide min-[860px]:shrink";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="workspace-container flex h-full min-h-0 flex-col overflow-y-auto min-[860px]:flex-row min-[860px]:overflow-hidden">
        <aside className={asideClasses}>
          {isAboutShell ? (
            <AboutUsDarkNavBar />
          ) : (
            <>
              <header
                className="flex shrink-0 items-center justify-between bg-[#1C1C1C] px-9"
                style={{
                  fontFamily: "var(--font-inter)",
                  paddingTop: "clamp(16px, 1.67vw, 24px)",
                  paddingBottom: "clamp(8px, 0.83vw, 12px)",
                }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center transition-opacity duration-200 hover:opacity-80"
                  aria-label="Home"
                >
                  <img
                    src="/othering-logo.png"
                    alt="Othering"
                    className="block h-[clamp(29px,3vw,38px)] w-auto"
                  />
                </Link>
              </header>

              <nav className="flex flex-col px-9 pb-10 pt-2" aria-label="Site">
                {NAV_DEFAULT.map(({ href, label }) => {
                  const active =
                    href === "/"
                      ? pathname === "/"
                      : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`py-3 text-left text-white transition-opacity duration-200 hover:opacity-70 ${
                        active ? "opacity-100" : "opacity-80"
                      }`}
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: "15px",
                        fontWeight: 300,
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </aside>

        <main className={mainClasses}>{children}</main>
      </div>
    </div>
  );
}
