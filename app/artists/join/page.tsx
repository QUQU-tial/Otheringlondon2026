"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitShell } from "../../components/SubmitShell";
import { PrimaryButton, SecondaryButton } from "../../components/othering";
import { uploadImageToSupabase } from "../../lib/supabase";
import { isImageUrl } from "../../submit/form/form-helpers";
import {
  emptyArtistJoinForm,
  emptyLinkedDraft,
  formToArtist,
  isArtistJoinValid,
  loadArtistJoinDraft,
  saveArtistJoinDraft,
  saveSubmittedArtist,
  type ArtistJoinForm,
  type ArtistJoinTab,
  type ArtistLinkedDraft,
} from "../../lib/artist-submissions";
import type { ArtistWork } from "../../lib/artists";

/** Example profile for join-form preview (photo + bio + CV + exhibitions). */
const PREVIEW_ARTIST_HREF = "/artists/helen-cammock";

const TAB_LABELS = ["Basic Info", "CV / Exhibitions", "Press / Talks / Works"] as const;

const inputCls =
  "w-full rounded-[2px] border border-black/20 bg-white px-3 py-2 text-[15px] text-[#1C1C1C] placeholder:text-black/35 focus:border-black focus:outline-none";

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-black/10 py-4 min-[640px]:grid-cols-[200px_1fr] min-[640px]:items-start">
      <div
        className="pt-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#1C1C1C]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function LinkedEntryFields({
  rows,
  onChange,
  addLabel,
}: {
  rows: ArtistLinkedDraft[];
  onChange: (next: ArtistLinkedDraft[]) => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-[12px]">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-col gap-2 border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
          <input
            type="text"
            value={row.year}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, year: e.target.value };
              onChange(next);
            }}
            className={inputCls}
            placeholder="Year"
          />
          <input
            type="text"
            value={row.title}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, title: e.target.value };
              onChange(next);
            }}
            className={inputCls}
            placeholder="Title"
          />
          <input
            type="text"
            value={row.detail}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, detail: e.target.value };
              onChange(next);
            }}
            className={inputCls}
            placeholder="Venue / publication"
          />
          <input
            type="url"
            value={row.href}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, href: e.target.value };
              onChange(next);
            }}
            className={inputCls}
            placeholder="https://"
          />
        </div>
      ))}
      <button
        type="button"
        className="self-start px-[12px] py-[8px] text-left text-black hover:bg-black/5"
        style={{ fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 500, lineHeight: "16px" }}
        onClick={() => onChange([...rows, emptyLinkedDraft()])}
      >
        {addLabel}
      </button>
    </div>
  );
}

function SuccessModal({
  title,
  body,
  onOk,
}: {
  title: string;
  body: string;
  onOk: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
      <div className="w-full max-w-[400px] border border-black bg-white p-[24px]">
        <h2 className="mb-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", fontWeight: 500 }}>
          {title}
        </h2>
        <p className="mb-[24px] text-black/80" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
          {body}
        </p>
        <PrimaryButton type="button" onClick={onOk}>
          OK
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function ArtistJoinPage() {
  const router = useRouter();
  const [form, setForm] = useState<ArtistJoinForm>(() => emptyArtistJoinForm());
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedOpen, setDraftSavedOpen] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadArtistJoinDraft();
    if (draft) setForm(draft);
  }, []);

  const setTab = (tab: ArtistJoinTab) => setForm((p) => ({ ...p, activeTab: tab }));

  const persistDraft = useCallback((next: ArtistJoinForm) => {
    try {
      saveArtistJoinDraft(next);
    } catch {
      /* quota */
    }
  }, []);

  const handleSaveDraft = () => {
    setSavingDraft(true);
    persistDraft(form);
    setSavingDraft(false);
    setDraftSavedOpen(true);
  };

  const handleImageUpload = async (file: File | undefined, kind: "photo" | "work") => {
    if (!file) return;
    const url = await uploadImageToSupabase(file, "images/artists");
    if (!url || !isImageUrl(url)) return;
    setForm((p) => {
      if (kind === "photo") return { ...p, photo: url };
      if (p.works.length >= 5) return p;
      return { ...p, works: [...p.works, { src: url, alt: p.name || "Work" }] };
    });
  };

  const handleSubmit = () => {
    if (!isArtistJoinValid(form)) return;
    setSubmitting(true);
    const artist = formToArtist(form);
    if (!artist) {
      setSubmitting(false);
      return;
    }
    try {
      saveSubmittedArtist(artist);
      persistDraft(form);
      setSubmittedSlug(artist.slug);
      setSubmitSuccessOpen(true);
    } catch (e) {
      console.error("Artist submit failed", e);
    }
    setSubmitting(false);
  };

  const canSubmit = isArtistJoinValid(form);

  return (
    <SubmitShell>
      <div className="mx-auto w-full max-w-[874px] px-0 py-[36px]">
        <h1
          className="mb-[12px] capitalize text-black"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(40px, 4.17vw, 60px)",
            fontWeight: 500,
            lineHeight: "clamp(40px, 4.17vw, 60px)",
            letterSpacing: "-4.8px",
          }}
        >
          Join
        </h1>
        <p className="mb-[36px]">
          <Link
            href={PREVIEW_ARTIST_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[8px] text-[#1C1C1C] underline decoration-black/30 underline-offset-4 transition-opacity hover:opacity-70 hover:decoration-black"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(16px, 1.39vw, 20px)",
              fontWeight: 500,
              lineHeight: "clamp(24px, 2.08vw, 30px)",
            }}
          >
            Preview — see artist page
            <span aria-hidden>↗</span>
          </Link>
        </p>

        <div className="mb-[24px] flex gap-[16px] border-b border-black">
          {TAB_LABELS.map((label, i) => {
            const active = form.activeTab === i;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setTab(i as ArtistJoinTab)}
                className={`pb-[8px] text-[16px] leading-6 ${active ? "border-b-2 border-black text-black" : "text-black/50"}`}
                style={{ fontFamily: "var(--font-inter)", fontWeight: 500, marginBottom: "-1px" }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.activeTab === 2) handleSubmit();
          }}
        >
          {form.activeTab === 0 ? (
            <div>
              <FormRow label="Artist name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Full name"
                />
              </FormRow>
              <FormRow label="Birth">
                <input
                  type="text"
                  value={form.birth}
                  onChange={(e) => setForm((p) => ({ ...p, birth: e.target.value }))}
                  className={inputCls}
                  placeholder="b. 1990, London"
                />
              </FormRow>
              <FormRow label="Field">
                <input
                  type="text"
                  value={form.field}
                  onChange={(e) => setForm((p) => ({ ...p, field: e.target.value }))}
                  className={inputCls}
                  placeholder="Oil painter"
                />
              </FormRow>
              <FormRow label="Photo">
                <input
                  type="file"
                  accept="image/*"
                  className="mb-2 text-[14px]"
                  onChange={(e) => void handleImageUpload(e.target.files?.[0], "photo")}
                />
                <p className="mb-2 text-[12px] leading-4 text-black/70" style={{ fontFamily: "var(--font-inter)" }}>
                  Optional. Portrait or studio image.
                </p>
                {form.photo && isImageUrl(form.photo) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo} alt="" className="h-[180px] w-full object-cover" />
                ) : null}
              </FormRow>
              <FormRow label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className={`${inputCls} min-h-[180px]`}
                  placeholder="Short biography"
                />
              </FormRow>
            </div>
          ) : null}

          {form.activeTab === 1 ? (
            <div>
              <FormRow label="CV">
                <LinkedEntryFields
                  rows={form.cv}
                  onChange={(cv) => setForm((p) => ({ ...p, cv }))}
                  addLabel="Add CV row"
                />
              </FormRow>
              <FormRow label="Exhibitions">
                <LinkedEntryFields
                  rows={form.exhibitions}
                  onChange={(exhibitions) => setForm((p) => ({ ...p, exhibitions }))}
                  addLabel="Add exhibition"
                />
              </FormRow>
            </div>
          ) : null}

          {form.activeTab === 2 ? (
            <div>
              <FormRow label="Press">
                <LinkedEntryFields
                  rows={form.press}
                  onChange={(press) => setForm((p) => ({ ...p, press }))}
                  addLabel="Add press row"
                />
              </FormRow>
              <FormRow label="Talks">
                <LinkedEntryFields
                  rows={form.talks}
                  onChange={(talks) => setForm((p) => ({ ...p, talks }))}
                  addLabel="Add talk"
                />
              </FormRow>
              <FormRow label="Works">
                <input
                  type="file"
                  accept="image/*"
                  className="mb-2 text-[14px]"
                  disabled={form.works.length >= 5}
                  onChange={(e) => void handleImageUpload(e.target.files?.[0], "work")}
                />
                <p className="mb-2 text-[12px] leading-4 text-black/70" style={{ fontFamily: "var(--font-inter)" }}>
                  Optional. Up to 5 exhibition or artwork images.
                </p>
                <div className="flex flex-wrap gap-[12px]">
                  {form.works.map((work, i) =>
                    isImageUrl(work.src) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`${work.src}-${i}`} src={work.src} alt="" className="h-[88px] w-[88px] object-cover" />
                    ) : null
                  )}
                </div>
              </FormRow>
              <FormRow label="Terms" required>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.accept_terms}
                    onChange={(e) => setForm((p) => ({ ...p, accept_terms: e.target.checked }))}
                    className="mt-1 h-4 w-4 shrink-0 border border-black"
                  />
                  <span className="text-[14px] leading-5 text-black/80" style={{ fontFamily: "var(--font-inter)" }}>
                    I confirm that: (1) I have the rights to submit and display the uploaded materials and grant use for
                    exhibition and promotion with credit; (2) the information is accurate; (3) content may be edited
                    for formatting; (4) acceptance is not guaranteed; (5) I agree to be contacted about my submission.
                  </span>
                </label>
              </FormRow>
            </div>
          ) : null}

          <div className="mt-[36px] flex flex-wrap items-center gap-[16px]">
            <SecondaryButton type="button" onClick={handleSaveDraft} disabled={savingDraft}>
              {savingDraft ? "Saving" : "Save Draft"}
            </SecondaryButton>
            {form.activeTab !== 0 ? (
              <button
                type="button"
                onClick={() => setTab((form.activeTab - 1) as ArtistJoinTab)}
                className="inline-flex shrink-0 items-center justify-center bg-transparent px-[24px] py-[4px] font-medium uppercase text-black transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(16px, 1.39vw, 20px)",
                  lineHeight: "clamp(24px, 2.08vw, 30px)",
                }}
              >
                Back
              </button>
            ) : null}
            {form.activeTab < 2 ? (
              <PrimaryButton type="button" onClick={() => setTab((form.activeTab + 1) as ArtistJoinTab)}>
                Next
              </PrimaryButton>
            ) : (
              <PrimaryButton type="button" disabled={submitting || !canSubmit} onClick={handleSubmit}>
                {submitting ? "Sending" : "Submit"}
              </PrimaryButton>
            )}
          </div>
        </form>
      </div>

      {draftSavedOpen ? (
        <SuccessModal title="Success" body="Upload successful" onOk={() => setDraftSavedOpen(false)} />
      ) : null}
      {submitSuccessOpen ? (
        <SuccessModal
          title="Success"
          body="Upload successful"
          onOk={() => {
            setSubmitSuccessOpen(false);
            if (submittedSlug) router.push(`/artists/${submittedSlug}`);
          }}
        />
      ) : null}
    </SubmitShell>
  );
}
