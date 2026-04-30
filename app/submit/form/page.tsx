"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitShell } from "../../components/SubmitShell";
import { PrimaryButton, SecondaryButton } from "../../components/othering";
import RichTextEditor from "../../components/RichTextEditor";
import { getCurrentUser, isSignupDuplicateEmailError, signUp } from "../../lib/auth";
import { getCurrentProfile, lockUsername } from "../../lib/profiles";
import { saveSubmission, getSubmissions } from "../../lib/storage";
import { uploadImageToSupabase } from "../../lib/supabase";
import {
  emptyForm,
  formToSubmission,
  isFormValidForSubmit,
  isImageUrl,
  migrateV1Local,
  OLD_SUBMIT_FORM_STORAGE_KEY,
  submissionRowToForm,
  SUBMIT_FORM_STORAGE_KEY,
  SUBMIT_PREVIEW_SNAPSHOT_KEY,
  type FormState,
  type TabIndex,
} from "./form-helpers";

const PENDING_AUTH_KEY = "othering_submit_after_auth";

const TAB_LABELS = ["Basic Info", "About the Event", "Links / Media"] as const;

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

export default function SubmitFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authFieldsLocked, setAuthFieldsLocked] = useState(false);
  const [identityLocked, setIdentityLocked] = useState(false);
  const [draftSavedOpen, setDraftSavedOpen] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [signupExistsOpen, setSignupExistsOpen] = useState(false);
  const [signupNeedsLoginOpen, setSignupNeedsLoginOpen] = useState(false);
  const [signupSuccessOpen, setSignupSuccessOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  /** Loaded row was already live on homepage — resubmit updates in place as published */
  const [isPublishedRecord, setIsPublishedRecord] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm());

  const recordIdRef = useRef<string | null>(null);
  const createdAtRef = useRef<string>(new Date().toISOString());
  const hydratedRef = useRef(false);
  const skipNextAutosaveRef = useRef(true);

  const persistDraft = useCallback(async () => {
    if (!hydratedRef.current || skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    const user = await getCurrentUser();
    if (!user?.email) {
      try {
        localStorage.setItem(SUBMIT_FORM_STORAGE_KEY, JSON.stringify(form));
      } catch {
        /* quota */
      }
      return;
    }

    const profile = await getCurrentProfile();
    const emailLocal = user.email.split("@")[0] ?? "contributor";
    const derived =
      emailLocal.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || `user_${user.id.slice(0, 8)}`;
    const usernameResolved = form.username.trim() || profile?.username || derived;

    const id = recordIdRef.current ?? `submission_${Date.now()}`;
    recordIdRef.current = id;

    const submission = formToSubmission(form, {
      id,
      ownerId: user.id,
      createdAt: createdAtRef.current,
      status: isPublishedRecord ? "published" : "draft",
      is_locked: isPublishedRecord,
      email: user.email ?? form.email,
      role: "partner",
    });

    try {
      await saveSubmission(submission);
      try {
        localStorage.removeItem(SUBMIT_FORM_STORAGE_KEY);
        localStorage.removeItem(OLD_SUBMIT_FORM_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error("Draft save failed:", e);
    }
  }, [form, isPublishedRecord]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (cancelled) return;
      setLoggedIn(!!u?.email);
      setAuthFieldsLocked(!!u?.email);

      const applyPartial = (p: Partial<FormState>) => {
        setForm((prev) => ({ ...prev, ...p }));
      };

      if (u?.email) {
        const pendingRaw = typeof window !== "undefined" ? sessionStorage.getItem(PENDING_AUTH_KEY) : null;
        if (pendingRaw) {
          try {
            const parsed = JSON.parse(pendingRaw) as FormState & { createdAt?: string };
            const { createdAt: c, ...rest } = parsed;
            setForm({
              ...emptyForm(),
              ...rest,
              activeTab: (parsed.activeTab as TabIndex) ?? 2,
            });
            if (c) createdAtRef.current = c;
            sessionStorage.removeItem(PENDING_AUTH_KEY);
            setIsPublishedRecord(false);
          } catch {
            sessionStorage.removeItem(PENDING_AUTH_KEY);
          }
        }

        if (!pendingRaw) {
          const list = await getSubmissions({ includeDrafts: true, userId: u.id });
          const draft = list.find((s) => s.status === "draft");
          const pending = list
            .filter((s) => s.status === "pending_review")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const published = list
            .filter((s) => s.status === "published")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const row = draft ?? pending ?? published ?? null;

          if (row) {
            recordIdRef.current = row.id;
            createdAtRef.current = row.createdAt;
            setForm(submissionRowToForm(row));
            setIdentityLocked(!!row.is_locked);
            setIsPublishedRecord(row.status === "published");
          } else {
            setIsPublishedRecord(false);
            try {
              const rawV2 = localStorage.getItem(SUBMIT_FORM_STORAGE_KEY);
              if (rawV2) {
                const parsed = JSON.parse(rawV2) as FormState;
                applyPartial({ ...emptyForm(), ...parsed });
              } else {
                const rawV1 = localStorage.getItem(OLD_SUBMIT_FORM_STORAGE_KEY);
                if (rawV1) {
                  const parsed = JSON.parse(rawV1) as Record<string, unknown>;
                  applyPartial({ ...emptyForm(), ...migrateV1Local(parsed) });
                }
              }
            } catch {
              /* ignore */
            }

            const profile = await getCurrentProfile();
            setForm((prev) => ({
              ...prev,
              email: u.email ?? prev.email,
              username: prev.username || profile?.username || prev.username,
              first_name: prev.first_name || (u.email?.split("@")[0] ?? ""),
            }));
            setIsPublishedRecord(false);
          }
        } else {
          setForm((prev) => ({
            ...prev,
            email: u.email ?? prev.email,
          }));
          const profile = await getCurrentProfile();
          if (profile?.username) setIdentityLocked(true);
          setIsPublishedRecord(false);
        }
      } else {
        try {
          const rawV2 = localStorage.getItem(SUBMIT_FORM_STORAGE_KEY);
          if (rawV2) {
            const parsed = JSON.parse(rawV2) as FormState;
            setForm({ ...emptyForm(), ...parsed });
          } else {
            const rawV1 = localStorage.getItem(OLD_SUBMIT_FORM_STORAGE_KEY);
            if (rawV1) {
              const parsed = JSON.parse(rawV1) as Record<string, unknown>;
              setForm({ ...emptyForm(), ...migrateV1Local(parsed) });
            }
          }
        } catch {
          /* ignore */
        }
      }

      hydratedRef.current = true;
      skipNextAutosaveRef.current = true;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !hydratedRef.current) return;
    const t = window.setTimeout(() => {
      void persistDraft();
    }, 750);
    return () => window.clearTimeout(t);
  }, [loading, form, persistDraft]);

  const setTab = (tab: TabIndex) => setForm((p) => ({ ...p, activeTab: tab }));

  const handleSaveDraftClick = async () => {
    setSavingDraft(true);
    skipNextAutosaveRef.current = false;
    try {
      await persistDraft();
      setDraftSavedOpen(true);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleImagePrimary = async (file: File | null) => {
    if (!file) return;
    const url = await uploadImageToSupabase(file, "images/activities");
    if (url) setForm((p) => ({ ...p, primary_image: url }));
  };

  const handleImageAdd1 = async (file: File | null) => {
    if (!file) return;
    const url = await uploadImageToSupabase(file, "images/activities");
    if (url) setForm((p) => ({ ...p, additional_images_1: url }));
  };

  const handleImageAdd2 = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls: string[] = [];
    const max = Math.min(3, files.length);
    for (let i = 0; i < max; i++) {
      const url = await uploadImageToSupabase(files[i]!, "images/activities");
      if (url) urls.push(url);
    }
    setForm((p) => ({
      ...p,
      additional_images_2: urls,
      additional_images_2_alt: urls.map((_, i) => p.additional_images_2_alt[i] ?? ""),
    }));
  };

  const runFinalSubmit = async () => {
    if (!isFormValidForSubmit(form)) return;

    const user = await getCurrentUser();
    if (!user?.email) {
      sessionStorage.setItem(PENDING_AUTH_KEY, JSON.stringify({ ...form, createdAt: createdAtRef.current }));
      try {
        localStorage.setItem(SUBMIT_FORM_STORAGE_KEY, JSON.stringify(form));
      } catch {
        /* ignore */
      }
      router.push("/signup?returnTo=%2Fsubmit%2Fform");
      return;
    }

    setSubmitting(true);
    try {
      const profile = await getCurrentProfile();
      const emailLocal = user.email.split("@")[0] ?? "contributor";
      const derived =
        emailLocal.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || `user_${user.id.slice(0, 8)}`;
      const usernameResolved = form.username.trim() || profile?.username || derived;

      const id = recordIdRef.current ?? `submission_${Date.now()}`;
      recordIdRef.current = id;

      const submission = formToSubmission(form, {
        id,
        ownerId: user.id,
        createdAt: createdAtRef.current,
        status: isPublishedRecord ? "published" : "pending_review",
        is_locked: true,
        email: user.email,
        role: "partner",
      });

      await saveSubmission(submission);

      if (!profile?.username) {
        await lockUsername(user.id, usernameResolved);
      }

      try {
        localStorage.removeItem(SUBMIT_FORM_STORAGE_KEY);
        localStorage.removeItem(OLD_SUBMIT_FORM_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setSubmitSuccessOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const syncPreviewSnapshot = () => {
    try {
      sessionStorage.setItem(SUBMIT_PREVIEW_SNAPSHOT_KEY, JSON.stringify(form));
      localStorage.setItem(SUBMIT_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  };

  const handleInlineSignUp = async () => {
    setPasswordError(null);
    const email = form.email.trim();
    if (!email) {
      setPasswordError("Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSigningUp(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (isSignupDuplicateEmailError(error)) {
          setSignupExistsOpen(true);
        } else {
          setPasswordError(error.message || "Could not create account.");
        }
        return;
      }

      // If email confirmation is enabled, session may be missing; require login to continue submission.
      const u = await getCurrentUser();
      if (u?.email) {
        setLoggedIn(true);
        setAuthFieldsLocked(true);
        setSignupSuccessOpen(true);
      } else {
        setSignupNeedsLoginOpen(true);
      }
    } finally {
      setSigningUp(false);
    }
  };

  const lockedCls = identityLocked ? "opacity-50 pointer-events-none" : "";

  if (loading) {
    return (
      <SubmitShell>
        <div className="mx-auto max-w-[874px] px-[36px]">
          <p className="text-sm text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
            Loading…
          </p>
        </div>
      </SubmitShell>
    );
  }

  return (
    <SubmitShell>
      <div className="mx-auto w-full max-w-[874px] px-[36px] py-8">
        <div className="othering-enter">
          <h1
            className="font-medium tracking-tight text-[#1C1C1C]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(40px, 5vw, 56px)",
              lineHeight: 1.08,
              marginBottom: "clamp(24px, 3vw, 40px)",
            }}
          >
            Submission form
          </h1>

          {!loggedIn ? (
            <p
              className="mb-8 max-w-[52ch] text-[clamp(13px,1vw,15px)] leading-[1.6] text-[#1C1C1C]/75"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              You can work through all tabs without an account; your draft is saved on this device. Submit on the final
              tab sends you to sign up or log in to complete delivery.
            </p>
          ) : null}

          {/* Tabs */}
          <div className="mb-8 flex flex-wrap gap-4 border-b border-black">
            {TAB_LABELS.map((label, i) => {
              const idx = i as TabIndex;
              const active = form.activeTab === idx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTab(idx)}
                  className={`border-b-2 pb-2 text-[16px] font-medium leading-6 transition-opacity ${
                    active ? "border-black text-black" : "border-transparent text-black/50"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col"
          >
            {/* TAB 0 */}
            {form.activeTab === 0 ? (
              <div className="flex flex-col">
                <FormRow label="First name" required>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                    className={`${inputCls} ${lockedCls}`}
                    disabled={identityLocked}
                    autoComplete="given-name"
                  />
                </FormRow>
                <FormRow label="Last name" required>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                    className={`${inputCls} ${lockedCls}`}
                    disabled={identityLocked}
                    autoComplete="family-name"
                  />
                </FormRow>
                <FormRow label="Username" required>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    className={`${inputCls} ${lockedCls} ${(loggedIn || authFieldsLocked) ? "opacity-50" : ""}`}
                    disabled={identityLocked || loggedIn || authFieldsLocked}
                    autoComplete="username"
                  />
                </FormRow>
                <FormRow label="Organisation">
                  <input
                    type="text"
                    value={form.organization_name}
                    onChange={(e) => setForm((p) => ({ ...p, organization_name: e.target.value }))}
                    className={inputCls}
                    autoComplete="organization"
                  />
                </FormRow>
                <FormRow label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={inputCls}
                    disabled={loggedIn || authFieldsLocked}
                    autoComplete="email"
                  />
                </FormRow>
                <FormRow label="Password" required>
                  <input
                    type="password"
                    value={loggedIn || authFieldsLocked ? "********" : password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} ${(loggedIn || authFieldsLocked) ? "opacity-50 pointer-events-none" : ""}`}
                    disabled={loggedIn || authFieldsLocked}
                    autoComplete={loggedIn || authFieldsLocked ? "current-password" : "new-password"}
                    minLength={6}
                  />
                </FormRow>
                <FormRow label="Confirm password" required>
                  <input
                    type="password"
                    value={loggedIn || authFieldsLocked ? "********" : confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputCls} ${(loggedIn || authFieldsLocked) ? "opacity-50 pointer-events-none" : ""}`}
                    disabled={loggedIn || authFieldsLocked}
                    autoComplete={loggedIn || authFieldsLocked ? "current-password" : "new-password"}
                    minLength={6}
                  />
                  {passwordError && !(loggedIn || authFieldsLocked) ? (
                    <p className="mt-2 text-[13px] text-black/60" style={{ fontFamily: "var(--font-inter)" }}>
                      {passwordError}
                    </p>
                  ) : null}
                </FormRow>
                <FormRow label="Student">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_student}
                      onChange={(e) => setForm((p) => ({ ...p, is_student: e.target.checked }))}
                      className="mt-1 h-4 w-4 border border-black"
                    />
                    <span className="text-[14px] leading-5 text-black/80" style={{ fontFamily: "var(--font-inter)" }}>
                      I am a student (optional). If so, email proof to info@spira9.art with subject:
                      name_spira9_student_application
                    </span>
                  </label>
                </FormRow>
              </div>
            ) : null}

            {/* TAB 1 */}
            {form.activeTab === 1 ? (
              <div className="flex flex-col">
                <FormRow label="Activity title" required>
                  <input
                    type="text"
                    value={form.activity_title}
                    onChange={(e) => setForm((p) => ({ ...p, activity_title: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Author / credit name" required>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Activity type" required>
                  <input
                    type="text"
                    value={form.activity_type}
                    onChange={(e) => setForm((p) => ({ ...p, activity_type: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. exhibition, performance, workshop"
                  />
                </FormRow>
                <FormRow label="Activity description" required>
                  <RichTextEditor
                    value={form.activity_description}
                    onChange={(html) => setForm((p) => ({ ...p, activity_description: html }))}
                    placeholder="Describe the activity…"
                  />
                </FormRow>
                <FormRow label="Location" required>
                  <input
                    type="text"
                    value={form.activity_location}
                    onChange={(e) => setForm((p) => ({ ...p, activity_location: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Date" required>
                  <input
                    type="text"
                    value={form.activity_date}
                    onChange={(e) => setForm((p) => ({ ...p, activity_date: e.target.value }))}
                    className={inputCls}
                    placeholder="Within 19 Aug – 19 Sep 2026"
                  />
                </FormRow>
                <FormRow label="Primary image" required>
                  <input
                    type="file"
                    accept="image/*"
                    className="mb-2 text-[14px]"
                    onChange={(e) => void handleImagePrimary(e.target.files?.[0] ?? null)}
                  />
                  {isImageUrl(form.primary_image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.primary_image!} alt="" className="mt-2 max-h-48 rounded border border-black/10" />
                  ) : null}
                  <input
                    type="text"
                    value={form.primary_image ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, primary_image: e.target.value || null }))}
                    className={`${inputCls} mt-2`}
                    placeholder="Or paste image URL (https://…)"
                  />
                </FormRow>
                <FormRow label="Primary image alt text">
                  <input
                    type="text"
                    value={form.primary_image_alt}
                    onChange={(e) => setForm((p) => ({ ...p, primary_image_alt: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Website / main link">
                  <input
                    type="text"
                    value={form.website_link}
                    onChange={(e) => setForm((p) => ({ ...p, website_link: e.target.value }))}
                    className={inputCls}
                    placeholder="https://"
                  />
                </FormRow>
                <FormRow label="Body text 1" required>
                  <RichTextEditor
                    value={form.body_text_1}
                    onChange={(html) => setForm((p) => ({ ...p, body_text_1: html }))}
                    placeholder="First body section…"
                  />
                </FormRow>
                <FormRow label="Additional image 1" required>
                  <input
                    type="file"
                    accept="image/*"
                    className="mb-2 text-[14px]"
                    onChange={(e) => void handleImageAdd1(e.target.files?.[0] ?? null)}
                  />
                  {isImageUrl(form.additional_images_1) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.additional_images_1!}
                      alt=""
                      className="mt-2 max-h-48 rounded border border-black/10"
                    />
                  ) : null}
                  <input
                    type="text"
                    value={form.additional_images_1 ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, additional_images_1: e.target.value || null }))}
                    className={`${inputCls} mt-2`}
                    placeholder="Or paste image URL"
                  />
                </FormRow>
                <FormRow label="Additional image 1 alt">
                  <input
                    type="text"
                    value={form.additional_images_1_alt}
                    onChange={(e) => setForm((p) => ({ ...p, additional_images_1_alt: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Body text 2" required>
                  <RichTextEditor
                    value={form.body_text_2}
                    onChange={(html) => setForm((p) => ({ ...p, body_text_2: html }))}
                    placeholder="Second body section…"
                  />
                </FormRow>
                <FormRow label="Additional images (1–3)">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mb-2 text-[14px]"
                    onChange={(e) => void handleImageAdd2(e.target.files)}
                  />
                  <p className="mb-2 text-[12px] text-black/60">Optional. Upload up to 3 images, or paste URLs below.</p>
                  <div className="flex flex-wrap gap-2">
                    {form.additional_images_2.map((url, i) =>
                      isImageUrl(url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt="" className="h-24 rounded border object-cover" />
                      ) : null
                    )}
                  </div>
                  {form.additional_images_2.map((url, i) => (
                    <div key={i} className="mt-2 flex flex-col gap-1">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const next = [...form.additional_images_2];
                          next[i] = e.target.value;
                          setForm((p) => ({ ...p, additional_images_2: next }));
                        }}
                        className={inputCls}
                        placeholder={`Image ${i + 1} URL`}
                      />
                      <input
                        type="text"
                        value={form.additional_images_2_alt[i] ?? ""}
                        onChange={(e) => {
                          const next = [...form.additional_images_2_alt];
                          next[i] = e.target.value;
                          setForm((p) => ({ ...p, additional_images_2_alt: next }));
                        }}
                        className={inputCls}
                        placeholder={`Alt text ${i + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 text-[13px] underline"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        additional_images_2: [...p.additional_images_2, ""],
                        additional_images_2_alt: [...p.additional_images_2_alt, ""],
                      }))
                    }
                  >
                    Add image slot
                  </button>
                </FormRow>
                <FormRow label="Organiser" required>
                  <input
                    type="text"
                    value={form.organizer}
                    onChange={(e) => setForm((p) => ({ ...p, organizer: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
                <FormRow label="Partner">
                  <input
                    type="text"
                    value={form.partner}
                    onChange={(e) => setForm((p) => ({ ...p, partner: e.target.value }))}
                    className={inputCls}
                  />
                </FormRow>
              </div>
            ) : null}

            {/* TAB 2 */}
            {form.activeTab === 2 ? (
              <div className="flex flex-col">
                {form.additional_media_links.map((row, i) => (
                  <FormRow key={i} label={i === 0 ? "Additional media" : ""}>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={row.media_name}
                        onChange={(e) => {
                          const links = [...form.additional_media_links];
                          links[i] = { ...links[i]!, media_name: e.target.value };
                          setForm((p) => ({ ...p, additional_media_links: links }));
                        }}
                        className={inputCls}
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={row.media_link}
                        onChange={(e) => {
                          const links = [...form.additional_media_links];
                          links[i] = { ...links[i]!, media_link: e.target.value };
                          setForm((p) => ({ ...p, additional_media_links: links }));
                        }}
                        className={inputCls}
                        placeholder="https://"
                      />
                    </div>
                  </FormRow>
                ))}
                <button
                  type="button"
                  className="mb-6 self-start text-[13px] underline"
                  disabled={form.additional_media_links.length >= 5}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      additional_media_links: [...p.additional_media_links, { media_name: "", media_link: "" }],
                    }))
                  }
                >
                  Add media row (max 5)
                </button>

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

            {/* Actions: tab 0 only primary; tab 1–2 secondary left + primary right */}
            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {form.activeTab !== 0 ? (
                  <SecondaryButton type="button" onClick={() => void handleSaveDraftClick()} disabled={savingDraft}>
                    {savingDraft ? "Saving…" : "Save draft"}
                  </SecondaryButton>
                ) : null}
                {form.activeTab === 2 ? (
                  <SecondaryButton href="/submit/preview" onClick={syncPreviewSnapshot}>
                    Preview
                  </SecondaryButton>
                ) : null}
              </div>
              <div className="flex w-full justify-end sm:w-auto">
                {form.activeTab === 0 ? (
                  <PrimaryButton
                    type="button"
                    onClick={() => (loggedIn ? setTab(1) : void handleInlineSignUp())}
                    disabled={signingUp}
                  >
                    {signingUp ? "…" : loggedIn ? "Next" : "Sign up"}
                  </PrimaryButton>
                ) : null}
                {form.activeTab === 1 ? (
                  <PrimaryButton type="button" onClick={() => setTab(2)}>
                    Next
                  </PrimaryButton>
                ) : null}
                {form.activeTab === 2 ? (
                  <PrimaryButton
                    type="button"
                    disabled={submitting || !form.accept_terms || !isFormValidForSubmit(form)}
                    onClick={() => void runFinalSubmit()}
                  >
                    {submitting ? "Sending…" : "Submit"}
                  </PrimaryButton>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>

      {draftSavedOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal
        >
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 className="mb-4 text-lg font-medium text-black">Draft saved</h2>
            <p className="mb-6 text-[15px] text-black/80">Your answers so far have been saved.</p>
            <PrimaryButton type="button" onClick={() => setDraftSavedOpen(false)}>
              OK
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      {submitSuccessOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal
        >
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 className="mb-4 text-lg font-medium text-black">Success</h2>
            <p className="mb-6 text-[15px] text-black/80">
              {isPublishedRecord
                ? "Your update is live on the programme and on the home page."
                : "Upload successful. Your submission is sent for review."}
            </p>
            <PrimaryButton type="button" onClick={() => setSubmitSuccessOpen(false)}>
              OK
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      {signupExistsOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 className="mb-4 text-lg font-medium text-black">Account exists</h2>
            <p className="mb-6 text-[15px] text-black/80">This email already has an account. Please use Login.</p>
            <div className="flex flex-wrap gap-4">
              <PrimaryButton href="/login?returnTo=%2Fsubmit%2Fform">Go to Login</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setSignupExistsOpen(false)}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {signupSuccessOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 className="mb-4 text-lg font-medium text-black">Sign up successful</h2>
            <p className="mb-6 text-[15px] text-black/80">Your account has been created.</p>
            <PrimaryButton
              type="button"
              onClick={() => {
                setSignupSuccessOpen(false);
                setTab(1);
              }}
            >
              Next
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      {signupNeedsLoginOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal>
          <div
            className="max-w-md border-0 bg-white p-8 shadow-none"
            style={{ fontFamily: "var(--font-inter)", fontSize: "70%" }}
          >
            <h2 className="mb-4 text-lg font-medium text-black">Check your email</h2>
            <p className="mb-6 text-[15px] text-black/80">
              Your account was created. Please confirm your email (if prompted) and log in to continue your submission.
            </p>
            <div className="flex flex-wrap gap-4">
              <PrimaryButton href="/login?returnTo=%2Fsubmit%2Fform">Go to Login</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setSignupNeedsLoginOpen(false)}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </SubmitShell>
  );
}
