import type { Artist, ArtistLinkedItem, ArtistWork } from "./artists";
import { artistSlugFromName, limitArtistWorks } from "./artists";
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
    ownerId: typeof value.ownerId === "string" ? value.ownerId : undefined,
  };
}

function draftStorageKey(userId?: string | null): string {
  return userId ? `${ARTIST_JOIN_DRAFT_KEY}:${userId}` : ARTIST_JOIN_DRAFT_KEY;
}

function formHasContent(form: ArtistJoinForm): boolean {
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

export function saveSubmittedArtist(artist: Artist, ownerId?: string): StoredArtist[] {
  const stored: StoredArtist = ownerId ? { ...artist, ownerId } : { ...artist };
  const current = loadSubmittedArtists().filter((item) => {
    if (item.slug === stored.slug) return false;
    if (ownerId && item.ownerId === ownerId) return false;
    return true;
  });
  const next = [...current, stored];
  localStorage.setItem(ARTIST_SUBMISSIONS_KEY, JSON.stringify(next));
  return next;
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
  };
}

/** Best-effort remote publish. Never hangs the UI (times out). */
export async function publishArtistRemote(
  artist: Artist,
  ownerId: string,
  timeoutMs = 5000
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Supabase not configured" };

  const payload = {
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
    status: "published",
    owner_id: ownerId,
    updated_at: new Date().toISOString(),
  };

  try {
    const result = await Promise.race([
      client.from("artists").upsert(payload, { onConflict: "slug" }),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(
          () => resolve({ data: null, error: { message: "Remote publish timed out" } }),
          timeoutMs
        )
      ),
    ]);
    if (result.error) {
      console.warn("[artists] remote publish skipped:", result.error.message);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remote publish failed";
    console.warn("[artists] remote publish failed:", message);
    return { ok: false, error: message };
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
