"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitShell } from "../../components/SubmitShell";
import { PrimaryButton, SecondaryButton } from "../../components/othering";
import { getCurrentUser, onAuthStateChange, type User } from "../../lib/auth";
import { uploadImageToSupabase } from "../../lib/supabase";
import { isImageUrl } from "../../submit/form/form-helpers";
import {
  emptyArtistJoinForm,
  emptyLinkedDraft,
  formToArtist,
  isArtistJoinValid,
  loadJoinFormForGuest,
  loadJoinFormForUser,
  publishArtistRemote,
  saveArtistJoinDraft,
  saveSubmittedArtist,
  type ArtistJoinForm,
  type ArtistJoinTab,
  type ArtistLinkedDraft,
} from "../../lib/artist-submissions";

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

function DraftSavedModal({ onOk, signedIn }: { onOk: () => void; signedIn: boolean }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
      <div className="w-full max-w-[400px] border border-black bg-white p-[24px]">
        <h2 className="mb-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", fontWeight: 500 }}>
          Draft saved
        </h2>
        <p className="mb-[24px] text-black/80" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
          {signedIn
            ? "Your form is saved to this account. You can keep editing anytime."
            : "Your form is saved on this device. Log in when you are ready to publish."}
        </p>
        <PrimaryButton type="button" onClick={onOk}>
          OK
        </PrimaryButton>
      </div>
    </div>
  );
}

function LoginToPublishModal({
  onLogin,
  onCancel,
}: {
  onLogin: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
      <div className="w-full max-w-[420px] border border-black bg-white p-[24px]">
        <h2 className="mb-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", fontWeight: 500 }}>
          Log in to publish
        </h2>
        <p className="mb-[24px] text-black/80" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
          Your form is saved. Sign in or create an account, then return here and click Publish to publish your artist page.
        </p>
        <div className="flex flex-wrap gap-[12px]">
          <PrimaryButton type="button" onClick={onLogin}>
            Login
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onCancel}>
            Keep editing
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function PublishSuccessModal({
  slug,
  onStay,
}: {
  slug: string;
  onStay: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
      <div className="w-full max-w-[420px] border border-black bg-white p-[24px]">
        <h2 className="mb-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", fontWeight: 500 }}>
          Published
        </h2>
        <p className="mb-[24px] text-black/80" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
          Your artist page is live in the artists directory. You can keep editing this form and click Publish again anytime to update it.
        </p>
        <div className="flex flex-wrap gap-[12px]">
          <PrimaryButton href={`/artists/${slug}`}>View your page</PrimaryButton>
          <SecondaryButton type="button" onClick={onStay}>
            Keep editing
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

export default function ArtistJoinPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [form, setForm] = useState<ArtistJoinForm>(() => emptyArtistJoinForm());
  const [formReady, setFormReady] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedOpen, setDraftSavedOpen] = useState(false);
  const [loginToPublishOpen, setLoginToPublishOpen] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const current = await Promise.race([
          getCurrentUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
        ]);
        if (cancelled) return;
        setUser(current);
        setAuthReady(true);
        setForm(current ? loadJoinFormForUser(current.id) : loadJoinFormForGuest());
        setFormReady(true);
      } catch {
        if (cancelled) return;
        setUser(null);
        setAuthReady(true);
        setForm(loadJoinFormForGuest());
        setFormReady(true);
      }
    };
    void load();
    const unsubscribe = onAuthStateChange((next) => {
      setUser(next);
      if (next) {
        setForm(loadJoinFormForUser(next.id));
        setFormReady(true);
        return;
      }
      setForm(loadJoinFormForGuest());
      setFormReady(true);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Autosave while editing (guest device draft or account draft)
  useEffect(() => {
    if (!formReady) return;
    const timer = window.setTimeout(() => {
      try {
        saveArtistJoinDraft(form, user?.id ?? null);
      } catch {
        /* quota */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form, formReady, user]);

  const setTab = (tab: ArtistJoinTab) => setForm((p) => ({ ...p, activeTab: tab }));

  const persistDraft = useCallback(
    (next: ArtistJoinForm) => {
      try {
        saveArtistJoinDraft(next, user?.id ?? null);
      } catch {
        /* quota */
      }
    },
    [user]
  );

  const goToLoginForPublish = () => {
    persistDraft(form);
    sessionStorage.setItem("returnTo", "/artists/join");
    setLoginToPublishOpen(false);
    router.push("/login?returnTo=%2Fartists%2Fjoin");
  };

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

  const handleSubmit = async () => {
    if (!isArtistJoinValid(form)) return;
    if (!user) {
      persistDraft(form);
      setLoginToPublishOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      const artist = formToArtist(form);
      if (!artist) return;
      // Local directory update is the source of truth for the public page.
      saveSubmittedArtist(artist, user.id);
      persistDraft(form);
      setSubmittedSlug(artist.slug);
      setSubmitSuccessOpen(true);
      // Remote sync is best-effort and must not block re-publish.
      void publishArtistRemote(artist, user.id);
    } catch (e) {
      console.error("Artist submit failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = isArtistJoinValid(form);

  if (!authReady || !formReady) {
    return (
      <SubmitShell>
        <div className="mx-auto w-full max-w-[874px] px-0 py-[36px]">
          <p className="text-black/60" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
            Loading…
          </p>
        </div>
      </SubmitShell>
    );
  }

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
        <p className="mb-[12px]">
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
        <p
          className="mb-[36px] text-[13px] text-black/55"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {user
            ? `Signed in as ${user.email || "artist"}. Fill in your profile, then click Publish. You can publish again anytime to update your page.`
            : "Fill in your artist profile first. You will be asked to log in when you publish."}
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
            if (form.activeTab === 2) void handleSubmit();
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
                  placeholder="Your name"
                />
              </FormRow>
              <FormRow label="Birth">
                <input
                  type="text"
                  value={form.birth}
                  onChange={(e) => setForm((p) => ({ ...p, birth: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. b. 1990, London"
                />
              </FormRow>
              <FormRow label="Field">
                <input
                  type="text"
                  value={form.field}
                  onChange={(e) => setForm((p) => ({ ...p, field: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Painter / sculptor / filmmaker"
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
                  placeholder="Write a short biography about your practice"
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
              <PrimaryButton type="button" disabled={submitting || !canSubmit} onClick={() => void handleSubmit()}>
                {submitting ? "Publishing…" : "Publish"}
              </PrimaryButton>
            )}
          </div>
        </form>
      </div>

      {draftSavedOpen ? (
        <DraftSavedModal signedIn={Boolean(user)} onOk={() => setDraftSavedOpen(false)} />
      ) : null}
      {loginToPublishOpen ? (
        <LoginToPublishModal onLogin={goToLoginForPublish} onCancel={() => setLoginToPublishOpen(false)} />
      ) : null}
      {submitSuccessOpen && submittedSlug ? (
        <PublishSuccessModal slug={submittedSlug} onStay={() => setSubmitSuccessOpen(false)} />
      ) : null}
    </SubmitShell>
  );
}
