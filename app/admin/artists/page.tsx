"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "../../components/AdminShell";
import { formatDisplayDateFromDate } from "../../lib/calendar";
import {
  deleteArtistAdmin,
  loadAdminArtistRecords,
  loadArtistRegistrations,
  updateArtistStatusAdmin,
  type AdminArtistRecord,
  type ArtistRegistrationRecord,
} from "../../lib/artist-submissions";

type Tab = "all" | "pending" | "draft" | "published" | "rejected" | "site" | "accounts";

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : formatDisplayDateFromDate(d);
  } catch {
    return raw;
  }
}

function contentSummary(artist: AdminArtistRecord): string {
  const parts = [
    artist.field || null,
    artist.bio ? `${artist.bio.trim().slice(0, 80)}${artist.bio.trim().length > 80 ? "…" : ""}` : null,
    `${artist.works?.length || 0} works`,
    `${artist.exhibitions?.length || 0} exhibitions`,
  ].filter(Boolean);
  return parts.join(" · ");
}

function statusLabel(artist: AdminArtistRecord): string {
  if (artist.source === "editorial") return "live (site)";
  return artist.status;
}

export default function AdminArtistsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [artists, setArtists] = useState<AdminArtistRecord[]>([]);
  const [registrations, setRegistrations] = useState<ArtistRegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actingSlug, setActingSlug] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [artistRows, regRows] = await Promise.all([
        Promise.race([
          loadAdminArtistRecords(),
          new Promise<AdminArtistRecord[]>((resolve) => setTimeout(() => resolve([]), 8000)),
        ]),
        Promise.race([
          loadArtistRegistrations(),
          new Promise<ArtistRegistrationRecord[]>((resolve) => setTimeout(() => resolve([]), 8000)),
        ]),
      ]);
      setArtists(artistRows);
      setRegistrations(regRows);
    } catch (error) {
      console.error("[admin/artists] load failed", error);
      setArtists([]);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const userArtists = useMemo(
    () => artists.filter((artist) => artist.source !== "editorial"),
    [artists]
  );

  const counts = useMemo(
    () => ({
      all: userArtists.length,
      pending: userArtists.filter((a) => a.status === "pending_review").length,
      draft: userArtists.filter((a) => a.status === "draft").length,
      published: userArtists.filter((a) => a.status === "published").length,
      rejected: userArtists.filter((a) => a.status === "rejected").length,
      site: artists.filter((a) => a.source === "editorial").length,
      accounts: registrations.length,
    }),
    [artists, userArtists, registrations.length]
  );

  const filteredArtists = useMemo(() => {
    let rows: AdminArtistRecord[];
    switch (tab) {
      case "pending":
        rows = userArtists.filter((a) => a.status === "pending_review");
        break;
      case "draft":
        rows = userArtists.filter((a) => a.status === "draft");
        break;
      case "published":
        rows = userArtists.filter((a) => a.status === "published");
        break;
      case "rejected":
        rows = userArtists.filter((a) => a.status === "rejected");
        break;
      case "site":
        rows = artists.filter((a) => a.source === "editorial");
        break;
      case "all":
        rows = userArtists;
        break;
      default:
        rows = [];
    }
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (artist) =>
        artist.name.toLowerCase().includes(q) ||
        artist.ownerEmail.toLowerCase().includes(q) ||
        artist.slug.toLowerCase().includes(q) ||
        (artist.field || "").toLowerCase().includes(q)
    );
  }, [artists, userArtists, tab, query]);

  const filteredRegs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(
      (row) =>
        row.ownerEmail.toLowerCase().includes(q) || row.ownerId.toLowerCase().includes(q)
    );
  }, [registrations, query]);

  const handlePublish = async (artist: AdminArtistRecord) => {
    if (artist.source === "editorial") return;
    setActingSlug(artist.slug);
    setActionError(null);
    const result = await updateArtistStatusAdmin(artist.slug, "published");
    setActingSlug(null);
    if (!result.ok) {
      setActionError(result.error || "Publish failed");
      return;
    }
    await load();
  };

  const handleDelete = async (artist: AdminArtistRecord) => {
    if (artist.source === "editorial") return;
    if (!window.confirm(`Delete artist profile “${artist.name}”? This cannot be undone.`)) return;
    setActingSlug(artist.slug);
    setActionError(null);
    const result = await deleteArtistAdmin(artist.slug, artist.ownerId);
    setActingSlug(null);
    if (!result.ok) {
      setActionError(result.error || "Delete failed. Re-run the latest artists SQL (admin DELETE policy).");
      return;
    }
    await load();
  };

  return (
    <AdminShell title="Artist submissions">
      <div className="mb-[20px] flex flex-wrap items-center gap-[12px]">
        {(
          [
            ["pending", `Pending (${counts.pending})`],
            ["draft", `Drafts (${counts.draft})`],
            ["published", `Published (${counts.published})`],
            ["rejected", `Rejected (${counts.rejected})`],
            ["all", `All submissions (${counts.all})`],
            ["site", `Site roster (${counts.site})`],
            ["accounts", `Accounts (${counts.accounts})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`border px-[16px] py-[8px] transition-colors ${
              tab === key
                ? "border-black bg-black text-white"
                : "border-black/20 bg-white text-black hover:bg-black/5"
            }`}
            style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void load()}
          className="border border-black/20 px-[16px] py-[8px] text-black hover:bg-black/5"
          style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}
        >
          Refresh
        </button>
      </div>

      {actionError ? (
        <p className="mb-[16px] text-[14px] text-red-700" style={{ fontFamily: "var(--font-inter)" }}>
          {actionError}
        </p>
      ) : null}

      <label className="mb-[24px] block max-w-[360px]">
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, slug…"
          className="w-full border border-black/20 px-[12px] py-[8px] text-black placeholder:text-black/35 focus:border-black focus:outline-none"
          style={{ fontFamily: "var(--font-inter)", fontSize: "15px" }}
        />
      </label>

      {tab === "accounts" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                {["Account email", "User id", "First seen", "Last seen"].map((label) => (
                  <th
                    key={label}
                    className="py-[12px] pr-[16px] text-left font-medium uppercase text-black"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
                    Loading…
                  </td>
                </tr>
              ) : filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
                    No artist account visits logged yet.
                  </td>
                </tr>
              ) : (
                filteredRegs.map((row) => (
                  <tr key={row.ownerId} className="border-b border-black/20">
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px" }}>
                      {row.ownerEmail || "—"}
                    </td>
                    <td className="py-[12px] pr-[16px] text-[12px] text-black/60" style={{ fontFamily: "var(--font-inter)" }}>
                      {row.ownerId}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px" }}>
                      {formatDate(row.firstSeenAt)}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px" }}>
                      {formatDate(row.lastSeenAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                {["Artist", "Account", "Updated", "Content", "Actions"].map((label) => (
                  <th
                    key={label}
                    className="py-[12px] pr-[16px] text-left font-medium uppercase text-black"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
                    Loading…
                  </td>
                </tr>
              ) : filteredArtists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)" }}>
                    {tab === "draft" || tab === "pending"
                      ? "No rows yet. Ask the artist to Save Draft or Submit for review while signed in (after you run the updated SQL)."
                      : "No items in this filter"}
                  </td>
                </tr>
              ) : (
                filteredArtists.map((artist) => (
                  <tr key={artist.slug} className="border-b border-black/20 align-top">
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "15px" }}>
                      <div className="font-medium">{artist.name}</div>
                      <div className="text-[12px] text-black/50">{artist.slug}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-wide text-black/45">
                        {statusLabel(artist)}
                      </div>
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px" }}>
                      <div>
                        {artist.source === "editorial" ? "Editorial roster" : artist.ownerEmail || "—"}
                      </div>
                      <div className="text-[11px] text-black/45">
                        {artist.source === "editorial" ? "—" : artist.ownerId || "—"}
                      </div>
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px" }}>
                      <div>{formatDate(artist.updatedAt)}</div>
                      <div className="text-[11px] text-black/45">Created {formatDate(artist.createdAt)}</div>
                    </td>
                    <td
                      className="max-w-[280px] py-[12px] pr-[16px] text-black/80"
                      style={{ fontFamily: "var(--font-inter)", fontSize: "13px", lineHeight: "18px" }}
                    >
                      {contentSummary(artist)}
                    </td>
                    <td className="py-[12px] pr-[16px]">
                      <div className="flex flex-wrap gap-[8px]">
                        <Link
                          href={`/admin/artists/${artist.slug}`}
                          className="border border-black bg-black px-[12px] py-[6px] text-white"
                          style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
                        >
                          Review
                        </Link>
                        <a
                          href={`/artists/${artist.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-black/40 px-[12px] py-[6px] text-black hover:bg-black/5"
                          style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
                        >
                          Public page
                        </a>
                        {artist.source !== "editorial" && artist.status !== "published" ? (
                          <button
                            type="button"
                            disabled={actingSlug === artist.slug}
                            onClick={() => void handlePublish(artist)}
                            className="border border-black px-[12px] py-[6px] text-black hover:bg-black/5 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
                          >
                            Publish
                          </button>
                        ) : null}
                        {artist.source !== "editorial" ? (
                          <button
                            type="button"
                            disabled={actingSlug === artist.slug}
                            onClick={() => void handleDelete(artist)}
                            className="border border-red-700/50 px-[12px] py-[6px] text-red-800 hover:bg-red-50 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
