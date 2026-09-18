"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getActivities } from "../lib/storage";
import {
  ARTIST_GENRE_OPTIONS,
  ARTIST_MEDIUM_OPTIONS,
  artistMatchesFilters,
  buildArtistDirectory,
  groupArtistsByLetter,
} from "../lib/artists";
import { loadAllSubmittedArtists } from "../lib/artist-submissions";
import { WhiteSiteHeader } from "../components/WhiteSiteHeader";

const nameStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 600,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
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

function toggleFilterValue(current: string[], id: string): string[] {
  if (id === "all") return ["all"];
  const next = current.filter((value) => value !== "all" && value !== id);
  if (current.includes(id)) return next.length === 0 ? ["all"] : next;
  return [...next, id];
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
    <label className="flex cursor-pointer items-center gap-[12px] text-white min-[860px]:text-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-[12px] w-[12px] shrink-0 appearance-none rounded-[2px] border border-white bg-black checked:bg-white min-[860px]:border-black min-[860px]:bg-white min-[860px]:checked:bg-black"
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
        className={`flex w-full items-center justify-between gap-[12px] uppercase text-white min-[860px]:text-black ${
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
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<string[]>(["all"]);
  const [mediums, setMediums] = useState<string[]>(["all"]);
  const [openFilters, setOpenFilters] = useState({
    genre: false,
    medium: false,
  });
  const [artists, setArtists] = useState(() => buildArtistDirectory([], []));

  useEffect(() => {
    let cancelled = false;
    Promise.all([getActivities(), loadAllSubmittedArtists()]).then(([activities, loadedSubmitted]) => {
      if (cancelled) return;
      setArtists(buildArtistDirectory(activities, loadedSubmitted));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artists.filter((artist) => {
      if (q && !artist.name.toLowerCase().includes(q)) return false;
      return artistMatchesFilters(artist, ["all"], genres, mediums);
    });
  }, [artists, query, genres, mediums]);

  const groups = useMemo(() => groupArtistsByLetter(filtered), [filtered]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white min-[860px]:h-screen min-[860px]:overflow-hidden min-[860px]:bg-white min-[860px]:text-[#1C1C1C]">
      <WhiteSiteHeader current="artists" />
      <div className="flex min-h-0 flex-1 flex-col min-[860px]:flex-row min-[860px]:overflow-hidden">
        <aside className="flex w-full shrink-0 flex-col border-b border-white/20 min-[860px]:h-full min-[860px]:w-[min(320px,28vw)] min-[860px]:border-b-0 min-[860px]:border-r min-[860px]:border-black/20">
          <div className="border-b border-white/10 px-[36px] py-[16px] min-[860px]:border-black/10">
            <label className="block">
              <span className="sr-only">Search artists</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artists"
                className="w-full rounded-[2px] border border-white/25 bg-black px-[12px] py-[8px] text-white placeholder:text-[#999999] focus:outline-none min-[860px]:border-black/20 min-[860px]:bg-white min-[860px]:text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: "24px",
                }}
              />
            </label>
          </div>
          <div className="min-h-0 px-[36px] py-[24px] min-[860px]:flex-1 min-[860px]:overflow-y-auto min-[860px]:scrollbar-hide">
            {groups.length === 0 ? (
              <p
                className="text-white/50 min-[860px]:text-black/50"
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
                          <Link
                            href={`/artists/${artist.slug}`}
                            className="capitalize text-white underline hover:no-underline min-[860px]:text-black"
                            style={nameStyle}
                          >
                            {artist.name}
                          </Link>
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
          <div className="grid shrink-0 grid-cols-1 gap-[36px] border-b border-white/20 px-[24px] py-[16px] min-[860px]:grid-cols-2 min-[860px]:border-black/20">
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

          <div className="flex min-h-0 flex-1 flex-col px-[24px] py-[36px] min-[860px]:overflow-y-auto min-[860px]:scrollbar-hide">
            <p
              className="max-w-[36ch] text-white/70 min-[860px]:text-black/60"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Select an artist from the list to view their page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
