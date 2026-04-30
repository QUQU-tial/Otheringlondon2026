"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, getCurrentUser, isSignupDuplicateEmailError } from "../lib/auth";
import { BodyText, PrimaryButton, SecondaryButton } from "../components/othering";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duplicateEmailOpen, setDuplicateEmailOpen] = useState(false);

  const defaultNext = "/submit/form";

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        const returnTo = searchParams.get("returnTo") || sessionStorage.getItem("returnTo") || defaultNext;
        sessionStorage.removeItem("returnTo");
        router.replace(returnTo.startsWith("/") ? returnTo : defaultNext);
      }
    });
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { user, error: err } = await signUp(email, password);
      if (err) {
        if (isSignupDuplicateEmailError(err)) {
          setDuplicateEmailOpen(true);
        } else {
          setError(err.message || "Could not create account");
        }
        setLoading(false);
        return;
      }
      if (user) {
        const returnTo = searchParams.get("returnTo") || sessionStorage.getItem("returnTo") || defaultNext;
        sessionStorage.removeItem("returnTo");
        router.push(returnTo.startsWith("/") ? returnTo : defaultNext);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full border-0 border-b border-[#1C1C1C]/25 bg-transparent pb-2 text-[#1C1C1C] placeholder:text-[#1C1C1C]/35 transition-colors duration-200 focus:border-[#1C1C1C] focus:outline-none focus:ring-0";

  const loginHref = searchParams.get("returnTo")
    ? `/login?returnTo=${encodeURIComponent(searchParams.get("returnTo")!)}`
    : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1C1C1C] min-[860px]:flex-row">
      <div className="flex w-full flex-col justify-center border-b border-[#1C1C1C]/10 px-8 py-14 min-[860px]:w-[40%] min-[860px]:border-b-0 min-[860px]:border-r min-[860px]:py-20 min-[860px]:pl-10 min-[860px]:pr-8">
        <a
          href="/"
          className="mb-10 inline-block w-fit text-sm opacity-60 transition-opacity duration-200 hover:opacity-100"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          ← Home
        </a>
        <h1
          className="font-medium tracking-tight text-[#1C1C1C]"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(33.6px, 4.2vw, 50.4px)",
            lineHeight: 1.08,
          }}
        >
          Othering London 2026 — Art Takes Place
        </h1>
        <div className="mt-8 max-w-[36ch] space-y-6">
          <BodyText>Participation happens through the programme. Contributions are situated across time and location.</BodyText>
          <BodyText as="div">
            This space is for:
            <ul className="mt-4 list-none space-y-2">
              <li>— artists</li>
              <li>— organisers</li>
              <li>— partners</li>
            </ul>
          </BodyText>
        </div>
        <p
          className="mt-10 text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/45"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Powered by SPIRA9
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-8 py-14 min-[860px]:w-[60%] min-[860px]:py-20 min-[860px]:pl-12 min-[860px]:pr-16">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[360px] space-y-10">
          <div className="space-y-8">
            <label className="block">
              <span
                className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-[#1C1C1C]/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={fieldClass}
                style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: 1.5 }}
              />
            </label>
            <label className="block">
              <span
                className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-[#1C1C1C]/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                className={fieldClass}
                style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: 1.5 }}
              />
            </label>
            <label className="block">
              <span
                className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-[#1C1C1C]/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                className={fieldClass}
                style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: 1.5 }}
              />
            </label>
          </div>

          {error ? (
            <p className="text-sm text-[#1C1C1C]/60" style={{ fontFamily: "var(--font-inter)" }}>
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "…" : "Sign up"}
            </PrimaryButton>
            <SecondaryButton href={loginHref}>Login</SecondaryButton>
          </div>
        </form>
      </div>

      {duplicateEmailOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal
          aria-labelledby="signup-dup-title"
        >
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 id="signup-dup-title" className="mb-4 text-lg font-medium text-black">
              Account exists
            </h2>
            <p className="mb-6 text-[15px] text-black/80">
              This email already has an account. Please use Login to continue.
            </p>
            <div className="flex flex-wrap gap-4">
              <PrimaryButton href={loginHref}>Go to Login</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setDuplicateEmailOpen(false)}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
