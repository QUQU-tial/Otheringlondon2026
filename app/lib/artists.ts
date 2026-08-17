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

const EDITORIAL_ARTISTS: Artist[] = [
  {
    slug: "alex-reed",
    name: "Alex Reed",
    field: "Installation artist",
    birth: "b. 1990, London",
    photo: null,
    bio: "Alex Reed is based in London. Their practice looks at how temporary rooms, streets and leftover civic spaces can hold a public without becoming a conventional exhibition.",
    cv: [
      { year: "2012", title: "BA Fine Art", detail: "Goldsmiths, University of London" },
      { year: "2015", title: "MA Contemporary Art", detail: "Royal College of Art, London" },
    ],
    exhibitions: [],
    press: [],
    talks: [],
    works: [],
  },
  {
    slug: "amara-okonkwo",
    name: "Amara Okonkwo",
    field: "Textile artist",
    birth: "b. 1989, Lagos",
    photo:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Amara Okonkwo",
    bio: "Amara Okonkwo works with textile, sound and temporary architecture. Her practice begins in markets, stations and domestic interiors, treating pattern as a way of holding memory in public space. She lives and works between Lagos and London.",
    cv: [
      { year: "2014", title: "BA Fine Art", detail: "Goldsmiths, University of London" },
      { year: "2016", title: "MA Sculpture", detail: "Royal College of Art, London" },
      { year: "2021", title: "Artist residency", detail: "Gasworks, London", href: "https://www.gasworks.org.uk/" },
    ],
    exhibitions: [
      {
        year: "2026",
        title: "Othering London 2026",
        detail: "London",
        href: "/",
      },
      {
        year: "2024",
        title: "Cloth as Threshold",
        detail: "South London Gallery",
        href: "https://www.southlondongallery.org/",
      },
      {
        year: "2022",
        title: "Pattern and Passage",
        detail: "The Showroom, London",
        href: "https://www.theshowroom.org/",
      },
    ],
    press: [
      {
        year: "2024",
        title: "Weaving the city back into view",
        detail: "Frieze",
        href: "https://www.frieze.com/",
      },
      {
        year: "2022",
        title: "Amara Okonkwo on fabric, transit and care",
        detail: "ArtReview",
        href: "https://artreview.com/",
      },
    ],
    talks: [
      {
        year: "2025",
        title: "Place is already an exhibition",
        detail: "Tate Modern, London",
        href: "https://www.tate.org.uk/",
      },
      {
        year: "2023",
        title: "In conversation: textile and public space",
        detail: "Whitechapel Gallery",
        href: "https://www.whitechapelgallery.org/",
      },
    ],
  },
  {
    slug: "chen-wei",
    name: "Chen Wei",
    field: "Photographer",
    birth: "b. 1984, Guangzhou",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd722bf5d?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Chen Wei",
    bio: "Chen Wei uses photography and installation to reconstruct night interiors, shopfronts and after-hours rooms. His images treat the city as a set of paused scenes — lit, emptied, and held just before use.",
    cv: [
      { year: "2007", title: "BA Photography", detail: "Beijing Film Academy" },
      { year: "2019", title: "Artist residency", detail: "Delfina Foundation, London", href: "https://www.delfinafoundation.com/" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "After Hours",
        detail: "Photographers' Gallery, London",
        href: "https://thephotographersgallery.org.uk/",
      },
      {
        year: "2021",
        title: "Closed for the Night",
        detail: "K11 Art Foundation",
        href: "https://www.k11artfoundation.org/",
      },
    ],
    press: [
      {
        year: "2023",
        title: "The rooms that remain when we leave",
        detail: "Aperture",
        href: "https://aperture.org/",
      },
    ],
    talks: [
      {
        year: "2024",
        title: "Staging the empty city",
        detail: "The Photographers' Gallery",
        href: "https://thephotographersgallery.org.uk/",
      },
    ],
  },
  {
    slug: "elena-varga",
    name: "Elena Varga",
    field: "Performance artist",
    birth: "b. 1991, Budapest",
    photo: null,
    bio: "Elena Varga makes performances and scores for streets, courtyards and borrowed rooms. She treats walking, waiting and gathering as materials, and writes instructions that can be carried out by anyone who finds them.",
    cv: [
      { year: "2015", title: "BA Theatre and Performance", detail: "University of Warwick" },
      { year: "2018", title: "MA Contemporary Performance", detail: "Central Saint Martins, London" },
    ],
    exhibitions: [
      {
        year: "2025",
        title: "Instructions for a Courtyard",
        detail: "Block Universe, London",
        href: "https://blockuniverse.co/",
      },
      {
        year: "2022",
        title: "If You Are Here, Begin",
        detail: "LIFT, London",
        href: "https://www.liftfestival.com/",
      },
    ],
    press: [
      {
        year: "2025",
        title: "Scores for the city that is already moving",
        detail: "The Guardian",
        href: "https://www.theguardian.com/artanddesign",
      },
    ],
    talks: [
      {
        year: "2025",
        title: "Performance without a stage",
        detail: "ICA, London",
        href: "https://www.ica.art/",
      },
    ],
  },
  {
    slug: "farah-al-najjar",
    name: "Farah Al-Najjar",
    field: "Filmmaker",
    birth: "b. 1987, Amman",
    photo: null,
    bio: "Farah Al-Najjar works across film, drawing and publication. Her projects follow routes of translation — between Arabic and English, archive and street, caption and image — and ask how a city holds more than one language at once.",
    cv: [
      { year: "2012", title: "BA Graphic Design", detail: "American University of Beirut" },
      { year: "2016", title: "MA Visual Communication", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "Caption, Margin, Street",
        detail: "Mosaic Rooms, London",
        href: "https://mosaicrooms.org/",
      },
      {
        year: "2021",
        title: "Two Scripts, One Pavement",
        detail: "Auto Italia, London",
        href: "https://autoitaliasoutheast.org/",
      },
    ],
    press: [
      {
        year: "2024",
        title: "Reading the city in two directions",
        detail: "e-flux",
        href: "https://www.e-flux.com/",
      },
    ],
    talks: [
      {
        year: "2024",
        title: "Translation as a public practice",
        detail: "Mosaic Rooms",
        href: "https://mosaicrooms.org/",
      },
    ],
  },
  {
    slug: "hiroshi-nakamura",
    name: "Hiroshi Nakamura",
    field: "Architect",
    birth: "b. 1978, Kyoto",
    photo: null,
    bio: "Hiroshi Nakamura builds quiet spatial interventions from timber, paper and borrowed light. He is interested in thresholds — doorways, station underpasses, the pause between two rooms — and in how a small change in structure can alter how a place is used.",
    cv: [
      { year: "2002", title: "BA Architecture", detail: "Kyoto Institute of Technology" },
      { year: "2006", title: "MA Architecture", detail: "Architectural Association, London" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "A Door That Remembers",
        detail: "Design Museum, London",
        href: "https://designmuseum.org/",
      },
      {
        year: "2020",
        title: "Underpass",
        detail: "Architecture Foundation",
        href: "https://www.architecturefoundation.org.uk/",
      },
    ],
    press: [
      {
        year: "2023",
        title: "Building less, holding more",
        detail: "Dezeen",
        href: "https://www.dezeen.com/",
      },
    ],
    talks: [
      {
        year: "2023",
        title: "Thresholds and temporary structure",
        detail: "Architectural Association",
        href: "https://www.aaschool.ac.uk/",
      },
    ],
  },
  {
    slug: "ines-moreau",
    name: "Inès Moreau",
    field: "Moving-image artist",
    birth: "b. 1993, Lyon",
    photo: null,
    bio: "Inès Moreau makes moving-image works from found footage, radio and field recording. She edits with the grain of public noise — announcements, weather, crowd — and treats the soundtrack of a city as an archive that is still being written.",
    cv: [
      { year: "2015", title: "BA Film Studies", detail: "Université Paris 8" },
      { year: "2018", title: "MA Moving Image", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "Announcement, Please Stand Clear",
        detail: "LUX, London",
        href: "https://lux.org.uk/",
      },
      {
        year: "2022",
        title: "Weather for the Platform",
        detail: "Chisenhale Gallery",
        href: "https://chisenhale.org.uk/",
      },
    ],
    press: [
      {
        year: "2024",
        title: "Listening to the leftover city",
        detail: "Sight and Sound",
        href: "https://www.bfi.org.uk/sight-and-sound",
      },
    ],
    talks: [
      {
        year: "2024",
        title: "Field recording as civic document",
        detail: "LUX",
        href: "https://lux.org.uk/",
      },
    ],
  },
  {
    slug: "jordan-blake",
    name: "Jordan Blake",
    field: "Sculptor",
    birth: "b. 1990, Manchester",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Jordan Blake",
    bio: "Jordan Blake works with sculpture, print and circulating objects. He is interested in how things move through a city — flyers, keys, tickets, leftover furniture — and how an exhibition can begin from what is already being passed from hand to hand.",
    cv: [
      { year: "2013", title: "BA Fine Art", detail: "Manchester School of Art" },
      { year: "2017", title: "Postgraduate Diploma", detail: "Royal Academy Schools, London" },
    ],
    exhibitions: [
      {
        year: "2025",
        title: "Pass It On",
        detail: "Studio Voltaire, London",
        href: "https://www.studiovoltaire.org/",
      },
      {
        year: "2021",
        title: "Ticket, Stub, Remainder",
        detail: "Peckham Platform",
        href: "https://www.peckhamplatform.com/",
      },
    ],
    press: [
      {
        year: "2025",
        title: "Objects that refuse to stay still",
        detail: "Studio International",
        href: "https://www.studiointernational.com/",
      },
    ],
    talks: [
      {
        year: "2025",
        title: "Circulation as a method",
        detail: "Studio Voltaire",
        href: "https://www.studiovoltaire.org/",
      },
    ],
  },
  {
    slug: "lila-raman",
    name: "Lila Raman",
    field: "Draughtsperson",
    birth: "b. 1986, Chennai",
    photo:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Lila Raman",
    bio: "Lila Raman makes drawings, maps and walking pieces that follow unofficial routes through London. Her work collects shortcuts, closed paths and vernacular names, treating the city as a document that is rewritten every time someone takes a different way home.",
    cv: [
      { year: "2009", title: "BFA Painting", detail: "Faculty of Fine Arts, MSU Baroda" },
      { year: "2013", title: "MA Print", detail: "Royal College of Art, London" },
      { year: "2020", title: "Artist residency", detail: "Hospitalfield", href: "https://hospitalfield.org.uk/" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "Another Way Home",
        detail: "Drawing Room, London",
        href: "https://drawingroom.org.uk/",
      },
      {
        year: "2019",
        title: "Closed Path, Open Name",
        detail: "Raven Row, London",
        href: "https://www.ravenrow.org/",
      },
    ],
    press: [
      {
        year: "2024",
        title: "Maps that prefer the unofficial city",
        detail: "Art Monthly",
        href: "https://www.artmonthly.co.uk/",
      },
    ],
    talks: [
      {
        year: "2024",
        title: "Walking as research",
        detail: "Drawing Room",
        href: "https://drawingroom.org.uk/",
      },
    ],
  },
  {
    slug: "mateo-silva",
    name: "Mateo Silva",
    field: "Sound artist",
    birth: "b. 1982, Bogotá",
    photo: null,
    bio: "Mateo Silva works with sound, radio and temporary broadcast. He sets up listening stations in parks, underpasses and unused rooms, asking how a public can gather around a frequency rather than a wall.",
    cv: [
      { year: "2005", title: "BA Music", detail: "Universidad de los Andes, Bogotá" },
      { year: "2011", title: "MA Sound Arts", detail: "London College of Communication" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "Station for a Frequency",
        detail: "Serpentine, London",
        href: "https://www.serpentinegalleries.org/",
      },
      {
        year: "2020",
        title: "Hold the Line",
        detail: "Resonance Extra",
        href: "https://extra.resonance.fm/",
      },
    ],
    press: [
      {
        year: "2023",
        title: "When the exhibition is a broadcast",
        detail: "The Wire",
        href: "https://www.thewire.co.uk/",
      },
    ],
    talks: [
      {
        year: "2023",
        title: "Publics that gather by listening",
        detail: "Serpentine",
        href: "https://www.serpentinegalleries.org/",
      },
    ],
  },
  {
    slug: "nadia-hassan",
    name: "Nadia Hassan",
    field: "Photographer",
    birth: "b. 1992, Khartoum",
    photo: null,
    bio: "Nadia Hassan works with photography, writing and community workshops. Her projects stay with a single street or building long enough for its daily use to become the work — opening, closing, waiting, repair.",
    cv: [
      { year: "2014", title: "BA Photography", detail: "University of Westminster" },
      { year: "2018", title: "MA Documentary", detail: "National Film and Television School" },
    ],
    exhibitions: [
      {
        year: "2025",
        title: "The Building Keeps Hours",
        detail: "Autograph, London",
        href: "https://autograph.org.uk/",
      },
      {
        year: "2022",
        title: "Open / Closed",
        detail: "Four Corners, London",
        href: "https://www.fourcornersfilm.co.uk/",
      },
    ],
    press: [
      {
        year: "2025",
        title: "Staying with one address",
        detail: "British Journal of Photography",
        href: "https://www.1854.photography/",
      },
    ],
    talks: [
      {
        year: "2025",
        title: "Workshop as exhibition",
        detail: "Autograph",
        href: "https://autograph.org.uk/",
      },
    ],
  },
  {
    slug: "priya-shah",
    name: "Priya Shah",
    field: "Installation artist",
    birth: "b. 1988, Leicester",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Priya Shah",
    bio: "Priya Shah makes installations from light, glass and borrowed shopfronts. She is interested in display as a civic act — how a window, a vitrine or a closed gallery after hours can still hold an audience that is only passing.",
    cv: [
      { year: "2010", title: "BA Fine Art", detail: "Slade School of Fine Art, UCL" },
      { year: "2014", title: "Associate Artist", detail: "Studio Voltaire, London", href: "https://www.studiovoltaire.org/" },
    ],
    exhibitions: [
      {
        year: "2024",
        title: "After the Shutters",
        detail: "Camden Art Centre",
        href: "https://camdenartcentre.org/",
      },
      {
        year: "2021",
        title: "Vitrine for No One and Everyone",
        detail: "Peer, London",
        href: "https://www.peeruk.org/",
      },
    ],
    press: [
      {
        year: "2024",
        title: "The shop window as a public room",
        detail: "Apollo",
        href: "https://www.apollo-magazine.com/",
      },
    ],
    talks: [
      {
        year: "2024",
        title: "Display after hours",
        detail: "Camden Art Centre",
        href: "https://camdenartcentre.org/",
      },
    ],
  },
  {
    slug: "rosa-delgado",
    name: "Rosa Delgado",
    field: "Ceramicist",
    birth: "b. 1985, Mexico City",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Rosa Delgado",
    bio: "Rosa Delgado works with ceramics, food and shared tables. Her projects turn kitchens, markets and leftover civic rooms into places of assembly, asking what an exhibition owes to the people who already use a space.",
    cv: [
      { year: "2008", title: "BA Visual Arts", detail: "ENPEG La Esmeralda, Mexico City" },
      { year: "2015", title: "MA Ceramics", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2023",
        title: "A Table Is Already a Room",
        detail: "Studio Voltaire, London",
        href: "https://www.studiovoltaire.org/",
      },
      {
        year: "2019",
        title: "Market Hours",
        detail: "Jerwood Arts",
        href: "https://jerwoodarts.org/",
      },
    ],
    press: [
      {
        year: "2023",
        title: "Hospitality as sculpture",
        detail: "Ceramic Review",
        href: "https://www.ceramicreview.com/",
      },
    ],
    talks: [
      {
        year: "2023",
        title: "Who is already here",
        detail: "Studio Voltaire",
        href: "https://www.studiovoltaire.org/",
      },
    ],
  },
  {
    slug: "soren-lindqvist",
    name: "Soren Lindqvist",
    field: "Filmmaker",
    birth: "b. 1976, Malmö",
    photo: null,
    bio: "Soren Lindqvist makes slow films and written durations for specific rooms. He is interested in how long a place can be looked at before it changes, and in the ethics of staying with a site that was not built for art.",
    cv: [
      { year: "2001", title: "BA Film", detail: "Stockholm University of the Arts" },
      { year: "2009", title: "Artist residency", detail: "Kunstlerhaus Bethanien, Berlin" },
    ],
    exhibitions: [
      {
        year: "2022",
        title: "Duration for a Waiting Room",
        detail: "Tate Britain",
        href: "https://www.tate.org.uk/",
      },
      {
        year: "2018",
        title: "Still Here",
        detail: "Moderna Museet",
        href: "https://www.modernamuseet.se/stockholm/en/",
      },
    ],
    press: [
      {
        year: "2022",
        title: "Looking until the room answers",
        detail: "Artforum",
        href: "https://www.artforum.com/",
      },
    ],
    talks: [
      {
        year: "2022",
        title: "Duration and the uncommissioned site",
        detail: "Tate Britain",
        href: "https://www.tate.org.uk/",
      },
    ],
  },
  {
    slug: "yara-haddad",
    name: "Yara Haddad",
    field: "Printmaker",
    birth: "b. 1994, Beirut",
    photo:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Yara Haddad",
    bio: "Yara Haddad works with print, protest ephemera and small-run publications. She collects what a city leaves on walls and pavements — notices, refusals, invitations — and reprints them as a record of public speech that was never meant to last.",
    cv: [
      { year: "2016", title: "BA Graphic Design", detail: "American University of Beirut" },
      { year: "2020", title: "MA Print", detail: "Royal College of Art, London" },
    ],
    exhibitions: [
      {
        year: "2025",
        title: "Notices That Did Not Stay",
        detail: "The Mosaic Rooms, London",
        href: "https://mosaicrooms.org/",
      },
      {
        year: "2023",
        title: "Reprint the Street",
        detail: "Book Works",
        href: "https://www.bookworks.org.uk/",
      },
    ],
    press: [
      {
        year: "2025",
        title: "The wall as a publishing house",
        detail: "Afterall",
        href: "https://www.afterall.org/",
      },
    ],
    talks: [
      {
        year: "2025",
        title: "Ephemera and public speech",
        detail: "Book Works",
        href: "https://www.bookworks.org.uk/",
      },
    ],
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
  if (field.includes("install") || field.includes("architect")) return "spatial";
  if (field.includes("performance")) return "performance";
  if (field.includes("film") || field.includes("moving") || field.includes("sound")) return "time-based";
  if (field.includes("photo")) return "lens";
  if (
    field.includes("sculpt") ||
    field.includes("ceramic") ||
    field.includes("print") ||
    field.includes("draught") ||
    field.includes("draw") ||
    field.includes("textile")
  ) {
    return "material";
  }
  return null;
}

export function artistMediumId(artist: Artist): Exclude<ArtistMediumId, "all"> | null {
  const field = (artist.field || "").toLowerCase();
  if (field.includes("install") || field.includes("architect")) return "installation";
  if (field.includes("sculpt") || field.includes("ceramic")) return "sculpture";
  if (field.includes("photo")) return "photography";
  if (field.includes("film") || field.includes("moving")) return "film";
  if (field.includes("sound")) return "sound";
  if (field.includes("performance")) return "performance";
  if (field.includes("textile")) return "textile";
  if (field.includes("print")) return "print";
  if (field.includes("draught") || field.includes("draw")) return "paper";
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
