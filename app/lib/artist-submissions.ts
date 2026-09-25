import type { Artist, ArtistLinkedItem, ArtistWork } from "./artists";
import { artistSlugFromName, getEditorialArtists, limitArtistWorks } from "./artists";
import { getSupabaseClient } from "./supabase";

export const ARTIST_JOIN_DRAFT_KEY = "othering_artist_join_draft_v2";
export const ARTIST_JOIN_GUEST_DRAFT_KEY = "othering_artist_join_draft_guest_v2";
export const ARTIST_SUBMISSIONS_KEY = "othering_artist_submissions_v1";

export type ArtistLinkedDraft = {
  year: string;
  title: string;
  detail: string;
  href: string;
};

export type ArtistJoinTab = 0 | 1 | 2;

export type ArtistJoinForm = {
  activeTab: ArtistJoinTab;
  name: string;
  birth: string;
  field: string;
  photo: string | null;
  bio: string;
  cv: ArtistLinkedDraft[];
  exhibitions: ArtistLinkedDraft[];
  press: ArtistLinkedDraft[];
  talks: ArtistLinkedDraft[];
  works: ArtistWork[];
  accept_terms: boolean;
};

export type StoredArtist = Artist & {
  ownerId?: string;
  ownerEmail?: string;
  status?: "draft" | "pending_review" | "published" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type AdminArtistRecord = StoredArtist & {
  ownerEmail: string;
  status: "draft" | "pending_review" | "published" | "rejected";
  createdAt: string;
  updatedAt: string;
  /** Site roster seed (not a user submission). */
  source?: "editorial" | "user";
};

export const emptyLinkedDraft = (): ArtistLinkedDraft => ({
  year: "",
  title: "",
  detail: "",
  href: "",
});

export const emptyArtistJoinForm = (): ArtistJoinForm => ({
  activeTab: 0,
  name: "",
  birth: "",
  field: "",
  photo: null,
  bio: "",
  cv: [emptyLinkedDraft()],
  exhibitions: [emptyLinkedDraft()],
  press: [emptyLinkedDraft()],
  talks: [emptyLinkedDraft()],
  works: [],
  accept_terms: false,
});

/** Old QA test persona — never restore into the join form. */
function isLegacyMayaChenTestDraft(form: Pick<ArtistJoinForm, "name" | "birth" | "bio">): boolean {
  if (form.name.trim().toLowerCase() !== "maya chen") return false;
  const birth = form.birth.trim().toLowerCase();
  const bio = form.bio.trim().toLowerCase();
  return (
    birth.includes("singapore") ||
    bio.includes("maya chen works with light") ||
    bio.includes("temporary shopfronts") ||
    bio.length === 0
  );
}

function isLegacyMayaChenArtist(artist: { name: string; birth?: string; bio?: string }): boolean {
  return isLegacyMayaChenTestDraft({
    name: artist.name,
    birth: artist.birth || "",
    bio: artist.bio || "",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseLinkedDrafts(value: unknown): ArtistLinkedDraft[] {
  if (!Array.isArray(value) || value.length === 0) return [emptyLinkedDraft()];
  return value.map((item) => {
    const row = isRecord(item) ? item : {};
    return {
      year: typeof row.year === "string" ? row.year : "",
      title: typeof row.title === "string" ? row.title : "",
      detail: typeof row.detail === "string" ? row.detail : "",
      href: typeof row.href === "string" ? row.href : "",
    };
  });
}

function parseWorks(value: unknown): ArtistWork[] {
  if (!Array.isArray(value)) return [];
  return limitArtistWorks(
    value.flatMap((item) => {
      if (!isRecord(item) || typeof item.src !== "string" || !item.src) return [];
      return [{ src: item.src, alt: typeof item.alt === "string" ? item.alt : undefined }];
    })
  );
}

function linkedItemsToDrafts(items: ArtistLinkedItem[] | undefined): ArtistLinkedDraft[] {
  if (!items || items.length === 0) return [emptyLinkedDraft()];
  return items.map((item) => ({
    year: item.year || "",
    title: item.title || "",
    detail: item.detail || "",
    href: item.href || "",
  }));
}

export function parseArtistJoinForm(raw: string | null): ArtistJoinForm | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const tab = parsed.activeTab;
    return {
      ...emptyArtistJoinForm(),
      activeTab: tab === 1 || tab === 2 ? tab : 0,
      name: typeof parsed.name === "string" ? parsed.name : "",
      birth: typeof parsed.birth === "string" ? parsed.birth : "",
      field: typeof parsed.field === "string" ? parsed.field : "",
      photo: typeof parsed.photo === "string" && parsed.photo ? parsed.photo : null,
      bio: typeof parsed.bio === "string" ? parsed.bio : "",
      cv: parseLinkedDrafts(parsed.cv),
      exhibitions: parseLinkedDrafts(parsed.exhibitions),
      press: parseLinkedDrafts(parsed.press),
      talks: parseLinkedDrafts(parsed.talks),
      works: parseWorks(parsed.works),
      accept_terms: parsed.accept_terms === true,
    };
  } catch {
    return null;
  }
}

function compactLinked(rows: ArtistLinkedDraft[]): ArtistLinkedItem[] {
  return rows
    .map((row) => ({
      year: row.year.trim() || undefined,
      title: row.title.trim(),
      detail: row.detail.trim() || undefined,
      href: row.href.trim() || undefined,
    }))
    .filter((row) => row.title || row.year || row.detail || row.href)
    .map((row) => ({
      ...row,
      title: row.title || row.detail || row.year || "Entry",
    }));
}

export function formToArtist(form: ArtistJoinForm): Artist | null {
  const name = form.name.trim();
  const slug = artistSlugFromName(name);
  if (!name || !slug) return null;
  return {
    slug,
    name,
    birth: form.birth.trim() || undefined,
    field: form.field.trim() || undefined,
    photo: form.photo,
    photoAlt: name,
    bio: form.bio.trim(),
    cv: compactLinked(form.cv),
    exhibitions: compactLinked(form.exhibitions),
    press: compactLinked(form.press),
    talks: compactLinked(form.talks),
    works: limitArtistWorks(form.works),
  };
}

export function artistToJoinForm(artist: Artist, acceptTerms = true): ArtistJoinForm {
  return {
    activeTab: 0,
    name: artist.name || "",
    birth: artist.birth || "",
    field: artist.field || "",
    photo: artist.photo || null,
    bio: artist.bio || "",
    cv: linkedItemsToDrafts(artist.cv),
    exhibitions: linkedItemsToDrafts(artist.exhibitions),
    press: linkedItemsToDrafts(artist.press),
    talks: linkedItemsToDrafts(artist.talks),
    works: limitArtistWorks(artist.works),
    accept_terms: acceptTerms,
  };
}

export function isArtistJoinValid(form: ArtistJoinForm): boolean {
  return !!formToArtist(form) && form.accept_terms;
}

function parseStoredArtist(value: unknown): StoredArtist | null {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim()) return null;
  const slug =
    typeof value.slug === "string" && value.slug ? value.slug : artistSlugFromName(value.name);
  if (!slug) return null;
  const statusRaw = typeof value.status === "string" ? value.status : undefined;
  const status =
    statusRaw === "draft" ||
    statusRaw === "pending_review" ||
    statusRaw === "published" ||
    statusRaw === "rejected"
      ? statusRaw
      : undefined;
  return {
    slug,
    name: value.name.trim(),
    birth: typeof value.birth === "string" && value.birth ? value.birth : undefined,
    field: typeof value.field === "string" && value.field ? value.field : undefined,
    photo: typeof value.photo === "string" && value.photo ? value.photo : null,
    photoAlt: typeof value.photoAlt === "string" ? value.photoAlt : value.name.trim(),
    bio: typeof value.bio === "string" ? value.bio : "",
    cv: Array.isArray(value.cv) ? (value.cv as ArtistLinkedItem[]) : [],
    exhibitions: Array.isArray(value.exhibitions) ? (value.exhibitions as ArtistLinkedItem[]) : [],
    press: Array.isArray(value.press) ? (value.press as ArtistLinkedItem[]) : [],
    talks: Array.isArray(value.talks) ? (value.talks as ArtistLinkedItem[]) : [],
    works: parseWorks(value.works),
    ownerId:
      typeof value.ownerId === "string"
        ? value.ownerId
        : typeof value.owner_id === "string"
          ? value.owner_id
          : undefined,
    ownerEmail:
      typeof value.ownerEmail === "string"
        ? value.ownerEmail
        : typeof value.owner_email === "string"
          ? value.owner_email
          : undefined,
    status,
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : typeof value.created_at === "string"
          ? value.created_at
          : undefined,
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : typeof value.updated_at === "string"
          ? value.updated_at
          : undefined,
  };
}

function draftStorageKey(userId?: string | null): string {
  return userId ? `${ARTIST_JOIN_DRAFT_KEY}:${userId}` : ARTIST_JOIN_DRAFT_KEY;
}

export function formHasContent(form: ArtistJoinForm): boolean {
  return Boolean(
    form.name.trim() ||
      form.bio.trim() ||
      form.photo ||
      form.works.length > 0 ||
      form.field.trim() ||
      form.birth.trim()
  );
}

export function saveGuestArtistJoinDraft(form: ArtistJoinForm): void {
  localStorage.setItem(ARTIST_JOIN_GUEST_DRAFT_KEY, JSON.stringify(form));
}

export function loadGuestArtistJoinDraft(): ArtistJoinForm | null {
  if (typeof window === "undefined") return null;
  try {
    return parseArtistJoinForm(localStorage.getItem(ARTIST_JOIN_GUEST_DRAFT_KEY));
  } catch {
    return null;
  }
}

/** Move guest draft onto the signed-in account when it has content. */
export function claimGuestDraftForUser(userId: string): ArtistJoinForm | null {
  const guest = loadGuestArtistJoinDraft();
  if (!guest || !formHasContent(guest) || isLegacyMayaChenTestDraft(guest)) {
    if (guest && isLegacyMayaChenTestDraft(guest)) {
      try {
        localStorage.removeItem(ARTIST_JOIN_GUEST_DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }
    return null;
  }
  saveArtistJoinDraft(guest, userId);
  try {
    localStorage.removeItem(ARTIST_JOIN_GUEST_DRAFT_KEY);
  } catch {
    /* ignore */
  }
  return guest;
}

export function loadSubmittedArtists(): StoredArtist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTIST_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const list = parsed.flatMap((item) => {
      const artist = parseStoredArtist(item);
      return artist ? [artist] : [];
    });
    const cleaned = list.filter((artist) => !isLegacyMayaChenArtist(artist));
    if (cleaned.length !== list.length) {
      localStorage.setItem(ARTIST_SUBMISSIONS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function loadSubmittedArtistForUser(userId: string): StoredArtist | null {
  const owned = loadSubmittedArtists().find((item) => item.ownerId === userId);
  return owned ?? null;
}

export function saveSubmittedArtist(
  artist: Artist,
  ownerId?: string,
  ownerEmail?: string,
  status: StoredArtist["status"] = "published"
): StoredArtist[] {
  const now = new Date().toISOString();
  const existing = loadSubmittedArtists().find(
    (item) => item.slug === artist.slug || (ownerId && item.ownerId === ownerId)
  );
  const stored: StoredArtist = {
    ...artist,
    ownerId: ownerId || existing?.ownerId,
    ownerEmail: ownerEmail || existing?.ownerEmail,
    status: status || "published",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const current = loadSubmittedArtists().filter((item) => {
    if (item.slug === stored.slug) return false;
    if (ownerId && item.ownerId === ownerId) return false;
    return true;
  });
  const next = [...current, stored];
  localStorage.setItem(ARTIST_SUBMISSIONS_KEY, JSON.stringify(next));
  return next;
}

export function removeSubmittedArtistLocal(slug: string, ownerId?: string): void {
  if (typeof window === "undefined") return;
  const next = loadSubmittedArtists().filter((item) => {
    if (item.slug === slug) return false;
    if (ownerId && item.ownerId === ownerId) return false;
    return true;
  });
  localStorage.setItem(ARTIST_SUBMISSIONS_KEY, JSON.stringify(next));
}

/** Convert join-form drafts in this browser into admin rows (same-device review). */
export function loadLocalJoinDraftsAsAdminRecords(): AdminArtistRecord[] {
  if (typeof window === "undefined") return [];
  const rows: AdminArtistRecord[] = [];
  const seen = new Set<string>();

  const consider = (form: ArtistJoinForm | null, ownerId?: string) => {
    if (!form || !formHasContent(form)) return;
    const artist = formToArtist(form);
    if (!artist || seen.has(artist.slug)) return;
    seen.add(artist.slug);
    rows.push(
      toAdminRecord(
        {
          ...artist,
          ownerId,
          ownerEmail: "",
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        "user"
      )
    );
  };

  try {
    consider(loadGuestArtistJoinDraft());
    consider(parseArtistJoinForm(localStorage.getItem(ARTIST_JOIN_DRAFT_KEY)));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${ARTIST_JOIN_DRAFT_KEY}:`)) continue;
      const ownerId = key.slice(ARTIST_JOIN_DRAFT_KEY.length + 1);
      consider(parseArtistJoinForm(localStorage.getItem(key)), ownerId || undefined);
    }
  } catch {
    /* ignore */
  }
  return rows;
}

export function saveArtistJoinDraft(form: ArtistJoinForm, userId?: string | null): void {
  if (!userId) {
    saveGuestArtistJoinDraft(form);
    return;
  }
  localStorage.setItem(draftStorageKey(userId), JSON.stringify(form));
  // Keep legacy key in sync for older reads
  localStorage.setItem(ARTIST_JOIN_DRAFT_KEY, JSON.stringify(form));
}

export function loadArtistJoinDraft(userId?: string | null): ArtistJoinForm | null {
  if (typeof window === "undefined") return null;
  try {
    let draft: ArtistJoinForm | null = null;
    if (!userId) {
      draft =
        loadGuestArtistJoinDraft() ??
        parseArtistJoinForm(localStorage.getItem(ARTIST_JOIN_DRAFT_KEY));
    } else {
      draft =
        parseArtistJoinForm(localStorage.getItem(draftStorageKey(userId))) ??
        parseArtistJoinForm(localStorage.getItem(ARTIST_JOIN_DRAFT_KEY));
    }
    if (draft && isLegacyMayaChenTestDraft(draft)) {
      try {
        localStorage.removeItem(ARTIST_JOIN_GUEST_DRAFT_KEY);
        localStorage.removeItem(ARTIST_JOIN_DRAFT_KEY);
        if (userId) localStorage.removeItem(draftStorageKey(userId));
      } catch {
        /* ignore */
      }
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

/** Prefer claimed guest draft, then account draft, then published profile. */
export function loadJoinFormForUser(userId: string): ArtistJoinForm {
  const claimed = claimGuestDraftForUser(userId);
  if (claimed && !isLegacyMayaChenTestDraft(claimed)) return claimed;

  const draft = loadArtistJoinDraft(userId);
  if (draft && formHasContent(draft)) {
    return draft;
  }
  const published = loadSubmittedArtistForUser(userId);
  if (published && !isLegacyMayaChenArtist(published)) {
    return artistToJoinForm(published, true);
  }
  return emptyArtistJoinForm();
}

/** Form for visitors who are not signed in yet. */
export function loadJoinFormForGuest(): ArtistJoinForm {
  return loadArtistJoinDraft(null) ?? emptyArtistJoinForm();
}

function rowToArtist(row: Record<string, unknown>): StoredArtist | null {
  const name = typeof row.name === "string" ? row.name : "";
  const slug =
    typeof row.slug === "string" && row.slug ? row.slug : artistSlugFromName(name);
  if (!name || !slug) return null;
  const statusRaw = typeof row.status === "string" ? row.status : undefined;
  const status =
    statusRaw === "draft" ||
    statusRaw === "pending_review" ||
    statusRaw === "published" ||
    statusRaw === "rejected"
      ? statusRaw
      : "published";
  return {
    slug,
    name,
    birth: typeof row.birth === "string" && row.birth ? row.birth : undefined,
    field: typeof row.field === "string" && row.field ? row.field : undefined,
    photo: typeof row.photo === "string" && row.photo ? row.photo : null,
    photoAlt:
      typeof row.photo_alt === "string"
        ? row.photo_alt
        : typeof row.photoAlt === "string"
          ? row.photoAlt
          : name,
    bio: typeof row.bio === "string" ? row.bio : "",
    cv: Array.isArray(row.cv) ? (row.cv as ArtistLinkedItem[]) : [],
    exhibitions: Array.isArray(row.exhibitions) ? (row.exhibitions as ArtistLinkedItem[]) : [],
    press: Array.isArray(row.press) ? (row.press as ArtistLinkedItem[]) : [],
    talks: Array.isArray(row.talks) ? (row.talks as ArtistLinkedItem[]) : [],
    works: parseWorks(row.works),
    ownerId: typeof row.owner_id === "string" ? row.owner_id : undefined,
    ownerEmail: typeof row.owner_email === "string" ? row.owner_email : undefined,
    status,
    createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function artistPayload(
  artist: Artist,
  ownerId: string,
  ownerEmail: string | undefined,
  status: NonNullable<StoredArtist["status"]>
): Record<string, unknown> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    slug: artist.slug,
    name: artist.name,
    field: artist.field ?? null,
    birth: artist.birth ?? null,
    photo: artist.photo ?? null,
    photo_alt: artist.photoAlt ?? artist.name,
    bio: artist.bio ?? "",
    cv: artist.cv ?? [],
    exhibitions: artist.exhibitions ?? [],
    press: artist.press ?? [],
    talks: artist.talks ?? [],
    works: artist.works ?? [],
    status,
    owner_id: ownerId,
    updated_at: now,
  };
  if (ownerEmail) payload.owner_email = ownerEmail;
  return payload;
}

/**
 * Upsert artist row for the signed-in owner.
 * Prefers updating by owner_id so slug renames don’t create orphans.
 * Always uses auth.getUser() id so INSERT RLS (auth.uid() = owner_id) passes.
 */
export async function upsertArtistRemote(
  artist: Artist,
  ownerId: string,
  ownerEmail?: string,
  status: NonNullable<StoredArtist["status"]> = "published",
  timeoutMs = 12000
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Supabase not configured" };

  try {
    const run = async () => {
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();
      if (userError || !user) {
        return {
          data: null,
          error: { message: userError?.message || "Not signed in — log in, then Save Draft again." },
        };
      }

      // RLS requires owner_id === auth.uid(); never trust a stale client id.
      const uid = user.id;
      const email = ownerEmail || user.email || undefined;
      const payload = artistPayload(artist, uid, email, status);

      const existing = await client
        .from("artists")
        .select("id, slug, status")
        .eq("owner_id", uid)
        .maybeSingle();

      if (existing.error) {
        // If select is blocked, still try insert (new row) / update by slug for own row.
        console.warn("[artists] owner lookup:", existing.error.message);
      }

      if (existing.data && typeof (existing.data as { id?: string }).id === "string") {
        const id = (existing.data as { id: string }).id;
        const currentStatus = (existing.data as { status?: string }).status;
        const nextStatus =
          status === "draft" && currentStatus === "published" ? "published" : status;
        return client
          .from("artists")
          .update({ ...payload, status: nextStatus })
          .eq("id", id);
      }

      // Prefer plain insert for first save — clearer RLS errors than upsert.
      const inserted = await client.from("artists").insert(payload);
      if (!inserted.error) return inserted;

      // Slug already taken by this or another row: update own row by slug if we own it.
      if (/duplicate|unique|conflict/i.test(inserted.error.message || "")) {
        const updated = await client
          .from("artists")
          .update(payload)
          .eq("slug", artist.slug)
          .eq("owner_id", uid);
        if (!updated.error) return updated;
        return {
          data: null,
          error: {
            message:
              updated.error?.message ||
              inserted.error.message ||
              "This artist name/slug is already taken.",
          },
        };
      }

      return inserted;
    };

    const result = await Promise.race([
      run(),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(
          () => resolve({ data: null, error: { message: "Remote sync timed out" } }),
          timeoutMs
        )
      ),
    ]);

    if (result.error) {
      console.warn("[artists] remote upsert skipped:", result.error.message);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remote sync failed";
    console.warn("[artists] remote upsert failed:", message);
    return { ok: false, error: message };
  }
}

/** Sync a join draft to Supabase so admin can review unfinished profiles. */
export async function saveArtistDraftRemote(
  form: ArtistJoinForm,
  ownerId: string,
  ownerEmail?: string
): Promise<{ ok: boolean; error?: string }> {
  const artist = formToArtist(form);
  if (!artist) return { ok: false, error: "Name is required to sync draft" };
  return upsertArtistRemote(artist, ownerId, ownerEmail, "draft");
}

/** Artist-facing publish: lands in pending_review for admin approval. */
export async function publishArtistRemote(
  artist: Artist,
  ownerId: string,
  ownerEmail?: string,
  timeoutMs = 12000
): Promise<{ ok: boolean; error?: string }> {
  return upsertArtistRemote(artist, ownerId, ownerEmail, "pending_review", timeoutMs);
}

/** Admin: set status (publish / reject / revert to draft). */
export async function updateArtistStatusAdmin(
  slug: string,
  status: NonNullable<StoredArtist["status"]>
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Supabase not configured" };
  try {
    const { error } = await client
      .from("artists")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Status update failed",
    };
  }
}

/** Admin: permanently delete an artist row. */
export async function deleteArtistAdmin(
  slug: string,
  ownerId?: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Supabase not configured" };
  try {
    const { error } = await client.from("artists").delete().eq("slug", slug);
    if (error) return { ok: false, error: error.message };
    removeSubmittedArtistLocal(slug, ownerId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/** Load a single artist's own remote row (draft or otherwise). */
export async function loadRemoteArtistForUser(ownerId: string): Promise<StoredArtist | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("artists")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (error || !data) {
      if (error) console.warn("[artists] owner load skipped:", error.message);
      return null;
    }
    const artist = rowToArtist(data as Record<string, unknown>);
    if (!artist || isLegacyMayaChenArtist(artist)) return null;
    return artist;
  } catch (error) {
    console.warn("[artists] owner load failed", error);
    return null;
  }
}

function toAdminRecord(
  artist: StoredArtist,
  source: "editorial" | "user" = "user"
): AdminArtistRecord {
  const now = new Date().toISOString();
  return {
    ...artist,
    ownerEmail: artist.ownerEmail || "",
    status: artist.status || "published",
    createdAt: artist.createdAt || now,
    updatedAt: artist.updatedAt || artist.createdAt || now,
    source,
  };
}

/** Load all artist rows for admin review (admins see every status when RLS allows). */
export async function loadAdminArtistRecords(): Promise<AdminArtistRecord[]> {
  const bySlug = new Map<string, AdminArtistRecord>();

  // Match the public /artists directory: include editorial roster first.
  for (const artist of getEditorialArtists()) {
    bySlug.set(
      artist.slug,
      toAdminRecord(
        {
          ...artist,
          status: "published",
          createdAt: "2020-01-01T00:00:00.000Z",
          updatedAt: "2020-01-01T00:00:00.000Z",
        },
        "editorial"
      )
    );
  }

  for (const artist of loadSubmittedArtists().map((row) => toAdminRecord(row, "user"))) {
    bySlug.set(artist.slug, artist);
  }

  // Join-form drafts saved in this browser (even before cloud sync).
  for (const draft of loadLocalJoinDraftsAsAdminRecords()) {
    const prev = bySlug.get(draft.slug);
    if (!prev || prev.source === "editorial") {
      bySlug.set(draft.slug, draft);
      continue;
    }
    // Don't overwrite a newer cloud/local submission with an older form draft.
    if (new Date(draft.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
      bySlug.set(draft.slug, {
        ...draft,
        ownerEmail: draft.ownerEmail || prev.ownerEmail,
        ownerId: draft.ownerId || prev.ownerId,
        status: prev.status === "published" || prev.status === "pending_review" ? prev.status : draft.status,
      });
    }
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      // Prefer full list. Falls back to published + review-queue policies.
      const { data, error } = await client
        .from("artists")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) {
        console.warn("[artists] admin load error:", error.message);
        const fallback = await client
          .from("artists")
          .select("*")
          .in("status", ["published", "draft", "pending_review", "rejected"])
          .order("updated_at", { ascending: false });
        if (!fallback.error && fallback.data) {
          for (const row of fallback.data) {
            const artist = rowToArtist(row as Record<string, unknown>);
            if (!artist || isLegacyMayaChenArtist(artist)) continue;
            bySlug.set(artist.slug, toAdminRecord(artist, "user"));
          }
        }
      } else if (data) {
        for (const row of data) {
          const artist = rowToArtist(row as Record<string, unknown>);
          if (!artist || isLegacyMayaChenArtist(artist)) continue;
          const next = toAdminRecord(artist, "user");
          const prev = bySlug.get(next.slug);
          if (!prev || prev.source === "editorial") {
            bySlug.set(next.slug, next);
            continue;
          }
          const prevTime = new Date(prev.updatedAt).getTime();
          const nextTime = new Date(next.updatedAt).getTime();
          bySlug.set(next.slug, {
            ...(nextTime >= prevTime ? next : prev),
            ownerEmail: next.ownerEmail || prev.ownerEmail,
            ownerId: next.ownerId || prev.ownerId,
            createdAt:
              new Date(next.createdAt).getTime() <= new Date(prev.createdAt).getTime()
                ? next.createdAt
                : prev.createdAt,
            updatedAt: nextTime >= prevTime ? next.updatedAt : prev.updatedAt,
            source: "user",
            status: nextTime >= prevTime ? next.status : prev.status,
          });
        }
      }
    } catch (error) {
      console.warn("[artists] admin load failed", error);
    }
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    // User submissions first by recency; editorial roster A–Z after.
    if (a.source === "editorial" && b.source !== "editorial") return 1;
    if (b.source === "editorial" && a.source !== "editorial") return -1;
    if (a.source === "editorial" && b.source === "editorial") {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function loadAdminArtistBySlug(slug: string): Promise<AdminArtistRecord | null> {
  const all = await loadAdminArtistRecords();
  return all.find((artist) => artist.slug === slug) ?? null;
}

/** Record that an artist account reached the join flow (best-effort). */
export async function recordArtistRegistration(
  ownerId: string,
  ownerEmail?: string
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const now = new Date().toISOString();
  try {
    const { data: existing } = await client
      .from("artist_registrations")
      .select("id")
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (existing) {
      await client
        .from("artist_registrations")
        .update({ last_seen_at: now, owner_email: ownerEmail || null })
        .eq("owner_id", ownerId);
      return;
    }
    await client.from("artist_registrations").insert({
      owner_id: ownerId,
      owner_email: ownerEmail || null,
      first_seen_at: now,
      last_seen_at: now,
    });
  } catch (error) {
    console.warn("[artists] registration log skipped", error);
  }
}

export type ArtistRegistrationRecord = {
  ownerId: string;
  ownerEmail: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export async function loadArtistRegistrations(): Promise<ArtistRegistrationRecord[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("artist_registrations")
      .select("*")
      .order("last_seen_at", { ascending: false });
    if (error || !data) {
      if (error) console.warn("[artists] registration load skipped:", error.message);
      return [];
    }
    return data.flatMap((row) => {
      const r = row as Record<string, unknown>;
      if (typeof r.owner_id !== "string") return [];
      return [
        {
          ownerId: r.owner_id,
          ownerEmail: typeof r.owner_email === "string" ? r.owner_email : "",
          firstSeenAt: typeof r.first_seen_at === "string" ? r.first_seen_at : "",
          lastSeenAt: typeof r.last_seen_at === "string" ? r.last_seen_at : "",
        },
      ];
    });
  } catch (error) {
    console.warn("[artists] registration load failed", error);
    return [];
  }
}

/** Load published artists from Supabase when the table exists. */
export async function loadRemotePublishedArtists(): Promise<StoredArtist[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("artists")
      .select("*")
      .eq("status", "published");
    if (error || !data) {
      if (error) console.warn("[artists] remote load skipped:", error.message);
      return [];
    }
    return data.flatMap((row) => {
      const artist = rowToArtist(row as Record<string, unknown>);
      if (!artist || isLegacyMayaChenArtist(artist)) return [];
      return [artist];
    });
  } catch (error) {
    console.warn("[artists] remote load failed", error);
    return [];
  }
}

/** Merge local + remote submissions for the public directory. */
export async function loadAllSubmittedArtists(): Promise<StoredArtist[]> {
  const local = loadSubmittedArtists();
  const remote = await loadRemotePublishedArtists();
  const bySlug = new Map<string, StoredArtist>();
  for (const artist of [...remote, ...local]) {
    bySlug.set(artist.slug, artist);
  }
  return Array.from(bySlug.values());
}
