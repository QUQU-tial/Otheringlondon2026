// Authentication utilities using Supabase
import { getSupabaseClient } from "./supabase";

/** Email already registered — prompt user to log in instead */
export function isSignupDuplicateEmailError(err: Error): boolean {
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already exists") ||
    msg.includes("email address is already") ||
    msg.includes("email is already") ||
    msg.includes("already in use") ||
    msg.includes("account already exists")
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface User {
  id: string;
  email?: string;
}

export type AuthResult = {
  user: User | null;
  error: Error | null;
  needsEmailConfirmation?: boolean;
};

// Get current user session (prefer local session so UI is not blocked on network)
export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
      };
    }

    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

async function ensureProfileFor(userId: string) {
  const { ensureProfile } = await import("./profiles");
  await ensureProfile(userId);
}

// Create account (Supabase email/password)
export const signUp = async (email: string, password: string): Promise<AuthResult> => {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: new Error("Supabase client not configured") };
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
    });
    if (error) {
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error("No user returned") };
    }

    // Supabase soft-fails duplicate signups: returns a user with empty identities
    if ((data.user.identities?.length ?? 0) === 0) {
      return {
        user: null,
        error: new Error("Account already exists. Please log in."),
      };
    }

    // Prefer an active session. If confirm-email is on, session is null.
    if (data.session) {
      await ensureProfileFor(data.user.id);
      return {
        user: { id: data.user.id, email: data.user.email ?? normalizedEmail },
        error: null,
      };
    }

    // Try password sign-in immediately (works when email confirmation is disabled)
    const login = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (login.data.session?.user) {
      await ensureProfileFor(login.data.session.user.id);
      return {
        user: {
          id: login.data.session.user.id,
          email: login.data.session.user.email ?? normalizedEmail,
        },
        error: null,
      };
    }

    return {
      user: null,
      error: new Error(
        "Account created. Please confirm your email, then log in. If you used Google before, use Continue with Google."
      ),
      needsEmailConfirmation: true,
    };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: new Error("Supabase client not configured") };
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
        return {
          user: null,
          error: new Error(
            "Invalid email or password. If you signed up with Google, use Continue with Google. If you just registered, confirm your email first."
          ),
        };
      }
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        return {
          user: null,
          error: new Error("Please confirm your email before logging in. Check your inbox."),
          needsEmailConfirmation: true,
        };
      }
      return { user: null, error };
    }

    if (data.user) {
      try {
        await ensureProfileFor(data.user.id);
      } catch (profileError) {
        console.warn("Profile ensure after sign-in failed", profileError);
      }
      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? normalizedEmail,
        },
        error: null,
      };
    }

    return { user: null, error: new Error("No user returned") };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

/** Google OAuth — redirects to provider then `/auth/callback`. */
export const signInWithGoogle = async (
  returnTo = "/artists/join"
): Promise<{ error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error("Supabase client not configured") };
  }

  try {
    const safeReturn = returnTo.startsWith("/") ? returnTo : "/artists/join";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("returnTo", safeReturn);
    }
    // Keep redirect URL path-only so it matches Supabase allow-list exactly.
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // Do not force prompt=consent — it causes repeated Google re-login screens.
        queryParams: {
          access_type: "offline",
        },
      },
    });
    return { error: error ?? null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error("Supabase client not configured") };
  }

  try {
    // Global clears refresh token so the next password/Google login is clean.
    const { error } = await client.auth.signOut({ scope: "global" });
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Listen to auth state changes
// IMPORTANT: keep this callback synchronous — awaiting inside onAuthStateChange
// can deadlock getSession/getUser in supabase-js.
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const client = getSupabaseClient();
  if (!client) {
    callback(null);
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        void ensureProfileFor(session.user.id);
      }

      callback({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};
