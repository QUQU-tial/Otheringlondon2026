"use client";

import {
  PageWrapper,
  LargeTitle,
  BodyText,
  CTAButton,
  Spacer,
} from "./othering";

export default function SubmissionPage() {
  return (
    <PageWrapper>
      <div className="othering-enter">
        <LargeTitle as="h1">Othering London 2026 — Art Takes Place</LargeTitle>
        <Spacer size={40} />

        <BodyText>Share your work across the city.</BodyText>
        <Spacer size={24} />

        <div className="flex flex-col gap-6">
          <BodyText>
            Othering is a citywide curatorial programme unfolding from 19 August to 19 September.
          </BodyText>
          <BodyText>
            Projects take place across the city, emerging within existing spaces and overlooked conditions.
          </BodyText>
          <BodyText>
            Each contribution becomes part of a wider structure, positioned across specific moments and locations
            within the programme.
          </BodyText>
        </div>

        <Spacer size={100} />

        <h2
          className="font-medium text-[#1C1C1C]"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(16px, 1.15vw, 18px)",
            lineHeight: 1.6,
          }}
        >
          What we are looking for
        </h2>
        <Spacer size={16} />
        <ul
          className="space-y-2 text-[#1C1C1C]"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(14px, 1.1vw, 16px)",
            lineHeight: 1.6,
          }}
        >
          <li>— site-responsive projects</li>
          <li>— works that engage with location</li>
          <li>— practices that unfold beyond fixed exhibition formats</li>
        </ul>

        <Spacer size={100} />

        <h2
          className="font-medium text-[#1C1C1C]"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(16px, 1.15vw, 18px)",
            lineHeight: 1.6,
          }}
        >
          How it works
        </h2>
        <Spacer size={16} />
        <div className="flex flex-col gap-4">
          <BodyText>
            Submissions are reviewed and developed as part of the programme. Selected contributions are assigned a
            specific site and time within the four-week structure.
          </BodyText>
          <BodyText>Participation is limited and distributed across the programme.</BodyText>
        </div>

        <Spacer size={140} />

        <CTAButton href="/submit/transition">Submit</CTAButton>
      </div>
    </PageWrapper>
  );
}
