"use client";

import { SubmitShell } from "../../components/SubmitShell";
import { PageWrapper, CTAButton, Spacer } from "../../components/othering";

export default function SubmitTransitionPage() {
  return (
    <SubmitShell>
      <PageWrapper>
        <div className="othering-enter">
          <h1
            className="font-medium tracking-tight text-[#1C1C1C]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(48px, 6vw, 72px)",
              lineHeight: 1.08,
            }}
          >
            Submit
          </h1>
          <Spacer size={32} />

          <div className="flex flex-col gap-4 text-[#1C1C1C]" style={{ fontFamily: "var(--font-inter)", lineHeight: 1.6 }}>
            <p className="text-[clamp(14px,1.1vw,16px)]">Your project will be positioned within the programme.</p>
            <p className="text-[clamp(14px,1.1vw,16px)]">
              Each submission is reviewed in relation to site, timing, and context.
            </p>
            <p className="text-[clamp(14px,1.1vw,16px)]">
              The current programme runs from 19 August to 19 September.
            </p>
          </div>

          <Spacer size={80} />
          <CTAButton href="/submit/form">Continue</CTAButton>
        </div>
      </PageWrapper>
    </SubmitShell>
  );
}
