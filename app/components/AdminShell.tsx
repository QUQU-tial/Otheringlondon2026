"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { isAdmin } from "../lib/profiles";

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
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window !== "undefined" && sessionStorage.getItem(ADMIN_BYPASS_KEY) === "1") {
          if (cancelled) return;
          setEmail(sessionStorage.getItem(ADMIN_BYPASS_EMAIL_KEY) || "spira9art@gmail.com");
          setAllowed(true);
          setReady(true);
          return;
        }

        const user = await withTimeout(getCurrentUser(), 5000, null);
        if (cancelled) return;
        if (!user) {
          sessionStorage.setItem("returnTo", pathname || "/admin/artists");
          setAllowed(false);
          setReady(true);
          router.replace(`/login?returnTo=${encodeURIComponent(pathname || "/admin/artists")}`);
          return;
        }
        const admin = await withTimeout(isAdmin(), 5000, false);
        if (cancelled) return;
        setEmail(user.email || "");
        setAllowed(admin);
        setReady(true);
      } catch {
        if (cancelled) return;
        setAllowed(false);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
          Checking admin access…
        </p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-[420px]">
          <h1
            className="mb-4 font-medium text-black"
            style={{ fontFamily: "var(--font-inter)", fontSize: "24px" }}
          >
            Admin only
          </h1>
          <p className="mb-6 text-black/70" style={{ fontFamily: "var(--font-inter)", fontSize: "15px" }}>
            {email
              ? `Signed in as ${email}, but this account is not an admin. In Supabase SQL run: UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = '${email}');`
              : "Please log in with an admin account first."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/login?returnTo=${encodeURIComponent(pathname || "/admin/artists")}`}
              className="underline"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Login
            </Link>
            <Link href="/" className="underline" style={{ fontFamily: "var(--font-inter)" }}>
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-[13px] text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
            {email}
          </p>
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
