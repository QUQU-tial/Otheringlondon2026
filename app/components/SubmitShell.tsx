"use client";

import type { ReactNode } from "react";
import { StaticSiteShell } from "./StaticSiteShell";
import { AboutUsWhiteTopBar } from "./AboutUsWhiteTopBar";

export function SubmitShell({ children }: { children: ReactNode }) {
  return (
    <StaticSiteShell variant="about">
      <div className="flex min-h-full flex-col bg-white text-[#1C1C1C]">
        <AboutUsWhiteTopBar />
        <div className="flex-1 px-6 pb-16 pt-8 min-[860px]:px-10 min-[860px]:pb-20">{children}</div>
      </div>
    </StaticSiteShell>
  );
}
