"use client";

import { useState, useEffect, useCallback } from "react";
import { getSubmissions, updateActivityStatus, type Submission } from "../lib/storage";
import { formatDisplayDateFromDate } from "../lib/calendar";

type StatusFilter = "all" | "pending" | "published" | "rejected" | "removed";

function formatDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? createdAt : formatDisplayDateFromDate(d);
  } catch {
    return createdAt;
  }
}

export default function AdminPage() {
  const [activities, setActivities] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const isDev = typeof window !== "undefined" && process.env.NODE_ENV === "development";

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const raw = await getSubmissions({
      includeDrafts: true,
      includeRemoved: true,
    });
    setActivities(raw);
    if (isDev) {
      const pendingCount = raw.filter((r) => r.status === "pending_review").length;
      const statuses = [...new Set(raw.map((r) => r.status))];
      console.log("[admin] raw rows from Supabase:", raw.length);
      console.log("[admin] pending_review count:", pendingCount);
      console.log("[admin] distinct statuses:", statuses);
    }
    setLoading(false);
  }, [isDev]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filtered =
    statusFilter === "all"
      ? activities
      : statusFilter === "pending"
        ? activities.filter((a) => a.status === "pending_review")
        : statusFilter === "published"
          ? activities.filter((a) => a.status === "published")
          : statusFilter === "rejected"
            ? activities.filter((a) => a.status === "rejected")
            : activities.filter((a) => a.is_deleted === true);

  const handlePublish = async (item: Submission) => {
    setActingId(item.id);
    try {
      await updateActivityStatus(item.id, "published");
      await loadActivities();
    } catch (e) {
      console.error("Publish failed:", e);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (item: Submission) => {
    setActingId(item.id);
    try {
      await updateActivityStatus(item.id, "rejected");
      await loadActivities();
    } catch (e) {
      console.error("Reject failed:", e);
    } finally {
      setActingId(null);
    }
  };

  const handleRemove = async (item: Submission) => {
    setActingId(item.id);
    try {
      await updateActivityStatus(item.id, item.status, { is_deleted: true });
      await loadActivities();
    } catch (e) {
      console.error("Remove failed:", e);
    } finally {
      setActingId(null);
    }
  };

  const handleRestore = async (item: Submission) => {
    setActingId(item.id);
    try {
      await updateActivityStatus(item.id, item.status, { is_deleted: false });
      await loadActivities();
    } catch (e) {
      console.error("Restore failed:", e);
    } finally {
      setActingId(null);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[900px] mx-auto px-[36px] py-[36px]">
        <h1
          className="font-medium text-black capitalize mb-[36px]"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(40px, 4.17vw, 60px)",
            lineHeight: "clamp(40px, 4.17vw, 60px)",
            letterSpacing: "-4.8px",
          }}
        >
          Admin Review
        </h1>

        <div className="flex flex-wrap gap-[12px] mb-[24px]">
          {(
            [
              ["all", "All"],
              ["pending", "Pending Review"],
              ["published", "Published"],
              ["rejected", "Rejected"],
              ["removed", "Removed"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-[16px] py-[8px] border transition-colors ${
                statusFilter === key
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/20 hover:bg-black/5"
              }`}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Activity Title
                </th>
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Author
                </th>
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Status
                </th>
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Created
                </th>
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Location
                </th>
                <th
                  className="text-left py-[12px] pr-[16px] font-medium text-black uppercase"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-[24px] text-center text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}>
                    No items in this filter
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-black/20">
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: "24px" }}>
                      {item.activity_title || "—"}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: "24px" }}>
                      {item.author_name || "—"}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black uppercase" style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}>
                      {item.status}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-[12px] pr-[16px] text-black" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "20px" }}>
                      {item.activity_location || "—"}
                    </td>
                    <td className="py-[12px] pr-[16px]">
                      <div className="flex flex-wrap gap-[8px]">
                        <a
                          href={`/event/${item.id}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-[12px] py-[6px] border border-black/40 text-black/80 hover:bg-black/5"
                          style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                        >
                          Preview
                        </a>
                        {item.status !== "published" && (
                          <button
                            type="button"
                            disabled={!!actingId}
                            onClick={() => handlePublish(item)}
                            className="px-[12px] py-[6px] bg-black text-white hover:opacity-90 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                          >
                            Publish
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            type="button"
                            disabled={!!actingId}
                            onClick={() => handleReject(item)}
                            className="px-[12px] py-[6px] border border-black text-black hover:bg-black/5 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                          >
                            Reject
                          </button>
                        )}
                        {!item.is_deleted ? (
                          <button
                            type="button"
                            disabled={!!actingId}
                            onClick={() => handleRemove(item)}
                            className="px-[12px] py-[6px] border border-black/40 text-black/70 hover:bg-black/5 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!!actingId}
                            onClick={() => handleRestore(item)}
                            className="px-[12px] py-[6px] border border-black/40 text-black/70 hover:bg-black/5 disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "12px", lineHeight: "16px" }}
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
