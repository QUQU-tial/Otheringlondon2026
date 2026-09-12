"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, onAuthStateChange, signOut, type User } from "../lib/auth";

const linkClass =
  "text-white transition-opacity hover:opacity-65 focus:outline-none focus-visible:underline";

const linkStyle: CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(15px, 1.15vw, 18px)",
  fontWeight: 500,
  letterSpacing: "-0.01em",
};

/**
 * White panel top strip (black bar): map · artists · login/sign out.
 */
export function AboutUsWhiteTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    return onAuthStateChange(setUser);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.refresh();
  };

  const loginHref =
    pathname && pathname !== "/login"
      ? `/login?returnTo=${encodeURIComponent(pathname)}`
      : "/login";

  return (
    <header
      className="flex min-h-[3.25rem] shrink-0 items-center justify-between border-b border-white/15 bg-black px-6 py-[clamp(14px,1.4vw,20px)] min-[860px]:px-10"
      aria-label="Site links"
    >
      <Link href="/partners" className={linkClass} style={linkStyle}>
        View All Programmes
      </Link>
      <nav className="flex items-center gap-[24px]">
        <Link href="/artists" className={linkClass} style={linkStyle}>
          Artists
        </Link>
        {user ? (
          <button type="button" onClick={() => void handleSignOut()} className={linkClass} style={linkStyle}>
            Sign out
          </button>
        ) : (
          <Link
            href={loginHref}
            className={linkClass}
            style={linkStyle}
            onClick={() => {
              if (pathname && pathname !== "/login") {
                sessionStorage.setItem("returnTo", pathname);
              }
            }}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
