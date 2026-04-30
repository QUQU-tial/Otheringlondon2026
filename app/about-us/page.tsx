"use client";

import {
  PageWrapper,
  SectionBlock,
  LargeTitle,
  BodyText,
} from "../components/othering";
import { StaticSiteShell } from "../components/StaticSiteShell";
import { AboutUsWhiteTopBar } from "../components/AboutUsWhiteTopBar";
import { AboutPhotoWall } from "../components/AboutPhotoWall";

export default function AboutUsPage() {
  return (
    <StaticSiteShell variant="about">
      <div className="flex min-h-full flex-col bg-white">
        <AboutUsWhiteTopBar />
        <div className="flex-1 px-6 pb-10 pt-8 min-[860px]:px-10 min-[860px]:pb-12">
          <PageWrapper className="px-0 sm:px-0">
            {/* Top-align with left “About us” bullet: no SectionBlock top padding */}
            <div className="othering-enter mb-0">
              <LargeTitle as="h1" variant="compact">
                Art Takes Place
              </LargeTitle>
              <p
                className="mt-5 max-w-[48ch] text-[#1C1C1C]"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: "clamp(14px, 1.05vw, 16px)",
                  lineHeight: 1.55,
                }}
              >
                Across the city, through sites, people, and time.
              </p>
              <AboutPhotoWall className="mt-8" />
            </div>

            <SectionBlock spacing="tight" staggerIndex={1} className="!pt-[clamp(28px,5vw,48px)]">
              <div className="max-w-[52ch] space-y-4">
                <BodyText variant="compact">Othering is a curatorial programme developed by SPIRA9.</BodyText>
                <BodyText variant="compact">It unfolds across London through site-responsive projects.</BodyText>
                <BodyText variant="compact">
                  Programmes emerge within existing spaces — from chapels and stations to stairwells and studios.
                </BodyText>
                <BodyText variant="compact">
                  Each project responds to its location, shaping how work is encountered.
                </BodyText>
              </div>
            </SectionBlock>

            <SectionBlock spacing="tight" staggerIndex={2}>
              <BodyText variant="compact" as="p">
                The programme unfolds over a four-week period, from 19 August to 19 September. Projects emerge at
                different moments, distributed across the city over time. The programme develops through location,
                timing, and proximity; each programme operates as a temporary condition within the city.
                Visibility shifts across the city. Places become sites. Access expands through movement.
              </BodyText>
            </SectionBlock>
          </PageWrapper>
        </div>
      </div>
    </StaticSiteShell>
  );
}
