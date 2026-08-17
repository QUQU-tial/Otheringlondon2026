"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getActivities } from "../lib/storage";
import {
  ARTIST_GENRE_OPTIONS,
  ARTIST_MEDIUM_OPTIONS,
  artistMatchesFilters,
  artistPreviewImage,
  buildArtistDirectory,
  groupArtistsByLetter,
  recentlyAddedArtists,
  type Artist,
} from "../lib/artists";
import { loadSubmittedArtists } from "../lib/artist-submissions";
import { WhiteSiteHeader } from "../components/WhiteSiteHeader";

const PEEK_COUNT = 4;
const COMPRESS_PCT = 6;

const nameStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 600,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
} as const;

const ctaStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 500,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
} as const;

const fieldStyle = {
  fontFamily: "var(--font-poppins)",
  fontSize: "clamp(12px, 0.97vw, 14px)",
  fontWeight: 500,
  lineHeight: "normal",
} as const;

const bioStyle = {
  fontFamily: "var(--font-poppins)",
  fontSize: "clamp(12px, 0.97vw, 14px)",
  fontWeight: 500,
  lineHeight: "normal",
} as const;

const filterHeadingStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "16px",
  letterSpacing: "0.08em",
} as const;

const filterItemStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "24px",
} as const;

const letterStyle = {
  fontFamily: "var(--font-inter)",
} as const;

function cellImage(artist: Artist): string | null {
  return artistPreviewImage(artist);
}

function SafeArtImage({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  if (!src || status === "failed") return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onLoad={() => setStatus("ready")}
      onError={() => setStatus("failed")}
      className={`${className ?? ""} ${status === "ready" ? "opacity-100" : "opacity-0"}`.trim()}
    />
  );
}

function toggleFilterValue(current: string[], id: string): string[] {
  if (id === "all") return ["all"];
  const next = current.filter((value) => value !== "all" && value !== id);
  if (current.includes(id)) return next.length === 0 ? ["all"] : next;
  return [...next, id];
}

function peekFrame(index: number, total: number, selectedIndex: number | null) {
  if (selectedIndex === null || total <= 0) {
    return {
      left: `${(index / total) * 100}%`,
      width: `${((total - index) / total) * 100}%`,
    };
  }

  const compressed = COMPRESS_PCT;
  const expanded = 100 - compressed * (total - 1);
  let left = 0;
  for (let i = 0; i < index; i += 1) {
    left += i === selectedIndex ? expanded : compressed;
  }
  return {
    left: `${left}%`,
    width: `${index === selectedIndex ? expanded : compressed}%`,
  };
}

function ArtistPeek({
  artist,
  index,
  total,
  selectedIndex,
  onSelect,
}: {
  artist: Artist;
  index: number;
  total: number;
  selectedIndex: number | null;
  onSelect: () => void;
}) {
  const image = cellImage(artist);
  const isSelected = selectedIndex === index;
  const isCompressed = selectedIndex !== null && !isSelected;
  const frame = peekFrame(index, total, selectedIndex);
  const className = [
    "artist-page-peek text-left",
    isSelected ? "is-expanded" : "",
    isCompressed ? "is-compressed cursor-pointer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const imageClass = isSelected
    ? "bottom-[24px] right-[24px] top-auto h-[min(480px,70%)] w-[min(480px,55%)]"
    : "inset-0";

  const body = (
    <>
      <span className="artist-peek-name z-10 text-black capitalize" style={nameStyle}>
        {artist.name}
      </span>
      {isSelected ? (
        <>
          <div className="artist-peek-copy relative z-10 flex flex-col gap-[12px] px-[16px]">
            {artist.bio ? (
              <p className="max-w-[40ch] text-black" style={bioStyle}>
                {artist.bio}
              </p>
            ) : null}
            <Link
              href={`/artists/${artist.slug}`}
              className="group inline-flex w-fit items-center gap-[12px] text-black capitalize transition-opacity duration-200 ease-out hover:opacity-70 motion-reduce:transition-none"
              style={ctaStyle}
            >
              Read more
              <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-px motion-reduce:transition-none">
                →
              </span>
            </Link>
          </div>
          <span
            className="absolute bottom-[24px] left-[16px] z-10 max-w-[40%] capitalize text-[#9A9A9A]"
            style={fieldStyle}
          >
            {artist.field || ""}
          </span>
        </>
      ) : null}
      {image ? (
        <span className={`artist-peek-image absolute ${imageClass}`}>
          <SafeArtImage
            src={image}
            className="h-full w-full object-cover transition-[opacity,filter] duration-[400ms] ease-out hover:opacity-[0.85] hover:brightness-[0.98] hover:grayscale-[0.1] motion-reduce:transition-none"
          />
        </span>
      ) : null}
    </>
  );

  if (isSelected) {
    return (
      <div className={className} style={{ ...frame, zIndex: 10 }}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={className}
      style={{ ...frame, zIndex: index + 1 }}
      aria-label={artist.name}
    >
      {body}
    </button>
  );
}

function ArtistGridCell({ artist }: { artist: Artist }) {
  const image = cellImage(artist);

  return (
    <Link
      id={`artist-grid-${artist.slug}`}
      href={`/artists/${artist.slug}`}
      className="flex min-h-[200px] flex-col justify-between border-b border-r border-black/20 p-[16px]"
    >
      <span className="text-black capitalize" style={nameStyle}>
        {artist.name}
      </span>
      <div className="mt-[16px] flex items-end justify-between gap-[12px]">
        <span className="min-w-0 capitalize text-[#9A9A9A]" style={fieldStyle}>
          {artist.field || ""}
        </span>
        {image ? (
          <SafeArtImage
            src={image}
            className="h-[96px] w-[96px] shrink-0 object-cover transition-[opacity,filter] duration-[400ms] ease-out hover:opacity-[0.85] hover:brightness-[0.98] hover:grayscale-[0.1] motion-reduce:transition-none"
          />
        ) : null}
      </div>
    </Link>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[12px] text-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-[12px] w-[12px] shrink-0 appearance-none rounded-[2px] border border-black bg-white checked:bg-black"
      />
      <span style={filterItemStyle}>{label}</span>
    </label>
  );
}

function FilterGroup({
  title,
  open,
  onToggle,
  options,
  values,
  onChange,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  options: readonly { id: string; label: string }[];
  values: string[];
  onChange: (id: string) => void;
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-[12px] uppercase text-black ${
          open ? "mb-[12px]" : ""
        }`}
        style={filterHeadingStyle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden>{open ? "∧" : "∨"}</span>
      </button>
      {open ? (
        <div className="flex flex-col gap-[12px]">
          {options.map((option) => (
            <FilterCheckbox
              key={option.id}
              label={option.label}
              checked={values.includes(option.id)}
              onChange={() => onChange(option.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ArtistsPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>(["all"]);
  const [mediums, setMediums] = useState<string[]>(["all"]);
  const [openFilters, setOpenFilters] = useState({
    genre: false,
    medium: false,
  });
  const [submitted, setSubmitted] = useState<Artist[]>(() => loadSubmittedArtists());
  const [artists, setArtists] = useState(() =>
    buildArtistDirectory([], loadSubmittedArtists())
  );

  useEffect(() => {
    const loadedSubmitted = loadSubmittedArtists();
    setSubmitted(loadedSubmitted);
    getActivities().then((activities) => {
      setArtists(buildArtistDirectory(activities, loadedSubmitted));
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artists.filter((artist) => {
      if (q && !artist.name.toLowerCase().includes(q)) return false;
      return artistMatchesFilters(artist, ["all"], genres, mediums);
    });
  }, [artists, query, genres, mediums]);

  const groups = useMemo(() => groupArtistsByLetter(filtered), [filtered]);

  const featured = useMemo(
    () => recentlyAddedArtists(filtered, submitted).slice(0, PEEK_COUNT),
    [filtered, submitted]
  );

  const stacked = useMemo(() => {
    if (!selectedSlug) return featured;
    const selected =
      filtered.find((artist) => artist.slug === selectedSlug) ??
      artists.find((artist) => artist.slug === selectedSlug);
    if (!selected) return featured;
    if (featured.some((artist) => artist.slug === selected.slug)) return featured;
    return [selected, ...featured.filter((artist) => artist.slug !== selected.slug)].slice(
      0,
      PEEK_COUNT
    );
  }, [featured, selectedSlug, filtered, artists]);

  const selectedIndex = selectedSlug
    ? stacked.findIndex((artist) => artist.slug === selectedSlug)
    : -1;
  const resolvedSelectedIndex = selectedIndex >= 0 ? selectedIndex : null;

  useEffect(() => {
    if (selectedSlug && !artists.some((artist) => artist.slug === selectedSlug)) {
      setSelectedSlug(null);
    }
  }, [artists, selectedSlug]);

  const handleSelect = (slug: string) => {
    setSelectedSlug((current) => (current === slug ? null : slug));
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <WhiteSiteHeader current="artists" />
      <div className="flex min-h-0 flex-1 flex-col min-[860px]:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-black/20 min-[860px]:w-[min(320px,28vw)] min-[860px]:border-b-0 min-[860px]:border-r">
          <div className="border-b border-black/10 px-[36px] py-[16px]">
            <label className="block">
              <span className="sr-only">Search artists</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artists"
                className="w-full rounded-[2px] border border-black/20 bg-white px-[12px] py-[8px] text-black placeholder:text-[#999999] focus:outline-none"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: "24px",
                }}
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-[36px] py-[24px] scrollbar-hide">
            {groups.length === 0 ? (
              <p
                className="text-black/50"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                No matches
              </p>
            ) : (
              <div className="flex flex-col gap-[36px]">
                {groups.map((group) => (
                  <section key={group.letter} className="flex flex-col gap-[12px]">
                    <h2
                      className="text-[10px] uppercase tracking-[0.08em] text-[#9A9A9A]"
                      style={letterStyle}
                    >
                      {group.letter}
                    </h2>
                    <ul className="flex flex-col gap-[12px]">
                      {group.artists.map((artist) => (
                        <li key={artist.slug}>
                          <button
                            type="button"
                            onClick={() => handleSelect(artist.slug)}
                            className={`text-left capitalize underline hover:no-underline ${
                              selectedSlug === artist.slug ? "text-red-600" : "text-black"
                            }`}
                            style={nameStyle}
                          >
                            {artist.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="grid shrink-0 grid-cols-1 gap-[36px] border-b border-black/20 px-[24px] py-[16px] min-[860px]:grid-cols-2">
            <FilterGroup
              title="Genre"
              open={openFilters.genre}
              onToggle={() =>
                setOpenFilters((current) => ({ ...current, genre: !current.genre }))
              }
              options={ARTIST_GENRE_OPTIONS}
              values={genres}
              onChange={(id) => setGenres((current) => toggleFilterValue(current, id))}
            />
            <FilterGroup
              title="Medium"
              open={openFilters.medium}
              onToggle={() =>
                setOpenFilters((current) => ({ ...current, medium: !current.medium }))
              }
              options={ARTIST_MEDIUM_OPTIONS}
              values={mediums}
              onChange={(id) => setMediums((current) => toggleFilterValue(current, id))}
            />
          </div>

          <div
            ref={mainRef}
            className="grid min-h-0 flex-1 overflow-y-auto scrollbar-hide [grid-template-rows:100%_auto]"
          >
            <div className="relative min-h-0">
              <div className="artist-page-stack absolute inset-0">
                {stacked.map((artist, index) => (
                  <ArtistPeek
                    key={artist.slug}
                    artist={artist}
                    index={index}
                    total={stacked.length || 1}
                    selectedIndex={resolvedSelectedIndex}
                    onSelect={() => handleSelect(artist.slug)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={scrollToGrid}
                className="absolute bottom-[16px] left-1/2 z-20 -translate-x-1/2 text-black transition-opacity duration-200 ease-out hover:opacity-70 motion-reduce:transition-none"
                style={ctaStyle}
                aria-label="See all artists"
              >
                ∨
              </button>
            </div>

            <div
              ref={gridRef}
              className="grid grid-cols-1 border-t border-black/20 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-4"
            >
              {filtered.map((artist) => (
                <ArtistGridCell key={artist.slug} artist={artist} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
