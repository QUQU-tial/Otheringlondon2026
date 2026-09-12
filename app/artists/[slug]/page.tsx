"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getActivities } from "../../lib/storage";
import {
  findArtistBySlug,
  limitArtistWorks,
  type Artist,
  type ArtistLinkedItem,
  type ArtistWork,
} from "../../lib/artists";
import { loadAllSubmittedArtists } from "../../lib/artist-submissions";
import { SITE_LOGO_HEIGHT } from "../../lib/activity-areas";

const navStyle = {
  fontFamily: "var(--font-source-sans-3)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 500,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
} as const;

const titleStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(40px, 4.17vw, 60px)",
  fontWeight: 500,
  lineHeight: "clamp(40px, 4.17vw, 60px)",
  letterSpacing: "-4.8px",
} as const;

const sectionTitleStyle = {
  fontFamily: "var(--font-source-sans-3)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 500,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
} as const;

const yearStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "10px",
  fontWeight: 500,
  lineHeight: "16px",
  letterSpacing: "0.08em",
} as const;

const itemTitleStyle = {
  fontFamily: "var(--font-poppins)",
  fontSize: "clamp(12px, 0.97vw, 14px)",
  fontWeight: 500,
  lineHeight: "normal",
} as const;

const itemDetailStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "16px",
} as const;

const bodyStyle = {
  fontFamily: "var(--font-poppins)",
  fontSize: "clamp(12px, 0.97vw, 14px)",
  fontWeight: 500,
  lineHeight: "normal",
} as const;

const authorStyle = {
  fontFamily: "var(--font-poppins)",
  fontSize: "clamp(12px, 0.97vw, 14px)",
  fontWeight: 500,
  lineHeight: "normal",
} as const;

function LinkedItemList({ items }: { items: ArtistLinkedItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-[12px]">
      {items.map((item, index) => {
        const heading = item.href ? (
          <a
            href={item.href}
            target={item.href.startsWith("/") ? undefined : "_blank"}
            rel={item.href.startsWith("/") ? undefined : "noopener noreferrer"}
            className="text-black underline hover:no-underline"
            style={itemTitleStyle}
          >
            {item.title}
          </a>
        ) : (
          <span className="text-black" style={itemTitleStyle}>
            {item.title}
          </span>
        );

        return (
          <li key={`${item.title}-${index}`} className="flex flex-col gap-[4px]">
            {item.year ? (
              <span className="uppercase text-[#9A9A9A]" style={yearStyle}>
                {item.year}
              </span>
            ) : null}
            {heading}
            {item.detail ? (
              <span className="text-[#9A9A9A]" style={itemDetailStyle}>
                {item.detail}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ArtistSection({
  label,
  items,
}: {
  label: string;
  items: ArtistLinkedItem[];
}) {
  return (
    <section className="reveal-content flex flex-col gap-[16px]">
      <h2 className="text-black" style={sectionTitleStyle}>
        {label}
      </h2>
      <LinkedItemList items={items} />
    </section>
  );
}

function WorksGallery({ works }: { works: ArtistWork[] }) {
  const slides = limitArtistWorks(works);

  return (
    <section className="reveal-content flex flex-col gap-[16px]">
      <h2 className="text-black" style={sectionTitleStyle}>
        Works
      </h2>
      {slides.length > 0 ? (
        <div className="flex gap-[12px] overflow-x-auto scrollbar-hide">
          {slides.map((work, index) => (
            <div key={`${work.src}-${index}`} className="w-[80%] shrink-0">
              <img
                src={work.src}
                alt={work.alt || "Work"}
                className="aspect-[538/319] w-full object-cover transition-[opacity,filter] duration-[400ms] ease-out hover:opacity-[0.85] hover:brightness-[0.98] hover:grayscale-[0.1] motion-reduce:transition-none"
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ArtistDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [artist, setArtist] = useState<Artist | null | undefined>(undefined);
  const [imageError, setImageError] = useState(false);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getActivities(), loadAllSubmittedArtists()]).then(([activities, submitted]) => {
      if (cancelled) return;
      setArtist(findArtistBySlug(slug, activities, submitted));
      setImageError(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!artist) return;
    let observer: IntersectionObserver;
    const timeoutId = window.setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("revealed");
          });
        },
        { root: null, rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
      );
      const all = document.querySelectorAll(".reveal-content, .reveal-image");
      all.forEach((el) => {
        el.classList.remove("revealed");
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("revealed");
        }
      });
    }, 50);
    return () => {
      window.clearTimeout(timeoutId);
      if (observer) {
        document.querySelectorAll(".reveal-content, .reveal-image").forEach((el) => observer.unobserve(el));
      }
    };
  }, [artist]);

  const hasValidPhoto =
    !imageError &&
    !!artist?.photo &&
    (artist.photo.startsWith("http") || artist.photo.startsWith("data:image"));

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="workspace-container flex h-full flex-col overflow-y-auto min-[860px]:flex-row min-[860px]:overflow-hidden">
        <div className="relative flex h-auto min-h-0 w-full shrink-0 flex-col bg-white min-[860px]:h-full min-[860px]:min-w-0 min-[860px]:flex-1 min-[860px]:border-r min-[860px]:border-black/20">
          <header
            className="panel-column-header sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/15 bg-black px-[36px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Link
              href="/"
              className="inline-flex items-center transition-opacity hover:opacity-80"
              aria-label="Home"
            >
              <img
                src="/othering-logo.png"
                alt="Festival logo"
                className="block w-auto"
                style={{ height: SITE_LOGO_HEIGHT }}
              />
            </Link>
          </header>
          <div ref={leftScrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-[36px] pb-[60px]">
            {artist === undefined ? (
              <p className="py-[36px] text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
                Loading
              </p>
            ) : artist === null ? (
              <p className="py-[36px] text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
                Artist not found
              </p>
            ) : (
              <div className="flex flex-col gap-[24px] pt-[12px]">
                <div className="reveal-content flex flex-col gap-[16px]">
                  <h1 className="capitalize text-black" style={titleStyle}>
                    {artist.name.toLowerCase()}
                  </h1>
                  {artist.birth ? (
                    <p className="capitalize text-black" style={authorStyle}>
                      {artist.birth}
                    </p>
                  ) : null}
                  {hasValidPhoto ? (
                    <div className="reveal-image w-full">
                      <img
                        src={artist.photo!}
                        alt={artist.photoAlt || artist.name}
                        className="h-[388px] w-full object-cover transition-[opacity,filter] duration-[400ms] ease-out hover:opacity-[0.85] hover:brightness-[0.98] hover:grayscale-[0.1] motion-reduce:transition-none"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : null}
                  {artist.bio ? (
                    <div className="text-black" style={bodyStyle}>
                      {artist.bio}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex h-auto min-h-0 w-full shrink-0 flex-col bg-white min-[860px]:h-full min-[860px]:min-w-0 min-[860px]:flex-1">
          <header
            className="panel-column-header sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/15 bg-black px-[36px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Link
              href="/artists"
              className="capitalize text-white transition-opacity hover:opacity-70"
              style={navStyle}
            >
              Artists
            </Link>
            <Link
              href="/artists/join"
              className="inline-flex shrink-0 items-center justify-center bg-transparent px-[24px] py-[4px] font-medium uppercase text-white transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(16px, 1.39vw, 20px)",
                lineHeight: "clamp(24px, 2.08vw, 30px)",
              }}
            >
              Join
            </Link>
          </header>
          <div ref={rightScrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-[36px] pb-[60px]">
            {artist ? (
              <div className="flex flex-col gap-[36px] pt-[12px]">
                <ArtistSection label="CV" items={artist.cv} />
                <ArtistSection label="Exhibitions" items={artist.exhibitions} />
                <ArtistSection label="Press" items={artist.press} />
                <ArtistSection label="Talks" items={artist.talks} />
                <WorksGallery works={artist.works ?? []} />
              </div>
            ) : artist === null ? (
              <div className="flex h-full items-center justify-center">
                <Link
                  href="/artists"
                  className="text-black capitalize underline hover:no-underline"
                  style={navStyle}
                >
                  Back to artists
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
