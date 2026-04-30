/**
 * Route protection utilities
 * Enforces authentication requirements for private routes
 */

import { getCurrentUser } from './auth';
import { isAdmin } from './profiles';

export const PUBLIC_ROUTES = [
  '/', // Workspace page (public)
  '/submit', // Submission form (public)
  '/partners',
  '/about-us',
  '/login',
  '/signup',
  '/admin', // Admin review (viewable without login)
  '/event', // Event detail pages (public, including preview)
] as const;

// Routes that should never be protected (even if they match private patterns)
export const ALWAYS_PUBLIC_ROUTES = [
  '/login',
] as const;

export const PRIVATE_ROUTES = [
  // /admin is public so you can view without login
] as const;

/**
 * Check if a route is public (no login required)
 */
export function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return true;
  }

  if (pathname.startsWith("/submit")) {
    return true;
  }

  // Public event detail pages (including preview)
  if (pathname.startsWith('/event/')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a route is private (login required)
 */
export function isPrivateRoute(pathname: string): boolean {
  // Exact matches
  if (PRIVATE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true;
  }
  
  return false;
}

/**
 * Check if user needs to be redirected to login
 * Returns the target login URL with returnTo parameter if redirect is needed
 */
export async function checkRouteAccess(pathname: string): Promise<{ needsRedirect: boolean; redirectUrl?: string }> {
  // Never protect login page or other always-public routes
  if (ALWAYS_PUBLIC_ROUTES.includes(pathname as any)) {
    return { needsRedirect: false };
  }
  
  if (isPublicRoute(pathname)) {
    return { needsRedirect: false };
  }
  
  if (isPrivateRoute(pathname)) {
    const user = await getCurrentUser();
    if (!user) {
      const returnTo = encodeURIComponent(pathname);
      // Store in sessionStorage for login page to read
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('returnTo', pathname);
      }
      return { 
        needsRedirect: true, 
        redirectUrl: `/login?returnTo=${returnTo}` 
      };
    }
    
    // For admin routes, check if user is admin
    if (pathname.startsWith('/admin')) {
      const admin = await isAdmin();
      if (!admin) {
        // Not an admin, redirect to home
        return {
          needsRedirect: true,
          redirectUrl: '/'
        };
      }
    }
  }
  
  return { needsRedirect: false };
}

