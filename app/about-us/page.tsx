"use client";

import "@fontsource/iosevka-charon-mono/700.css";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { PageWrapper, SectionBlock, BodyText } from "../components/othering";
import { StaticSiteShell } from "../components/StaticSiteShell";
import { AboutUsWhiteTopBar } from "../components/AboutUsWhiteTopBar";
import { AboutPhotoWall } from "../components/AboutPhotoWall";

const SUBMIT = "/submit";

const CONTENT_W = "w-full max-w-[730px]";

const HERO_FONT: CSSProperties = {
  fontFamily: '"Iosevka Charon Mono", monospace',
  fontWeight: 700,
  fontSize: "clamp(24px, 6.85vw, 50px)",
  lineHeight: 1.05,
  textTransform: "uppercase",
  color: "#1C1C1C",
};

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#737373]"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {children}
    </p>
  );
}

function SubmitCta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Link
      href={SUBMIT}
      className={`inline-flex items-center bg-transparent p-0 font-medium tracking-tight text-[#1C1C1C] transition-opacity duration-200 ease-out hover:opacity-60 motion-reduce:transition-none focus:outline-none focus-visible:opacity-80 ${className}`.trim()}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: "clamp(16px, 1.39vw, 20px)",
        lineHeight: 1.4,
      }}
    >
      {children}
    </Link>
  );
}

const SUPPORT_EMAIL = "info@otheringfestival.com";

function CopyEmailLink({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline bg-transparent p-0 text-[#1C1C1C] underline decoration-red-600 decoration-1 underline-offset-2 transition-colors hover:text-red-600 focus:outline-none focus-visible:text-red-600"
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: "clamp(14px, 1.05vw, 15px)",
        lineHeight: 1.6,
      }}
      aria-label={copied ? "Email copied" : `Copy ${email}`}
    >
      {copied ? "Copied!" : email}
    </button>
  );
}

export default function AboutUsPage() {
  return (
    <StaticSiteShell variant="about">
      <div className="flex min-h-full flex-col bg-white">
        <AboutUsWhiteTopBar />
        <div className="flex-1 px-6 pb-16 pt-8 min-[860px]:px-10 min-[860px]:pb-20">
          <PageWrapper className="!max-w-[730px] px-0 sm:px-0">
            {/* Hero */}
            <div className={`othering-enter mb-0 ${CONTENT_W}`}>
              <Eyebrow>Othering London 2026</Eyebrow>
              <div className="mt-3 space-y-1">
                <h1 style={{ ...HERO_FONT, letterSpacing: "0.12em" }}>Art Takes Place.</h1>
                <p style={{ ...HERO_FONT, letterSpacing: 0 }}>
                  We are looking for projects that belong to a place.
                </p>
                <p style={{ ...HERO_FONT, letterSpacing: 0 }}>20 June — 20 September 2026</p>
              </div>
              <AboutPhotoWall className="mt-8 w-full" />
              <div className="mt-8 space-y-4">
                <BodyText variant="compact">
                  Othering brings together art, design, architecture, performance and expanded forms of
                  practice to create layered, unexpected presentations that unfold beyond the limits of the
                  traditional exhibition.
                </BodyText>
                <BodyText variant="compact">
                  Othering London 2026 finds exhibitions, installations, performances, interventions and
                  temporary gestures that respond to the spaces, communities and stories of London.
                </BodyText>
              </div>
              <div className="mt-8">
                <SubmitCta>Claim Your Place →</SubmitCta>
              </div>
              <p
                className="mt-4 text-[#525252]"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: "clamp(13px, 1vw, 14px)",
                  lineHeight: 1.55,
                }}
              >
                Free to join.
                <br />
                Free listing for independent cultural programmes in London. Selected projects become part of
                the Othering London 2026 programme.
              </p>
            </div>

            {/* About Othering */}
            <SectionBlock spacing="tight" staggerIndex={1} className="!pt-[clamp(28px,5vw,48px)]">
              <div className={CONTENT_W}>
                <h2
                  className="mb-6 font-medium tracking-tight text-[#1C1C1C]"
                  style={{
                    fontFamily: "var(--font-source-sans-3), system-ui, sans-serif",
                    fontSize: "clamp(20px, 2vw, 26px)",
                    lineHeight: 1.2,
                  }}
                >
                  About Othering
                </h2>
                <div className="space-y-4">
                  <BodyText variant="compact">
                    Rather than beginning with the gallery, we begin with the city.
                  </BodyText>
                  <BodyText variant="compact">
                    Working across stations, forgotten buildings, studios, streets and transitional spaces,
                    Othering brings artistic practice into places that already carry memory, conflict and
                    everyday life.
                  </BodyText>
                  <BodyText variant="compact">
                    Othering is a completely non-profit platform. We do not charge submission fees, listing
                    fees, commissions, or membership fees. Our aim is simple: to create greater visibility
                    for independent cultural activity across the city and to support a more open and connected
                    creative ecology.
                  </BodyText>
                  <BodyText variant="compact">
                    The project was founded from a belief that art, design, and creative practices should not
                    be constrained by institutional boundaries, commercial barriers, or artificial divisions
                    between disciplines and communities. We believe that cultural life becomes richer when
                    knowledge, resources, and opportunities are shared.
                  </BodyText>

                  <h3
                    className="pt-4 font-medium tracking-tight text-[#1C1C1C]"
                    style={{
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      fontSize: "clamp(16px, 1.25vw, 18px)",
                      lineHeight: 1.35,
                    }}
                  >
                    Support the Network
                  </h3>
                  <BodyText variant="compact">Othering is built collectively.</BodyText>
                  <BodyText variant="compact">
                    Every exhibition, performance, workshop, open studio, venue, artist, designer, organiser,
                    writer, and visitor contributes to the platform&apos;s growth and visibility. Rather than
                    functioning as a gatekeeper, we hope to become a shared resource that helps people
                    discover, connect, and participate in the cultural life of the city.
                  </BodyText>
                  <p
                    className="font-semibold text-[#1C1C1C]"
                    style={{
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      fontSize: "clamp(16px, 1.35vw, 19px)",
                      lineHeight: 1.55,
                    }}
                  >
                    Are you a writer, curator, critic, artist, designer, venue, publication, community
                    organiser, researcher, student, cultural practitioner, or simply someone who believes in
                    independent cultural activity?
                  </p>
                  <BodyText variant="compact">
                    If you believe in this mission and would like to support the project, we warmly welcome
                    introductions to publications, newsletters, cultural organisations, community groups, media
                    platforms, and networks that may help amplify the visibility of independent creative
                    programmes. Every connection, recommendation, and act of sharing helps strengthen the
                    platform and expand its reach.
                  </BodyText>
                  <BodyText variant="compact">
                    Let&apos;s build the network together. <CopyEmailLink email={SUPPORT_EMAIL} />
                  </BodyText>
                  <BodyText variant="compact">
                    Othering exists because of the people who contribute to it. We hope it continues to grow
                    through collective participation, generosity, and mutual support.
                  </BodyText>
                </div>
                <div className="mt-8">
                  <SubmitCta>Join Othering London 2026 →</SubmitCta>
                </div>
                <p
                  className="mt-4 text-[#525252]"
                  style={{
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: "clamp(13px, 1vw, 14px)",
                    lineHeight: 1.55,
                  }}
                >
                  Bring your place into the programme.
                </p>
              </div>
            </SectionBlock>
          </PageWrapper>
        </div>
      </div>
    </StaticSiteShell>
  );
}
