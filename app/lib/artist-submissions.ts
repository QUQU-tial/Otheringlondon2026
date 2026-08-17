import type { Artist, ArtistLinkedItem, ArtistWork } from "./artists";
import { artistSlugFromName, limitArtistWorks } from "./artists";

export const ARTIST_JOIN_DRAFT_KEY = "othering_artist_join_draft_v1";
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

export function isArtistJoinValid(form: ArtistJoinForm): boolean {
  return !!formToArtist(form) && form.accept_terms;
}

function parseStoredArtist(value: unknown): Artist | null {
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
  };
}

export function loadSubmittedArtists(): Artist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTIST_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const artist = parseStoredArtist(item);
      return artist ? [artist] : [];
    });
  } catch {
    return [];
  }
}

export function saveSubmittedArtist(artist: Artist): Artist[] {
  const current = loadSubmittedArtists().filter((item) => item.slug !== artist.slug);
  const next = [...current, artist];
  localStorage.setItem(ARTIST_SUBMISSIONS_KEY, JSON.stringify(next));
  return next;
}

export function saveArtistJoinDraft(form: ArtistJoinForm): void {
  localStorage.setItem(ARTIST_JOIN_DRAFT_KEY, JSON.stringify(form));
}

export function loadArtistJoinDraft(): ArtistJoinForm | null {
  if (typeof window === "undefined") return null;
  try {
    return parseArtistJoinForm(localStorage.getItem(ARTIST_JOIN_DRAFT_KEY));
  } catch {
    return null;
  }
}
