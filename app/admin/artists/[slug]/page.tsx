"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "../../../components/AdminShell";
import { formatDisplayDateFromDate } from "../../../lib/calendar";
import {
  loadAdminArtistBySlug,
  type AdminArtistRecord,
} from "../../../lib/artist-submissions";
import type { ArtistLinkedItem } from "../../../lib/artists";

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : formatDisplayDateFromDate(d);
  } catch {
    return raw;
  }
}

function LinkedList({ title, items }: { title: string; items: ArtistLinkedItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mb-[28px]">
      <h2
        className="mb-[12px] font-medium uppercase tracking-[0.06em] text-black"
        style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-[10px]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="border-b border-black/10 pb-[10px] text-[14px] text-black" style={{ fontFamily: "var(--font-inter)" }}>
            <div className="font-medium">{item.title}</div>
            <div className="text-black/60">
              {[item.year, item.detail].filter(Boolean).join(" · ")}
            </div>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[12px] underline">
                {item.href}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminArtistDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [artist, setArtist] = useState<AdminArtistRecord | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadAdminArtistBySlug(slug).then((row) => {
      if (!cancelled) setArtist(row);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <AdminShell title="Artist review">
      <div className="mb-[24px]">
        <Link href="/admin/artists" className="text-[14px] underline" style={{ fontFamily: "var(--font-inter)" }}>
          ← All artists
        </Link>
      </div>

      {artist === undefined ? (
        <p style={{ fontFamily: "var(--font-inter)" }}>Loading…</p>
      ) : artist === null ? (
        <p style={{ fontFamily: "var(--font-inter)" }}>Artist submission not found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-[36px] min-[860px]:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2
              className="mb-[8px] font-medium text-black"
              style={{ fontFamily: "var(--font-inter)", fontSize: "28px", letterSpacing: "-0.5px" }}
            >
              {artist.name}
            </h2>
            <p className="mb-[20px] text-[14px] text-black/55" style={{ fontFamily: "var(--font-inter)" }}>
              /artists/{artist.slug} · {artist.status}
            </p>

            {artist.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artist.photo} alt={artist.photoAlt || artist.name} className="mb-[24px] max-h-[360px] w-full object-cover" />
            ) : null}

            <section className="mb-[28px]">
              <h3 className="mb-[8px] text-[12px] font-medium uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-inter)" }}>
                Bio
              </h3>
              <p className="whitespace-pre-wrap text-[15px] leading-[22px] text-black/85" style={{ fontFamily: "var(--font-inter)" }}>
                {artist.bio || "—"}
              </p>
            </section>

            <LinkedList title="CV" items={artist.cv || []} />
            <LinkedList title="Exhibitions" items={artist.exhibitions || []} />
            <LinkedList title="Press" items={artist.press || []} />
            <LinkedList title="Talks" items={artist.talks || []} />

            {(artist.works?.length || 0) > 0 ? (
              <section>
                <h3 className="mb-[12px] text-[12px] font-medium uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-inter)" }}>
                  Works
                </h3>
                <div className="flex flex-wrap gap-[12px]">
                  {artist.works?.map((work, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${work.src}-${index}`}
                      src={work.src}
                      alt={work.alt || "Work"}
                      className="h-[120px] w-[120px] object-cover"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="border border-black/15 p-[20px]">
            <h3 className="mb-[16px] text-[12px] font-medium uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-inter)" }}>
              Account & timing
            </h3>
            <dl className="flex flex-col gap-[14px] text-[14px]" style={{ fontFamily: "var(--font-inter)" }}>
              <div>
                <dt className="text-black/45">Email</dt>
                <dd className="text-black">{artist.ownerEmail || "—"}</dd>
              </div>
              <div>
                <dt className="text-black/45">User id</dt>
                <dd className="break-all text-[12px] text-black/70">{artist.ownerId || "—"}</dd>
              </div>
              <div>
                <dt className="text-black/45">Field</dt>
                <dd className="text-black">{artist.field || "—"}</dd>
              </div>
              <div>
                <dt className="text-black/45">Birth</dt>
                <dd className="text-black">{artist.birth || "—"}</dd>
              </div>
              <div>
                <dt className="text-black/45">Created</dt>
                <dd className="text-black">{formatDate(artist.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-black/45">Last published / updated</dt>
                <dd className="text-black">{formatDate(artist.updatedAt)}</dd>
              </div>
            </dl>
            <a
              href={`/artists/${artist.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[24px] inline-flex border border-black bg-black px-[16px] py-[8px] text-[12px] text-white"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Open public page
            </a>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
