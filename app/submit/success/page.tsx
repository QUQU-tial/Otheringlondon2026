"use client";

import { SubmitShell } from "../../components/SubmitShell";
import { PageWrapper, Spacer } from "../../components/othering";

export default function SubmitSuccessPage() {
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
            Submission Received
          </h1>
          <Spacer size={24} />
          <div className="flex flex-col gap-4 text-[#1C1C1C]" style={{ fontFamily: "var(--font-inter)", lineHeight: 1.6 }}>
            <p className="text-[clamp(14px,1.1vw,16px)]">Your project is now part of the programme review process.</p>
            <p className="text-[clamp(14px,1.1vw,16px)]">
              We will follow up with the next steps in relation to site and timing.
            </p>
          </div>
        </div>
      </PageWrapper>
    </SubmitShell>
  );
}
