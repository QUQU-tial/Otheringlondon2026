"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getActivities, type Activity } from "../lib/storage";
import {
  getCurrentUser,
  signOut,
  onAuthStateChange,
  type User,
} from "../lib/auth";

const menuLink: CSSProperties = {
  fontFamily: "var(--font-poppins)",
  fontSize: "16px",
  fontWeight: 300,
  lineHeight: "normal",
};

const SIDE_LINKS = [
  { href: "/about-us", label: "About us" },
  { href: "/submit", label: "Take part" },
  { href: "/partners", label: "All our partners" },
] as const;

/**
 * About left column: logo + menu bar, then bullet list (current page white, others grey).
 */
export function AboutUsDarkNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getActivities().then(setActivities);
  }, []);

  useEffect(() => {
    getCurrentUser().then(setUser);
    return onAuthStateChange(setUser);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  const filteredActivities = menuSearchQuery.trim()
    ? activities.filter((a) =>
        a.activity_title.toLowerCase().includes(menuSearchQuery.trim().toLowerCase())
      )
    : activities;

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuSearchQuery("");
  };

  const onSelectActivity = (id: string) => {
    closeMenu();
    router.push(`/?activityId=${encodeURIComponent(id)}`);
  };

  const onLogin = () => {
    const returnTo = window.location.pathname;
    if (returnTo !== "/login") sessionStorage.setItem("returnTo", returnTo);
    router.push("/login");
    closeMenu();
  };

  const onLogout = async () => {
    await signOut();
    router.push("/");
    closeMenu();
  };

  return (
    <>
    <header
      className="sticky top-0 z-10 flex min-h-[3.25rem] shrink-0 items-center justify-between gap-4 bg-black px-6 py-[clamp(14px,1.4vw,20px)] min-[860px]:px-9"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <Link
        href="/"
        className="inline-flex min-w-0 shrink items-center transition-opacity hover:opacity-80"
        aria-label="Home"
        onClick={closeMenu}
      >
        <img
          src="/othering-logo.png"
          alt="Othering"
          className="block h-[var(--site-logo-height,clamp(35px,3.6vw,46px))] w-auto"
        />
      </Link>

      <nav className="relative shrink-0" ref={menuRef} aria-label="Menu">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="text-white p-[4px] transition-opacity hover:opacity-70 focus:opacity-80 focus:outline-none"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-[8px] flex max-h-[min(90vh,480px)] min-w-[240px] max-w-[320px] flex-col overflow-y-auto bg-black">
            <div className="flex flex-col">
              <div className="flex items-center gap-[10px] px-[16px] py-[12px] text-[#E1E1E1]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search activities…"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-white placeholder:text-[#888] focus:outline-none focus:ring-0"
                  style={{ fontFamily: "var(--font-poppins)", fontSize: "14px" }}
                  autoFocus
                />
              </div>
              {activities.length > 0 && (
                <div className="max-h-[100px] overflow-y-auto">
                  {filteredActivities.length === 0 ? (
                    <div className="px-[24px] py-[12px] text-[#888]" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px" }}>
                      No matches
                    </div>
                  ) : (
                    filteredActivities.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => onSelectActivity(activity.id)}
                        className="w-full px-[24px] py-[10px] text-left text-white transition-colors hover:bg-white/10"
                        style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", fontWeight: 300 }}
                      >
                        {activity.activity_title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col pt-1">
              <Link href="/partners" onClick={closeMenu} className="px-[24px] py-[16px] text-white transition-opacity hover:opacity-70" style={menuLink}>
                All our partners
              </Link>
              <Link href="/submit" onClick={closeMenu} className="px-[24px] py-[16px] text-white transition-opacity hover:opacity-70" style={menuLink}>
                Take part
              </Link>
              <Link href="/about-us" onClick={closeMenu} className="px-[24px] py-[16px] text-white transition-opacity hover:opacity-70" style={menuLink}>
                About us
              </Link>
              {user ? (
                <button type="button" onClick={onLogout} className="px-[24px] py-[16px] text-left text-white transition-opacity hover:opacity-70" style={menuLink}>
                  Logout
                </button>
              ) : (
                <button type="button" onClick={onLogin} className="px-[24px] py-[16px] text-left text-white transition-opacity hover:opacity-70" style={menuLink}>
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>

    <nav
      className="flex flex-col gap-[14px] px-6 pb-10 pt-8 min-[860px]:px-9"
      aria-label="About pages"
    >
      {SIDE_LINKS.map(({ href, label }) => {
        const active =
          href === "/about-us"
            ? pathname === "/about-us"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-start gap-[10px] transition-colors ${
              active ? "text-white" : "text-[#9A9A9A] hover:text-white/85"
            }`}
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "15px",
              fontWeight: 300,
              lineHeight: 1.35,
            }}
          >
            <span
              className={`mt-[0.45em] h-[5px] w-[5px] shrink-0 rounded-full ${
                active ? "bg-white" : "bg-[#9A9A9A] group-hover:bg-white/70"
              }`}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
