"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { SITE_LOGO_HEIGHT } from "../lib/activity-areas";

const navStyle: CSSProperties = {
  fontFamily: "var(--font-source-sans-3)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 500,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
};

const mutedNavStyle: CSSProperties = {
  fontFamily: "var(--font-source-sans-3)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 400,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
};

type WhiteSiteHeaderProps = {
  current?: "artists";
};

export function WhiteSiteHeader({ current }: WhiteSiteHeaderProps) {
  return (
    <header
      className="panel-column-header sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-[36px]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <Link
        href="/"
        className="inline-flex items-center transition-opacity hover:opacity-80"
        aria-label="Home"
      >
        <img
          src="/othering-logo-on-white.png"
          alt="Festival logo"
          className="block w-auto"
          style={{ height: SITE_LOGO_HEIGHT }}
        />
      </Link>
      <nav className="flex items-center gap-[24px]">
        <Link
          href="/submit"
          className="text-black capitalize transition-opacity hover:opacity-70"
          style={navStyle}
        >
          Become a Partner
        </Link>
        {current === "artists" ? (
          <span className="text-black capitalize" style={navStyle}>
            Artists
          </span>
        ) : (
          <Link
            href="/artists"
            className="text-black capitalize transition-opacity hover:opacity-70"
            style={navStyle}
          >
            Artists
          </Link>
        )}
        <Link
          href="/"
          className="capitalize text-[#9A9A9A] transition-opacity hover:opacity-70"
          style={mutedNavStyle}
        >
          Back to workspace
        </Link>
      </nav>
    </header>
  );
}
