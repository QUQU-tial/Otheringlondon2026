import type { MediaLink, Submission, SubmissionStatus } from "../../lib/storage";

export const DRAFT_LINK_PLACEHOLDER = "https://othering.place/draft";

/** localStorage: full form JSON (v2) */
export const SUBMIT_FORM_STORAGE_KEY = "othering_submit_form_local_v2";
/** localStorage: legacy single-page draft */
export const OLD_SUBMIT_FORM_STORAGE_KEY = "othering_submit_form_local_v1";
/** sessionStorage: snapshot when opening Preview (freshest) */
export const SUBMIT_PREVIEW_SNAPSHOT_KEY = "othering_submit_preview_snapshot";

export type TabIndex = 0 | 1 | 2;

export type FormState = {
  activeTab: TabIndex;
  first_name: string;
  last_name: string;
  username: string;
  organization_name: string;
  email: string;
  is_student: boolean;
  activity_title: string;
  author_name: string;
  activity_type: string;
  activity_description: string;
  activity_location: string;
  activity_area: string;
  activity_date: string;
  primary_image: string | null;
  primary_image_alt: string;
  website_link: string;
  body_text_1: string;
  additional_images_1: string | null;
  additional_images_1_alt: string;
  body_text_2: string;
  additional_images_2: string[];
  additional_images_2_alt: string[];
  organizer: string;
  partner: string;
  additional_media_links: MediaLink[];
  accept_terms: boolean;
};

export const emptyForm = (): FormState => ({
  activeTab: 0,
  first_name: "",
  last_name: "",
  username: "",
  organization_name: "",
  email: "",
  is_student: false,
  activity_title: "",
  author_name: "",
  activity_type: "",
  activity_description: "",
  activity_location: "",
  activity_area: "",
  activity_date: "",
  primary_image: null,
  primary_image_alt: "",
  website_link: "",
  body_text_1: "",
  additional_images_1: null,
  additional_images_1_alt: "",
  body_text_2: "",
  additional_images_2: [],
  additional_images_2_alt: [],
  organizer: "",
  partner: "",
  additional_media_links: [{ media_name: "", media_link: "" }],
  accept_terms: false,
});

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    new URL(t);
    return t;
  } catch {
    try {
      return new URL(`https://${t}`).toString();
    } catch {
      return null;
    }
  }
}

export function isImageUrl(s: string | null | undefined): boolean {
  return !!s && (s.startsWith("http") || s.startsWith("data:image"));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isFormValidForSubmit(f: FormState): boolean {
  if (!f.first_name.trim() || !f.last_name.trim() || !f.username.trim()) return false;
  if (!f.email.trim() || !EMAIL_RE.test(f.email.trim())) return false;
  if (!f.activity_title.trim() || !f.author_name.trim() || !f.activity_type.trim()) return false;
  if (!stripHtml(f.activity_description)) return false;
  if (!f.activity_location.trim() || !f.activity_date.trim()) return false;
  if (!f.activity_area.trim()) return false;
  if (!isImageUrl(f.primary_image)) return false;
  if (!stripHtml(f.body_text_1)) return false;
  if (!isImageUrl(f.additional_images_1)) return false;
  if (!stripHtml(f.body_text_2)) return false;
  // Additional images (1–3) are optional
  const imgs2 = f.additional_images_2.map((s) => s.trim()).filter(Boolean);
  if (imgs2.length && !imgs2.every((u) => isImageUrl(u))) return false;
  if (imgs2.length && imgs2.some((_, i) => !(f.additional_images_2_alt[i] ?? "").trim())) return false;
  if (!f.organizer.trim()) return false;
  if (!f.accept_terms) return false;
  return true;
}

export function submissionRowToForm(s: Submission): FormState {
  const img2 = s.additional_images_2?.filter((x): x is string => typeof x === "string") ?? [];
  const alt2 = s.additional_images_2_alt ?? [];
  return {
    activeTab: 0,
    first_name: s.first_name || "",
    last_name: s.last_name || "",
    username: s.username || "",
    organization_name: s.organization_name === "—" ? "" : s.organization_name,
    email: s.email || "",
    is_student: s.is_student ?? false,
    activity_title: s.activity_title === "—" ? "" : s.activity_title,
    author_name: s.author_name || "",
    activity_type: s.activity_type || "",
    activity_description: s.activity_description === "—" ? "" : s.activity_description,
    activity_location: s.activity_location === "—" ? "" : s.activity_location,
    activity_area: s.activity_area === "—" ? "" : (s.activity_area || ""),
    activity_date: s.activity_date === "—" ? "" : s.activity_date,
    primary_image: typeof s.primary_image === "string" ? s.primary_image : null,
    primary_image_alt: s.primary_image_alt || "",
    website_link:
      s.website_link && s.website_link !== DRAFT_LINK_PLACEHOLDER ? s.website_link : "",
    body_text_1: s.body_text_1 === "—" ? "" : s.body_text_1,
    additional_images_1: typeof s.additional_images_1 === "string" ? s.additional_images_1 : null,
    additional_images_1_alt: s.additional_images_1_alt || "",
    body_text_2: s.body_text_2 || "",
    additional_images_2: img2,
    additional_images_2_alt: img2.map((_, i) => alt2[i] ?? ""),
    organizer: s.organizer === "—" ? "" : s.organizer,
    partner: s.partner === "—" ? "" : s.partner,
    additional_media_links:
      s.additional_media_links?.filter((m) => m.media_name || m.media_link).length ?
        (s.additional_media_links ?? [])
      : [{ media_name: "", media_link: "" }],
    accept_terms: s.accept_terms ?? false,
  };
}

function orDash(s: string): string {
  const t = s.trim();
  return t || "—";
}

function orHtmlDash(s: string): string {
  return stripHtml(s) ? s : "—";
}

export function formToSubmission(
  f: FormState,
  args: {
    id: string;
    ownerId: string;
    createdAt: string;
    status: SubmissionStatus;
    is_locked: boolean;
    email: string;
    role: string;
  }
): Submission {
  const website = normalizeUrl(f.website_link) ?? DRAFT_LINK_PLACEHOLDER;
  const mediaFiltered =
    f.additional_media_links?.filter(
      (m) => m.media_name.trim() && m.media_link.trim() && normalizeUrl(m.media_link)
    ) ?? [];
  const imgs2 = f.additional_images_2.map((s) => s.trim()).filter(Boolean);

  return {
    id: args.id,
    owner_id: args.ownerId,
    first_name: orDash(f.first_name),
    last_name: orDash(f.last_name),
    username: orDash(f.username),
    organization_name: orDash(f.organization_name),
    email: args.email.trim() || orDash(f.email),
    role: args.role || "partner",
    is_student: f.is_student,
    activity_title: orDash(f.activity_title),
    author_name: orDash(f.author_name),
    activity_type: orDash(f.activity_type),
    activity_description: orHtmlDash(f.activity_description),
    activity_location: orDash(f.activity_location),
    activity_area: orDash(f.activity_area),
    activity_date: orDash(f.activity_date),
    primary_image: isImageUrl(f.primary_image) ? f.primary_image : null,
    primary_image_alt: orDash(f.primary_image_alt),
    website_link: website,
    body_text_1: orHtmlDash(f.body_text_1),
    additional_images_1: isImageUrl(f.additional_images_1) ? f.additional_images_1 : null,
    additional_images_1_alt: orDash(f.additional_images_1_alt),
    body_text_2: orHtmlDash(f.body_text_2),
    additional_images_2: imgs2.length ? imgs2 : null,
    additional_images_2_alt: imgs2.map((_, i) => orDash(f.additional_images_2_alt[i] ?? "")),
    organizer: orDash(f.organizer),
    partner: f.partner.trim() || "—",
    additional_media_links: mediaFiltered,
    accept_terms: f.accept_terms,
    status: args.status,
    createdAt: args.createdAt,
    is_deleted: false,
    is_locked: args.is_locked,
  };
}

/** Migrate legacy single-page local draft (v1) into FormState */
export function migrateV1Local(d: Record<string, unknown>): Partial<FormState> {
  const projectName = typeof d.projectName === "string" ? d.projectName : "";
  const description = typeof d.description === "string" ? d.description : "";
  const where = typeof d.where === "string" ? d.where : "";
  const when = typeof d.when === "string" ? d.when : "";
  const links = typeof d.links === "string" ? d.links : "";
  const accepted = Boolean(d.accepted);
  return {
    activity_title: projectName,
    author_name: projectName,
    activity_description: description,
    activity_location: where,
    activity_date: when,
    website_link: links,
    body_text_1: links ? `<p>${links}</p>` : "",
    accept_terms: accepted,
  };
}
