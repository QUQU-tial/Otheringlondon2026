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
      const { needsRedirect, redirectUrl } = await checkRouteAccess(pathname);

      if (cancelled) return;

      if (needsRedirect && redirectUrl) {
        router.replace(redirectUrl);
        setAllowed(false);
        setIsChecking(false);
        return;
      }

      setAllowed(true);
      setIsChecking(false);
    };

    void protectRoute();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (isChecking || !allowed) {
    return null;
  }

  return <>{children}</>;
}
