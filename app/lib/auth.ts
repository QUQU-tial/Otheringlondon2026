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
    msg.includes("already in use")
  );
}

export interface User {
  id: string;
  email?: string;
}

// Get current user session
export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Create account (Supabase email/password)
export const signUp = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: new Error("Supabase client not configured") };
  }

  try {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      return { user: null, error };
    }
    if (data.user) {
      // No session until email is confirmed — RLS would block ensureProfile as anon
      if (data.session) {
        const { ensureProfile } = await import("./profiles");
        await ensureProfile(data.user.id);
      }
      return {
        user: { id: data.user.id, email: data.user.email ?? undefined },
        error: null,
      };
    }
    return { user: null, error: new Error("No user returned") };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: new Error('Supabase client not configured') };
  }
  
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { user: null, error };
    }
    
    if (data.user) {
      // Ensure profile exists on successful login
      const { ensureProfile } = await import('./profiles');
      await ensureProfile(data.user.id);
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        error: null,
      };
    }
    
    return { user: null, error: new Error('No user returned') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase client not configured') };
  }
  
  try {
    const { error } = await client.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const client = getSupabaseClient();
  if (!client) {
    callback(null);
    return () => {};
  }
  
  const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // Ensure profile exists on login
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { ensureProfile } = await import('./profiles');
        await ensureProfile(session.user.id);
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

