"use client";

import "@fontsource/iosevka-charon-mono/700.css";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PageWrapper, SectionBlock, BodyText } from "./othering";

const SUBMIT_FORM = "/submit/transition";
const ABOUT = "/about-us";

const CONTENT_W = "w-full max-w-[730px]";

const HERO_FONT: CSSProperties = {
  fontFamily: '"Iosevka Charon Mono", monospace',
  fontWeight: 700,
  fontSize: "clamp(24px, 6.85vw, 50px)",
  lineHeight: 1.05,
  textTransform: "uppercase",
  color: "#1C1C1C",
};

const SECTION_TITLE: CSSProperties = {
  fontFamily: "var(--font-source-sans-3), system-ui, sans-serif",
  fontSize: "clamp(20px, 2vw, 26px)",
  lineHeight: 1.2,
};

const SUBSECTION_TITLE: CSSProperties = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontSize: "clamp(16px, 1.25vw, 18px)",
  lineHeight: 1.35,
};

const LIST_STYLE: CSSProperties = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontSize: "clamp(14px, 1.05vw, 15px)",
  lineHeight: 1.6,
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

function SubmitCta({
  children,
  href = SUBMIT_FORM,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center bg-transparent p-0 font-medium tracking-tight text-[#1C1C1C] transition-opacity duration-200 ease-out hover:text-red-600 motion-reduce:transition-none focus:outline-none focus-visible:text-red-600 ${className}`.trim()}
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

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-6 font-medium tracking-tight text-[#1C1C1C]" style={SECTION_TITLE}>
      {children}
    </h2>
  );
}

function SubsectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 font-medium text-[#1C1C1C]" style={SUBSECTION_TITLE}>
      {children}
    </h3>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[#1C1C1C]" style={LIST_STYLE}>
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="shrink-0 text-red-600">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BenefitBlock({
  title,
  intro,
  detail,
  items,
}: {
  title: string;
  intro: string;
  detail?: string;
  items: string[];
}) {
  return (
    <div>
      <SubsectionHeading>{title}</SubsectionHeading>
      <div className="space-y-4">
        <BodyText variant="compact">{intro}</BodyText>
        {detail ? <BodyText variant="compact">{detail}</BodyText> : null}
        <BulletList items={items} />
      </div>
    </div>
  );
}

export default function SubmissionPage() {
  return (
    <PageWrapper className="!max-w-[730px] px-0 sm:px-0">
      {/* Intro */}
      <div className={`othering-enter mb-0 ${CONTENT_W}`}>
        <Eyebrow>Othering London 2026</Eyebrow>
        <p className="mt-3" style={{ ...HERO_FONT, letterSpacing: 0 }}>
          Othering is a roaming curatorial platform discovering, curating and working with spaces in
          transition, activating and reimagining nomadic and site-specific projects across London and
          beyond.{" "}
          <Link
            href={ABOUT}
            className="underline decoration-red-600 decoration-1 underline-offset-2 transition-colors hover:text-red-600"
            style={{ font: "inherit", textTransform: "inherit" }}
          >
            Learn more about OTHERING.
          </Link>
        </p>
        <div className="mt-8">
          <SubmitCta>Join Othering →</SubmitCta>
        </div>
      </div>

      {/* Partner Benefits */}
      <SectionBlock spacing="tight" staggerIndex={1} className="!pt-[clamp(28px,5vw,48px)]">
        <div className={CONTENT_W}>
          <SectionHeading>Partner Benefits</SectionHeading>
          <div className="space-y-4">
            <p
              className="font-medium text-red-600"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "clamp(14px, 1.05vw, 15px)",
                lineHeight: 1.6,
              }}
            >
              Participation in Othering London 2026 is free.
            </p>
            <BodyText variant="compact">
              All selected projects are supported through a single curatorial framework designed to situate,
              support and extend each contribution within the wider programme.
            </BodyText>
            <BodyText variant="compact">
              Rather than offering tiers or packages, we work with one shared structure that ensures coherence
              across all projects.
            </BodyText>
            <BodyText variant="compact">
              Selected projects enter a curatorial system that connects sites, practices and audiences across
              London and beyond.
            </BodyText>
            <BodyText variant="compact">
              Each contribution is not placed into a fixed format, but situated within a specific spatial and
              contextual condition that shapes how it is experienced.
            </BodyText>
            <BodyText variant="compact">
              We work closely with participants to position each project in relation to its environment,
              intention and audience.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      {/* What You Receive */}
      <SectionBlock spacing="tight" staggerIndex={2} className="!pt-0">
        <div className={CONTENT_W}>
          <SectionHeading>What You Receive</SectionHeading>
          <div className="space-y-10">
            <BenefitBlock
              title="Situated Visibility & Promotional Assets"
              intro="We do not simply promote projects. We construct the conditions in which they are encountered."
              detail="We support how your project appears within the programme and beyond it. Selected projects will receive official festival materials to help identify your venue and activity as part of the programme."
              items={[
                "Access to festival identity and visual asset system",
                "Physical Partner signage (Window / Wall Sticker)",
              ]}
            />
            <BenefitBlock
              title="Curatorial Integration"
              intro="Each project is approached as part of a wider narrative landscape."
              detail="We focus on how work is described, circulated and remembered."
              items={[
                "Inclusion in the official programme structure",
                "Placement within the festival schedule",
                "Curatorial support and contextual positioning",
                "Online interview or studio conversation (selected projects)",
              ]}
            />
            <BenefitBlock
              title="Digital PR & Editorial Visibility"
              intro="We treat each project as part of an evolving narrative system."
              detail="Each contribution is framed and circulated through editorial and digital channels across the duration of the programme."
              items={[
                "Dedicated project page on the Othering website",
                "Inclusion in festival-wide editorial communications",
                "Visibility across cultural and partner networks",
              ]}
            />
            <BenefitBlock
              title="Social Media Promotion"
              intro="Each project is shared through a structured communication flow across the festival period."
              detail="Visibility unfolds over time rather than as a single announcement."
              items={[
                "3 Instagram Story Features",
                "3 Bespoke Instagram Feed Posts",
                "1 Festival Spotlight Reel",
                "1 Behind-the-Scenes Interview with a representative from your project or organisation",
                "Exclusive content creation and promotion through festival channels",
              ]}
            />
          </div>
        </div>
      </SectionBlock>

      {/* What We Are Looking For */}
      <SectionBlock spacing="tight" staggerIndex={3} className="!pt-0">
        <div className={CONTENT_W}>
          <SectionHeading>What We Are Looking For</SectionHeading>
          <div className="space-y-4">
            <BodyText variant="compact">Othering welcomes proposals from London and beyond.</BodyText>
            <BodyText variant="compact">
              We are a curatorial platform working with spaces in transition, activating nomadic and
              site-specific projects that respond directly to context, condition and place.
            </BodyText>
            <BodyText variant="compact">
              We are interested in work that is shaped by where it happens, and what is already there.
            </BodyText>
            <BodyText variant="compact">We encourage submissions including:</BodyText>
            <BulletList
              items={[
                "emerge from a particular place",
                "reveal overlooked stories or hidden structures",
                "create new encounters between people and space",
                "can exist temporarily, quietly, or unexpectedly",
                "understand the city as more than a backdrop",
              ]}
            />
            <BodyText variant="compact">
              Selected projects will be integrated into a 12-week curatorial structure and positioned within a
              network of sites and contexts.
            </BodyText>
            <BodyText variant="compact">
              Each contribution is developed in relation to its environment rather than placed into a
              predefined format.
            </BodyText>
            <BodyText variant="compact">
              <span className="font-medium text-[#1C1C1C]">Participation is limited.</span>
            </BodyText>
            <BodyText variant="compact">
              We are not looking for fixed formats, but for situations.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      {/* How It Works */}
      <SectionBlock spacing="tight" staggerIndex={4} className="!pt-0">
        <div className={CONTENT_W}>
          <SectionHeading>How It Works</SectionHeading>
          <div className="space-y-4">
            <BodyText variant="compact">
              All submissions are reviewed by the curatorial team.
            </BodyText>
            <BodyText variant="compact">
              Selected proposals are integrated into a four-week curatorial structure, forming a distributed
              programme across multiple sites and contexts.
            </BodyText>
            <BodyText variant="compact">
              Each project is positioned in relation to its spatial and temporal conditions, allowing it to
              exist both independently and as part of a wider constellation of work.
            </BodyText>
            <BodyText variant="compact">
              Participation is limited in order to maintain clarity, specificity and sensitivity to each
              context.
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
  );
}
