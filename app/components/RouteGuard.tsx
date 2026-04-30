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

  useEffect(() => {
    const protectRoute = async () => {
      const { needsRedirect, redirectUrl } = await checkRouteAccess(pathname);
      
      if (needsRedirect && redirectUrl) {
        router.push(redirectUrl);
      } else {
        setIsChecking(false);
      }
    };

    protectRoute();
  }, [pathname, router]);

  // Show nothing while checking (prevents flash of protected content)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}

