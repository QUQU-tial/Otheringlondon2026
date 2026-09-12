"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";
import { ensureProfile } from "../../lib/profiles";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      const returnToRaw =
        searchParams.get("returnTo") || sessionStorage.getItem("returnTo") || "/artists/join";
      const returnTo = returnToRaw.startsWith("/") ? returnToRaw : "/artists/join";

      const client = getSupabaseClient();
      if (!client) {
        setMessage("Auth is not configured.");
        return;
      }

      try {
        const code = searchParams.get("code");
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(error.message || "Could not complete sign-in.");
            return;
          }
        } else {
          // Allow detectSessionInUrl / hash tokens a moment to settle
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        const {
          data: { session },
        } = await client.auth.getSession();

        if (!session?.user) {
          setMessage("No session found. Please try again from Login.");
          return;
        }

        sessionStorage.removeItem("returnTo");
        await ensureProfile(session.user.id);
        router.replace(returnTo);
      } catch (error) {
        console.error(error);
        setMessage("Sign-in failed. Please try again.");
      }
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1C1C1C]">
      <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1C1C1C]">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
