"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SubmitShell } from "../../components/SubmitShell";
import { PrimaryButton, SecondaryButton } from "../../components/othering";
import {
  isImageUrl,
  stripHtml,
  SUBMIT_FORM_STORAGE_KEY,
  SUBMIT_PREVIEW_SNAPSHOT_KEY,
  type FormState,
} from "../form/form-helpers";

function loadSnapshot(): FormState | null {
  if (typeof window === "undefined") return null;
  try {
    const snap = sessionStorage.getItem(SUBMIT_PREVIEW_SNAPSHOT_KEY);
    if (snap) {
      return JSON.parse(snap) as FormState;
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem(SUBMIT_FORM_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FormState;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function SubmitPreviewPage() {
  const [data, setData] = useState<FormState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setData(loadSnapshot());
  }, []);

  return (
    <SubmitShell>
      <div className="mx-auto w-full max-w-[874px] px-[36px] py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1
            className="font-medium tracking-tight text-[#1C1C1C]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.15,
            }}
          >
            Preview
          </h1>
          <SecondaryButton href="/submit/form">Back to form</SecondaryButton>
        </div>

        {!mounted ? (
          <p className="text-sm text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
            Loading…
          </p>
        ) : !data ? (
          <div className="rounded border border-black/15 bg-black/[0.03] p-8">
            <p className="mb-6 text-[15px] leading-relaxed text-[#1C1C1C]" style={{ fontFamily: "var(--font-inter)" }}>
              No draft found yet. Fill in the submission form and use Preview again, or click Save draft first.
            </p>
            <PrimaryButton href="/submit/form">Go to form</PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <section>
              <h2
                className="mb-4 border-b border-black pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-black/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Basic Info
              </h2>
              <dl className="grid gap-3 text-[15px]" style={{ fontFamily: "var(--font-inter)" }}>
                <div>
                  <dt className="text-black/50">Name</dt>
                  <dd className="text-[#1C1C1C]">
                    {data.first_name} {data.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-black/50">Username</dt>
                  <dd className="text-[#1C1C1C]">{data.username || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/50">Organisation</dt>
                  <dd className="text-[#1C1C1C]">{data.organization_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/50">Email</dt>
                  <dd className="text-[#1C1C1C]">{data.email || "—"}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2
                className="mb-4 border-b border-black pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-black/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                About the Event
              </h2>
              <dl className="grid gap-4 text-[15px]" style={{ fontFamily: "var(--font-inter)" }}>
                <div>
                  <dt className="text-black/50">Title</dt>
                  <dd className="font-medium text-[#1C1C1C]">{data.activity_title || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/50">Author / credit</dt>
                  <dd className="text-[#1C1C1C]">{data.author_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/50">Type</dt>
                  <dd className="text-[#1C1C1C]">{data.activity_type || "—"}</dd>
                </div>
                <div>
                  <dt className="text-black/50">Description</dt>
                  <dd className="text-[#1C1C1C]">
                    {stripHtml(data.activity_description) ? (
                      <div
                        className="text-[15px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: data.activity_description }}
                      />
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-black/50">Location & date</dt>
                  <dd className="text-[#1C1C1C]">
                    {data.activity_location || "—"} · {data.activity_date || "—"}
                  </dd>
                </div>
                {isImageUrl(data.primary_image) ? (
                  <div>
                    <dt className="mb-2 text-black/50">Primary image</dt>
                    <dd>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.primary_image!}
                        alt={data.primary_image_alt || ""}
                        className="max-h-64 rounded border border-black/10 object-contain"
                      />
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-black/50">Website</dt>
                  <dd className="break-all text-[#1C1C1C]">{data.website_link || "—"}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2
                className="mb-4 border-b border-black pb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-black/55"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Links / Media
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-[15px] text-[#1C1C1C]" style={{ fontFamily: "var(--font-inter)" }}>
                {data.additional_media_links?.filter((m) => m.media_name?.trim() || m.media_link?.trim()).length ?
                  data.additional_media_links
                    .filter((m) => m.media_name?.trim() || m.media_link?.trim())
                    .map((m, i) => (
                      <li key={i}>
                        {m.media_name}: {m.media_link}
                      </li>
                    ))
                : <li className="text-black/50">No extra media links</li>}
              </ul>
            </section>

            <div className="pt-4">
              <Link href="/submit/form" className="text-[14px] underline text-[#1C1C1C]" style={{ fontFamily: "var(--font-inter)" }}>
                ← Edit on submission form
              </Link>
            </div>
          </div>
        )}
      </div>
    </SubmitShell>
  );
}
