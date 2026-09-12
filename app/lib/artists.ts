import type { Activity } from "./storage";
import { stripHtml } from "../submit/form/form-helpers";

export type ArtistLinkedItem = {
  year?: string;
  title: string;
  detail?: string;
  href?: string;
};

export type ArtistWork = {
  src: string;
  alt?: string;
};

export type Artist = {
  slug: string;
  name: string;
  field?: string;
  birth?: string;
  photo?: string | null;
  photoAlt?: string;
  bio: string;
  cv: ArtistLinkedItem[];
  exhibitions: ArtistLinkedItem[];
  press: ArtistLinkedItem[];
  talks: ArtistLinkedItem[];
  works?: ArtistWork[];
};

const MAX_WORKS = 5;

export function limitArtistWorks(works: ArtistWork[] | undefined): ArtistWork[] {
  return (works ?? []).filter((work) => typeof work.src === "string" && work.src.length > 0).slice(0, MAX_WORKS);
}

export function artistSlugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Editorial roster drawn from living artists listed on newexhibitions.com (random sample). */
const EDITORIAL_ARTISTS: Artist[] = [
  {
    slug: "stacey-gillian-abe",
    name: "Stacey Gillian Abe",
    field: "Multidisciplinary artist",
    birth: "b. 1990, Kampala",
    photo:
      "https://www.newexhibitions.com/uploads/f/3/large/636130bfb6c79.png",
    photoAlt: "Stacey Gillian Abe",
    bio: "Stacey Gillian Abe works across painting, embroidery and installation. Her images build surreal interiors that revisit memory, gender and spiritual inheritance, often through a cool indigo palette. She lives and works in Uganda.",
    cv: [
      { year: "2014", title: "BA Art and Industrial Design", detail: "Kyambogo University, Kampala" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "In Praise of Black Errantry",
        detail: "60th Venice Biennale",
        href: "https://www.labiennale.org/",
      },
      {
        year: "2022",
        title: "Shrub-let of Old Ayivu",
        detail: "Unit London",
        href: "https://unitlondon.com/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "zarouhie-abdalian",
    name: "Zarouhie Abdalian",
    field: "Installation artist",
    birth: "b. 1982, New Orleans",
    photo:
      "https://www.newexhibitions.com/uploads/d/4/large/640a101720ffe.jpeg",
    photoAlt: "Zarouhie Abdalian",
    bio: "Zarouhie Abdalian makes site-responsive installations and sculptures that listen to rooms, streets and infrastructures already in use. Sound, light and subtle structural shifts often mark what a place is doing before art arrives. She lives and works in New Orleans.",
    cv: [
      { year: "2012", title: "SECA Art Award", detail: "SFMOMA" },
      { year: "2020", title: "Painters & Sculptors Grant", detail: "Joan Mitchell Foundation" },
    ],
    exhibitions: [
      {
        year: "2017",
        title: "Whitney Biennial",
        detail: "Whitney Museum of American Art, New York",
        href: "https://whitney.org/",
      },
      {
        year: "2014",
        title: "8th Berlin Biennale",
        detail: "Berlin",
        href: "https://www.berlinbiennale.de/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "nina-chanel-abney",
    name: "Nina Chanel Abney",
    field: "Painter",
    birth: "b. 1982, Chicago",
    photo:
      "https://www.newexhibitions.com/uploads/a/2/large/6560d5f49a093.jpeg",
    photoAlt: "Nina Chanel Abney",
    bio: "Nina Chanel Abney paints dense, graphic scenes that cut between news cycles, popular culture and coded symbols. Colour and speed do the storytelling: figures, signs and headlines collide in a single plane. She lives and works in New York.",
    cv: [],
    exhibitions: [
      {
        year: "2017",
        title: "Royal Flush",
        detail: "Nasher Museum of Art",
        href: "https://nasher.duke.edu/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "larry-achiampong",
    name: "Larry Achiampong",
    field: "Filmmaker",
    birth: "b. 1984, London",
    photo:
      "https://www.newexhibitions.com/uploads/b/0/large/6218c9c7a2688.jpeg",
    photoAlt: "Larry Achiampong",
    bio: "Larry Achiampong works across film, sound, performance and installation. His projects revisit colonial histories, gaming aesthetics and speculative futures, often through avatars, scores and archive. He lives and works in London.",
    cv: [
      { year: "2008", title: "BA Fine Art", detail: "University of Westminster" },
      { year: "2011", title: "MA Fine Art", detail: "Slade School of Fine Art, UCL" },
    ],
    exhibitions: [
      {
        year: "2022",
        title: "Relic Traveller",
        detail: "Turner Contemporary / touring",
        href: "https://turnercontemporary.org/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "charles-avery",
    name: "Charles Avery",
    field: "Draughtsperson",
    birth: "b. 1973, Oban",
    photo:
      "https://www.newexhibitions.com/uploads/3/b/large/66966a245c544.jpeg",
    photoAlt: "Charles Avery",
    bio: "Charles Avery has worked since 2004 on The Islanders, an evolving invented territory told through drawing, sculpture, text and objects. The project treats world-building as a way to test philosophy, mathematics and how places are imagined. He lives and works between London and Mull.",
    cv: [],
    exhibitions: [
      {
        year: "2007",
        title: "Scotland + Venice",
        detail: "52nd Venice Biennale",
        href: "https://www.labiennale.org/",
      },
      {
        year: "2008",
        title: "The Islanders: An Introduction",
        detail: "Parasol Unit, London",
        href: "https://parasol-unit.org/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "tania-bruguera",
    name: "Tania Bruguera",
    field: "Performance artist",
    birth: "b. 1968, Havana",
    photo: null,
    bio: "Tania Bruguera makes performance and long-term civic projects that treat art as a form of political behaviour. Her work asks what happens when spectators become citizens, and when institutions have to answer to the public they claim to serve.",
    cv: [],
    exhibitions: [
      {
        year: "2018",
        title: "Untitled (Havana, 2000)",
        detail: "MoMA, New York",
        href: "https://www.moma.org/",
      },
      {
        year: "2019",
        title: "Commission for Turbine Hall",
        detail: "Tate Modern, London",
        href: "https://www.tate.org.uk/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "adam-buick",
    name: "Adam Buick",
    field: "Ceramicist",
    birth: "b. 1978, Pembrokeshire",
    photo:
      "https://www.newexhibitions.com/uploads/2/9/large/6556558ded412.jpeg",
    photoAlt: "Adam Buick",
    bio: "Adam Buick works with a single jar form as a way of mapping landscape. Local clay, stone and coastal material enter the vessel so each firing records a specific place. He lives and works in Pembrokeshire, Wales.",
    cv: [],
    exhibitions: [
      {
        year: "2026",
        title: "Oriel Tir",
        detail: "St Davids",
        href: "https://www.adambuick.com/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "helen-cammock",
    name: "Helen Cammock",
    field: "Moving-image artist",
    birth: "b. 1970, Staffordshire",
    photo:
      "https://www.newexhibitions.com/uploads/0/7/large/624d5716072d3.jpeg",
    photoAlt: "Helen Cammock",
    bio: "Helen Cammock works across film, photography, print, text, song and performance. She layers voices and archives to follow how histories of Blackness, labour, gender and resistance keep returning in the present. She lives and works in London.",
    cv: [
      { year: "2017", title: "Max Mara Art Prize for Women", detail: "Whitechapel Gallery" },
      { year: "2019", title: "Turner Prize", detail: "Joint recipient" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "On WindTides",
        detail: "The Line, London",
        href: "https://the-line.org/",
      },
      {
        year: "2021",
        title: "Concrete and Porcelain Tacks",
        detail: "The Photographers' Gallery, London",
        href: "https://thephotographersgallery.org.uk/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "matt-connors",
    name: "Matt Connors",
    field: "Painter",
    birth: "b. 1973, Chicago",
    photo:
      "https://www.newexhibitions.com/uploads/a/b/large/6a7c44c57d49c.jpeg",
    photoAlt: "Matt Connors",
    bio: "Matt Connors approaches painting as a way of thinking through images — pattern, reversal, scale shift and citation. Studio observation meets poetry, design and found pictures until the painting develops its own internal logic. He lives and works between New York and Los Angeles.",
    cv: [
      { year: "1995", title: "BFA", detail: "Bennington College" },
      { year: "2006", title: "MFA", detail: "Yale University" },
    ],
    exhibitions: [
      {
        year: "2022",
        title: "Whitney Biennial: Quiet as It's Kept",
        detail: "Whitney Museum of American Art, New York",
        href: "https://whitney.org/",
      },
      {
        year: "2024",
        title: "Finding Aid",
        detail: "Goldsmiths CCA, London",
        href: "https://goldsmithscca.art/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "erik-frydenborg",
    name: "Erik Frydenborg",
    field: "Sculptor",
    birth: "b. 1977, Los Angeles",
    photo:
      "https://www.newexhibitions.com/uploads/f/0/large/62ea56163bfd0.jpeg",
    photoAlt: "Erik Frydenborg",
    bio: "Erik Frydenborg makes sculpture and wall works from cast, carved and painted materials that feel half-biological, half-industrial. Forms sit between specimen, signage and leftover product. He lives and works in Los Angeles.",
    cv: [
      { year: "1999", title: "BFA", detail: "Maryland Institute College of Art" },
      { year: "2005", title: "MFA", detail: "University of Southern California" },
    ],
    exhibitions: [
      {
        year: "2021",
        title: "Shear Stress",
        detail: "The Pit, Glendale",
        href: "https://www.the-pit.la/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "liam-gillick",
    name: "Liam Gillick",
    field: "Installation artist",
    birth: "b. 1964, Aylesbury",
    photo:
      "https://www.newexhibitions.com/uploads/4/b/large/6794f85540a00.jpeg",
    photoAlt: "Liam Gillick",
    bio: "Liam Gillick works with installation, text, design and speculative scenarios that examine how social systems are organised. Platforms, screens and written propositions often stand in for the spaces where decisions are supposed to happen. He lives and works in New York.",
    cv: [],
    exhibitions: [
      {
        year: "2009",
        title: "German Pavilion",
        detail: "53rd Venice Biennale",
        href: "https://www.labiennale.org/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "lydia-pettit",
    name: "Lydia Pettit",
    field: "Painter",
    birth: "b. 1991, Maryland",
    photo:
      "https://www.newexhibitions.com/uploads/2/2/large/66a3b3773b683.jpeg",
    photoAlt: "Lydia Pettit",
    bio: "Lydia Pettit works with painting, textile and video to look at trauma, body politics and self-image. Horror cinema becomes a language for anger, fear and recovery rather than spectacle. She lives and works in London.",
    cv: [
      { year: "2014", title: "BFA Painting", detail: "Maryland Institute College of Art" },
      { year: "2020", title: "MA Painting", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "In Your Anger, I See Fear",
        detail: "Galerie Judin, Berlin",
        href: "https://www.galeriejudin.com/",
      },
      {
        year: "2021",
        title: "Solo exhibition",
        detail: "White Cube, London",
        href: "https://www.whitecube.com/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "tabita-rezaire",
    name: "Tabita Rezaire",
    field: "Moving-image artist",
    birth: "b. 1989, Paris",
    photo:
      "https://www.newexhibitions.com/uploads/5/d/large/6245943045d26.jpeg",
    photoAlt: "Tabita Rezaire",
    bio: "Tabita Rezaire works across video, installation and collective practice where technology, spirituality and decolonial healing meet. Screens become sites for reconnecting body, network and ancestral knowledge. She lives and works in Cayenne, French Guiana.",
    cv: [
      { year: "2015", title: "MA Artist Moving Image", detail: "Central Saint Martins, London" },
    ],
    exhibitions: [
      {
        year: "2018",
        title: "Guangzhou Triennial",
        detail: "Guangzhou",
      },
      {
        year: "2016",
        title: "Berlin Biennale",
        detail: "Berlin",
        href: "https://www.berlinbiennale.de/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "nigatu-tsehay",
    name: "Nigatu Tsehay",
    field: "Painter",
    birth: "b. 1981, Addis Ababa",
    photo:
      "https://www.newexhibitions.com/uploads/6/2/large/626152a10c84e.png",
    photoAlt: "Nigatu Tsehay",
    bio: "Nigatu Tsehay paints figures that hold social and emotional ambiguity — skin tones shift, gestures pause, and identity stays open. The work connects Addis Ababa and Germany through a shared attention to the human form. He lives and works in Germany.",
    cv: [
      { year: "2005", title: "Fine Art", detail: "Alle School of Fine Arts & Design, Addis Ababa University" },
      { year: "2014", title: "Studies", detail: "State Academy of Art and Design, Stuttgart" },
    ],
    exhibitions: [],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "guimi-you",
    name: "Guimi You",
    field: "Painter",
    birth: "b. 1985, South Korea",
    photo:
      "https://www.newexhibitions.com/uploads/6/9/large/66eaa546db5af.png",
    photoAlt: "Guimi You",
    bio: "Guimi You paints soft, dream-like scenes where domestic life and landscape blur. Trained in Korean portraiture and landscape traditions, she lets figures and places feel slightly unfixed in time. She studied in Seoul and London.",
    cv: [
      { year: "2014", title: "MA Painting", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "NGV Triennial",
        detail: "National Gallery of Victoria, Melbourne",
        href: "https://www.ngv.vic.gov.au/",
      },
    ],
    press: [],
    talks: [],
    works: [],
  },
];

function cloneArtist(artist: Artist): Artist {
  return {
    ...artist,
    cv: [...artist.cv],
    exhibitions: [...artist.exhibitions],
    press: [...artist.press],
    talks: [...artist.talks],
    works: limitArtistWorks(artist.works ?? []),
  };
}

function artistFromActivity(activity: Activity, name: string, slug: string): Artist {
  const photo =
    activity.primary_image &&
    (activity.primary_image.startsWith("http") || activity.primary_image.startsWith("data:image"))
      ? activity.primary_image
      : null;
  const bio =
    stripHtml(activity.activity_description || "") ||
    stripHtml(activity.body_text_1 || "") ||
    `${name} is part of Othering London 2026.`;

  return {
    slug,
    name,
    photo,
    photoAlt: name,
    bio,
    field: activity.activity_type?.trim() || undefined,
    cv: [],
    exhibitions: [],
    press: [],
    talks: [],
    works: [],
  };
}

function exhibitionFromActivity(activity: Activity): ArtistLinkedItem {
  return {
    year: activity.activity_date || undefined,
    title: activity.activity_title,
    detail: [activity.activity_location, activity.activity_area].filter(Boolean).join(", ") || undefined,
    href: `/?activityId=${activity.id}`,
  };
}

export function getEditorialArtists(): Artist[] {
  return EDITORIAL_ARTISTS.map(cloneArtist);
}

export function buildArtistDirectory(
  activities: Activity[],
  submitted: Artist[] = []
): Artist[] {
  const bySlug = new Map<string, Artist>();

  for (const artist of EDITORIAL_ARTISTS) {
    bySlug.set(artist.slug, cloneArtist(artist));
  }

  for (const artist of submitted) {
    const slug = artist.slug || artistSlugFromName(artist.name);
    if (!slug) continue;
    bySlug.set(slug, cloneArtist({ ...artist, slug }));
  }

  for (const activity of activities) {
    const name = (activity.author_name || activity.username || "").trim();
    if (!name) continue;
    const slug = artistSlugFromName(name);
    if (!slug) continue;

    const existing = bySlug.get(slug);
    if (existing) {
      const already = existing.exhibitions.some((item) => item.href === `/?activityId=${activity.id}`);
      if (!already) {
        existing.exhibitions = [exhibitionFromActivity(activity), ...existing.exhibitions];
      }
      continue;
    }

    const created = artistFromActivity(activity, name, slug);
    created.exhibitions = [exhibitionFromActivity(activity)];
    bySlug.set(slug, created);
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function findArtistBySlug(
  slug: string,
  activities: Activity[],
  submitted: Artist[] = []
): Artist | null {
  return buildArtistDirectory(activities, submitted).find((artist) => artist.slug === slug) ?? null;
}

export function groupArtistsByLetter(artists: Artist[]): { letter: string; artists: Artist[] }[] {
  const groups = new Map<string, Artist[]>();
  for (const artist of artists) {
    const letter = artist.name.trim().charAt(0).toUpperCase() || "#";
    const key = /[A-Z]/.test(letter) ? letter : "#";
    const list = groups.get(key) ?? [];
    list.push(artist);
    groups.set(key, list);
  }

  const letters = Array.from(groups.keys()).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return letters.map((letter) => ({ letter, artists: groups.get(letter) ?? [] }));
}

export function artistPreviewImage(artist: Artist): string | null {
  const photo = artist.photo;
  if (photo && (photo.startsWith("http") || photo.startsWith("data:image"))) return photo;
  return null;
}

export function recentlyAddedArtists(artists: Artist[], submitted: Artist[]): Artist[] {
  const bySlug = new Map(artists.map((artist) => [artist.slug, artist]));
  const ordered: Artist[] = [];
  const seen = new Set<string>();

  for (const item of [...submitted].reverse()) {
    const artist = bySlug.get(item.slug);
    if (!artist || seen.has(artist.slug)) continue;
    ordered.push(artist);
    seen.add(artist.slug);
  }

  for (const artist of artists) {
    if (seen.has(artist.slug)) continue;
    ordered.push(artist);
    seen.add(artist.slug);
  }

  return ordered;
}

export const ARTIST_WHEN_OPTIONS = [
  { id: "all", label: "Show all" },
  { id: "current", label: "Currently exhibiting" },
  { id: "soon", label: "Exhibiting soon" },
] as const;

export const ARTIST_GENRE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "spatial", label: "Spatial practice" },
  { id: "performance", label: "Performance" },
  { id: "time-based", label: "Time-based" },
  { id: "lens", label: "Lens-based" },
  { id: "material", label: "Object & material" },
] as const;

export const ARTIST_MEDIUM_OPTIONS = [
  { id: "all", label: "All" },
  { id: "installation", label: "Installation" },
  { id: "sculpture", label: "Sculpture" },
  { id: "photography", label: "Photography" },
  { id: "film", label: "Film" },
  { id: "sound", label: "Sound art" },
  { id: "performance", label: "Performance art" },
  { id: "textile", label: "Textile" },
  { id: "print", label: "Prints" },
  { id: "paper", label: "Works on paper" },
] as const;

export type ArtistWhenId = (typeof ARTIST_WHEN_OPTIONS)[number]["id"];
export type ArtistGenreId = (typeof ARTIST_GENRE_OPTIONS)[number]["id"];
export type ArtistMediumId = (typeof ARTIST_MEDIUM_OPTIONS)[number]["id"];

function exhibitionYears(artist: Artist): number[] {
  return artist.exhibitions
    .map((item) => Number.parseInt(item.year || "", 10))
    .filter((year) => Number.isFinite(year));
}

export function artistWhenId(artist: Artist): Exclude<ArtistWhenId, "all"> | "other" {
  const years = exhibitionYears(artist);
  const hasFestival =
    artist.exhibitions.some((item) => /othering/i.test(item.title)) || years.includes(2026);
  if (hasFestival || years.some((year) => year >= 2025)) return "current";
  const max = years.reduce((highest, year) => Math.max(highest, year), 0);
  if (max === 2024) return "soon";
  return "other";
}

export function artistGenreId(artist: Artist): Exclude<ArtistGenreId, "all"> | null {
  const field = (artist.field || "").toLowerCase();
  if (field.includes("install") || field.includes("architect") || field.includes("multidisciplinary")) {
    return "spatial";
  }
  if (field.includes("performance")) return "performance";
  if (field.includes("film") || field.includes("moving") || field.includes("sound")) return "time-based";
  if (field.includes("photo")) return "lens";
  if (
    field.includes("sculpt") ||
    field.includes("ceramic") ||
    field.includes("print") ||
    field.includes("draught") ||
    field.includes("draw") ||
    field.includes("paint") ||
    field.includes("textile")
  ) {
    return "material";
  }
  return null;
}

export function artistMediumId(artist: Artist): Exclude<ArtistMediumId, "all"> | null {
  const field = (artist.field || "").toLowerCase();
  if (field.includes("install") || field.includes("architect") || field.includes("multidisciplinary")) {
    return "installation";
  }
  if (field.includes("sculpt") || field.includes("ceramic")) return "sculpture";
  if (field.includes("photo")) return "photography";
  if (field.includes("film") || field.includes("moving")) return "film";
  if (field.includes("sound")) return "sound";
  if (field.includes("performance")) return "performance";
  if (field.includes("textile")) return "textile";
  if (field.includes("print")) return "print";
  if (field.includes("draught") || field.includes("draw") || field.includes("paint")) return "paper";
  return null;
}

export function artistMatchesFilters(
  artist: Artist,
  when: string[],
  genres: string[],
  mediums: string[]
): boolean {
  const whenActive = when.filter((id) => id !== "all");
  if (whenActive.length > 0 && !whenActive.includes(artistWhenId(artist))) return false;

  const genreActive = genres.filter((id) => id !== "all");
  if (genreActive.length > 0) {
    const genre = artistGenreId(artist);
    if (!genre || !genreActive.includes(genre)) return false;
  }

  const mediumActive = mediums.filter((id) => id !== "all");
  if (mediumActive.length > 0) {
    const medium = artistMediumId(artist);
    if (!medium || !mediumActive.includes(medium)) return false;
  }

  return true;
}
