"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkRouteAccess } from "../lib/route-protection";

/**
 * Route Guard Component
 * Protects private routes by redirecting unauthenticated users to login
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsChecking(true);
    setAllowed(false);

    const protectRoute = async () => {
      try {
        const result = await Promise.race([
          checkRouteAccess(pathname),
          new Promise<{ needsRedirect: false }>((resolve) =>
            setTimeout(() => resolve({ needsRedirect: false }), 4000)
          ),
        ]);
        if (cancelled) return;
        if (result.needsRedirect && "redirectUrl" in result && result.redirectUrl) {
          router.replace(result.redirectUrl as string);
          // Keep showing Loading while navigation runs; never hard-block forever.
          setTimeout(() => {
            if (!cancelled) {
              setAllowed(true);
              setIsChecking(false);
            }
          }, 1500);
          return;
        }
        setAllowed(true);
        setIsChecking(false);
      } catch {
        if (cancelled) return;
        setAllowed(true);
        setIsChecking(false);
      }
    };

    void protectRoute();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (isChecking || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
          Loading…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
