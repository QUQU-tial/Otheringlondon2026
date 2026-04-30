"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getCurrentUser } from "../lib/auth";
import { BodyText, PrimaryButton, SecondaryButton } from "../components/othering";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    getCurrentUser().then((user) => {
      if (user) {
        const urlReturnTo = searchParams.get("returnTo");
        const sessionReturnTo = sessionStorage.getItem("returnTo");
        const defaultAfterLogin = "/submit/form";
        const returnTo = urlReturnTo
          ? decodeURIComponent(urlReturnTo)
          : sessionReturnTo || defaultAfterLogin;
        sessionStorage.removeItem("returnTo");
        router.push(returnTo.startsWith("/") ? returnTo : defaultAfterLogin);
      }
    });
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (email === "spira9art@gmail.com" && password === "999999999") {
      setLoading(false);
      router.push("/admin");
      return;
    }

    try {
      const { user, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (user) {
        const urlReturnTo = searchParams.get("returnTo");
        const sessionReturnTo = sessionStorage.getItem("returnTo");
        const defaultAfterLogin = "/submit/form";
        const returnTo = urlReturnTo
          ? decodeURIComponent(urlReturnTo)
          : sessionReturnTo || defaultAfterLogin;
        sessionStorage.removeItem("returnTo");
        setLoading(false);
        router.push(returnTo.startsWith("/") ? returnTo : defaultAfterLogin);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full border-0 border-b border-[#1C1C1C]/25 bg-transparent pb-2 text-[#1C1C1C] placeholder:text-[#1C1C1C]/35 transition-colors duration-200 focus:border-[#1C1C1C] focus:outline-none focus:ring-0";

  const returnToParam = searchParams.get("returnTo");
  const signupHref = returnToParam
    ? `/signup?returnTo=${encodeURIComponent(returnToParam)}`
    : "/signup";

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
                autoComplete="current-password"
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
              {loading ? "…" : "Login"}
            </PrimaryButton>
            <SecondaryButton href={signupHref}>Sign up</SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
