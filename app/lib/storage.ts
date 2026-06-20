// app/lib/storage.ts
// Shared storage utilities for submissions and activities
// Supabase DB as single source of truth

import { getSupabaseClient } from "./supabase";
import { assignProgrammeWindowDates } from "./programme-window";

export type MediaLink = {
  media_name: string;
  media_link: string;
};

export type SubmissionStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "rejected"
  | "removed";

export type Submission = {
  id: string;
  owner_id: string;

  // TAB 1
  first_name: string;
  last_name: string;
  username: string;
  organization_name: string;
  email: string;
  role: string;
  is_student?: boolean;

  // TAB 2
  activity_title: string;
  author_name: string;
  activity_type: string;
  activity_description: string;
  activity_location: string;
  activity_area: string;
  activity_date: string;

  primary_image: File | string | null;
  primary_image_alt: string;

  website_link: string;

  body_text_1: string;
  additional_images_1: File | string | null;
  additional_images_1_alt: string;

  body_text_2: string;
  additional_images_2: (File | string)[] | null;
  additional_images_2_alt: string[];

  organizer: string;
  partner: string;
  additional_media_links?: MediaLink[];

  accept_terms?: boolean;
  status: SubmissionStatus;
  createdAt: string;
  is_deleted?: boolean;
  is_locked?: boolean;
};

export type Activity = {
  id: string;
  activity_title: string;
  author_name: string;
  username: string;
  activity_location: string;
  activity_date: string;
  activity_type: string;
  activity_area: string;
  partner_name: string;
  website_link: string;
  body_text_1: string;
  body_text_2: string;
  activity_description: string;
  organizer: string;
  partner: string;
  additional_media_links?: MediaLink[];
  primary_image?: string | null;
  additional_images_1?: string | null;
  additional_images_2?: string[] | null;
  createdAt: string;
  is_deleted?: boolean;
};

type ActivityRow = {
  id: string;
  owner_id: string | null;

  first_name: string | null;
  last_name: string | null;
  username: string | null;
  organization_name: string | null;
  email: string | null;
  role: string | null;
  is_student: boolean | null;

  activity_title: string | null;
  author_name: string | null;
  activity_type: string | null;
  activity_description: string | null;
  activity_location: string | null;
  activity_area: string | null;
  activity_date: string | null;

  primary_image: string | null;
  primary_image_alt: string | null;

  website_link: string | null;

  body_text_1: string | null;
  additional_images_1: string | null;
  additional_images_1_alt: string | null;

  body_text_2: string | null;
  additional_images_2: string[] | null;
  additional_images_2_alt: string[] | null;

  organizer: string | null;
  partner: string | null;
  additional_media_links: MediaLink[] | null;

  accept_terms: boolean | null;
  status: SubmissionStatus | null;
  created_at: string | null;
  updated_at?: string | null;
  is_deleted: boolean | null;
  is_locked: boolean | null;
};

// --- Supabase helpers ---

const getClient = () => {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase client not configured");
  }

  return client;
};

const logSupabaseError = (label: string, error: unknown): void => {
  // Normalise common network failure into a single concise log
  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    console.warn(`[${label}] network error: Failed to fetch (check Supabase URL / network connection)`);
    return;
  }

  console.error(`[${label}] raw error:`, error);

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    console.error(`[${label}] message:`, err.message ?? "No message");
    console.error(`[${label}] code:`, err.code ?? "No code");
    console.error(`[${label}] details:`, err.details ?? "No details");
    console.error(`[${label}] hint:`, err.hint ?? "No hint");
  }

  if (error instanceof Error) {
    console.error(`[${label}] stack:`, error.stack);
  }

  try {
    console.error(`[${label}] json:`, JSON.stringify(error, null, 2));
  } catch {
    console.error(`[${label}] could not stringify error`);
  }
};

// --- Query helpers ---

const normalizeSubmissionForSave = (submission: Submission): Submission => {
  return {
    ...submission,
    primary_image:
      typeof submission.primary_image === "string"
        ? submission.primary_image
        : null,
    additional_images_1:
      typeof submission.additional_images_1 === "string"
        ? submission.additional_images_1
        : null,
    additional_images_2:
      submission.additional_images_2?.filter(
        (img): img is string => typeof img === "string"
      ) ?? null,
    additional_media_links: submission.additional_media_links ?? [],
    additional_images_2_alt: submission.additional_images_2_alt ?? [],
    is_student: submission.is_student ?? false,
    is_deleted: submission.is_deleted ?? false,
    is_locked: submission.is_locked ?? false,
  };
};

// --- Submissions / Activities (single table: activities) ---

export const getSubmissions = async (options?: {
  includeDrafts?: boolean;
  includeRemoved?: boolean;
  userId?: string;
}): Promise<Submission[]> => {
  const client = getClient();

  let query = client.from("activities").select("*");

  if (!options?.includeDrafts) {
    query = query.neq("status", "draft");
  }

  if (options?.userId) {
    query = query.eq("owner_id", options.userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("getSubmissions", error);
    return [];
  }

  if (!data) {
    return [];
  }

  const rows = data as ActivityRow[];
  const filtered = options?.includeRemoved ? rows : rows.filter((row) => row.is_deleted !== true);
  return filtered.map(mapRowToSubmission);
};

export const getSubmission = async (id: string): Promise<Submission | null> => {
  const client = getClient();

  const { data, error } = await client
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logSupabaseError("getSubmission", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapRowToSubmission(data as ActivityRow);
};

export const saveSubmission = async (submission: Submission): Promise<void> => {
  const client = getClient();
  const cleaned = normalizeSubmissionForSave(submission);

  const { error } = await client.from("activities").upsert(
    {
      ...mapSubmissionToRow(cleaned),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    logSupabaseError("saveSubmission", error);
    throw error;
  }
};

export const getActivities = async (): Promise<Activity[]> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let supabaseHost = "MISSING_URL";
  try {
    if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host;
  } catch {
    supabaseHost = "INVALID_URL";
  }

  // Temporary production diagnostics — remove after verifying Vercel + RLS
  console.info("[getActivities] env", {
    supabaseHost,
    hasAnonKey: hasKey,
  });

  const client = getSupabaseClient();
  if (!client) {
    console.error(
      "[getActivities] Supabase client not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing at build time)"
    );
    return [];
  }

  // Equivalent REST: GET /rest/v1/activities?select=*&status=eq.published&order=created_at.desc
  const { data, error } = await client
    .from("activities")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("getActivities", error);
    console.error("[getActivities] query error — rowCount: 0", error);
    return [];
  }

  const rawRows = (data as ActivityRow[] | null) ?? [];
  console.info("[getActivities] raw Supabase rows", {
    rowCount: rawRows.length,
    ids: rawRows.map((r) => r.id),
    statuses: rawRows.map((r) => r.status),
    isDeleted: rawRows.map((r) => r.is_deleted),
  });

  if (rawRows.length === 0) {
    console.warn(
      "[getActivities] 0 rows returned. If Supabase table has published rows, check RLS policy: anonymous SELECT on status=published AND is_deleted=false."
    );
  }

  const list = rawRows
    .filter((row) => row.is_deleted !== true)
    .map(mapRowToActivity);

  console.info("[getActivities] after map + is_deleted filter", { rowCount: list.length });

  const withDates = assignProgrammeWindowDates(list);
  console.info("[getActivities] final activities returned", { rowCount: withDates.length });

  return withDates;
};

export const updateActivityStatus = async (
  id: string,
  status: SubmissionStatus,
  extraFields: Partial<Submission> = {}
): Promise<void> => {
  const client = getClient();

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (extraFields.author_name !== undefined) {
    payload.author_name = extraFields.author_name;
  }
  if (extraFields.is_deleted !== undefined) {
    payload.is_deleted = extraFields.is_deleted;
  }
  if (extraFields.is_locked !== undefined) {
    payload.is_locked = extraFields.is_locked;
  }

  const { error } = await client.from("activities").update(payload).eq("id", id);

  if (error) {
    logSupabaseError("updateActivityStatus", error);
    throw error;
  }
};

// --- Mappers ---

const mapRowToSubmission = (row: ActivityRow): Submission => ({
  id: row.id,
  owner_id: row.owner_id ?? "",

  first_name: row.first_name ?? "",
  last_name: row.last_name ?? "",
  username: row.username ?? "",
  organization_name: row.organization_name ?? "",
  email: row.email ?? "",
  role: row.role ?? "",
  is_student: row.is_student ?? false,

  activity_title: row.activity_title ?? "",
  author_name: row.author_name ?? "",
  activity_type: row.activity_type ?? "",
  activity_description: row.activity_description ?? "",
  activity_location: row.activity_location ?? "",
  activity_area: row.activity_area ?? "",
  activity_date: row.activity_date ?? "",

  primary_image: row.primary_image ?? null,
  primary_image_alt: row.primary_image_alt ?? "",

  website_link: row.website_link ?? "",

  body_text_1: row.body_text_1 ?? "",
  additional_images_1: row.additional_images_1 ?? null,
  additional_images_1_alt: row.additional_images_1_alt ?? "",

  body_text_2: row.body_text_2 ?? "",
  additional_images_2: row.additional_images_2 ?? null,
  additional_images_2_alt: row.additional_images_2_alt ?? [],

  organizer: row.organizer ?? "",
  partner: row.partner ?? "",
  additional_media_links: row.additional_media_links ?? [],

  accept_terms: row.accept_terms ?? false,
  status: row.status ?? "draft",
  createdAt: row.created_at ?? new Date().toISOString(),
  is_deleted: row.is_deleted ?? false,
  is_locked: row.is_locked ?? false,
});

const mapSubmissionToRow = (submission: Submission): ActivityRow => ({
  id: submission.id,
  owner_id: submission.owner_id,

  first_name: submission.first_name,
  last_name: submission.last_name,
  username: submission.username,
  organization_name: submission.organization_name,
  email: submission.email,
  role: submission.role,
  is_student: submission.is_student ?? false,

  activity_title: submission.activity_title,
  author_name: submission.author_name,
  activity_type: submission.activity_type,
  activity_description: submission.activity_description,
  activity_location: submission.activity_location,
  activity_area: submission.activity_area,
  activity_date: submission.activity_date,

  primary_image:
    typeof submission.primary_image === "string" ? submission.primary_image : null,
  primary_image_alt: submission.primary_image_alt,

  website_link: submission.website_link,

  body_text_1: submission.body_text_1,
  additional_images_1:
    typeof submission.additional_images_1 === "string"
      ? submission.additional_images_1
      : null,
  additional_images_1_alt: submission.additional_images_1_alt,

  body_text_2: submission.body_text_2,
  additional_images_2:
    submission.additional_images_2?.filter(
      (img): img is string => typeof img === "string"
    ) ?? null,
  additional_images_2_alt: submission.additional_images_2_alt ?? [],

  organizer: submission.organizer,
  partner: submission.partner,
  additional_media_links: submission.additional_media_links ?? [],

  accept_terms: submission.accept_terms ?? false,
  status: submission.status,
  created_at: submission.createdAt,
  updated_at: null,
  is_deleted: submission.is_deleted ?? false,
  is_locked: submission.is_locked ?? false,
});

const mapRowToActivity = (row: ActivityRow): Activity => ({
  id: row.id,
  activity_title: row.activity_title ?? "",
  author_name: row.author_name ?? "",
  username: row.username ?? "",
  activity_location: row.activity_location ?? "",
  activity_area: row.activity_area ?? "",
  activity_date: row.activity_date ?? "",
  activity_type: row.activity_type ?? "",
  partner_name: row.partner ?? row.organizer ?? "",
  website_link: row.website_link ?? "",
  body_text_1: row.body_text_1 ?? "",
  body_text_2: row.body_text_2 ?? "",
  activity_description: row.activity_description ?? "",
  organizer: row.organizer ?? "",
  partner: row.partner ?? "",
  additional_media_links: row.additional_media_links ?? [],
  primary_image: row.primary_image ?? null,
  additional_images_1: row.additional_images_1 ?? null,
  additional_images_2: row.additional_images_2 ?? null,
  createdAt: row.created_at ?? new Date().toISOString(),
  is_deleted: row.is_deleted ?? false,
});