"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "../lib/auth";

const ADMIN_BYPASS_KEY = "adminBypass";
const ADMIN_BYPASS_EMAIL_KEY = "adminBypassEmail";

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export function AdminShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window !== "undefined" && sessionStorage.getItem(ADMIN_BYPASS_KEY) === "1") {
          if (!cancelled) {
            setEmail(sessionStorage.getItem(ADMIN_BYPASS_EMAIL_KEY) || "spira9art@gmail.com");
          }
          return;
        }
        const user = await withTimeout(getCurrentUser(), 2500, null);
        if (!cancelled && user?.email) setEmail(user.email);
      } catch {
        // Admin pages stay usable even if auth lookup fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    {
      href: "/admin",
      label: "Activities",
      match: (p: string) =>
        p === "/admin" || (p.startsWith("/admin/") && !p.startsWith("/admin/artists")),
    },
    {
      href: "/admin/artists",
      label: "Artists",
      match: (p: string) => p.startsWith("/admin/artists"),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1000px] px-[36px] py-[36px]">
        <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
          <h1
            className="font-medium capitalize text-black"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(40px, 4.17vw, 60px)",
              lineHeight: "clamp(40px, 4.17vw, 60px)",
              letterSpacing: "-4.8px",
            }}
          >
            {title}
          </h1>
          {email ? (
            <p className="text-[13px] text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
              {email}
            </p>
          ) : null}
        </div>

        <nav className="mb-[28px] flex flex-wrap gap-[12px] border-b border-black/10 pb-[16px]">
          {tabs.map((tab) => {
            const active = tab.match(pathname || "");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border px-[16px] py-[8px] transition-colors ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/20 bg-white text-black hover:bg-black/5"
                }`}
                style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
