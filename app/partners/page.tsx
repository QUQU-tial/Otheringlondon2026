"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getActivities, type Activity } from "../lib/storage";
import {
  parseActivityDate,
  downloadICS,
  type CalendarEvent,
  formatDisplayDateFromDate,
} from "../lib/calendar";
import {
  ACTIVITY_AREAS,
  activityMatchesArea,
  formatActivityCompactDate,
  SITE_LOGO_HEIGHT,
} from "../lib/activity-areas";
import { getCurrentUser } from "../lib/auth";

const AREA_FILTERS = ["All Areas", ...ACTIVITY_AREAS] as const;

interface MapMarker {
  id: string;
  activity: Activity;
  x: number;
  y: number;
}

const areaBtnClass = (active: boolean) =>
  `text-left text-[10px] tracking-[0.08em] uppercase transition-colors ${
    active ? "text-red-600" : "text-[#9A9A9A] hover:text-red-600"
  }`;

export default function PartnersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [areaFilter, setAreaFilter] = useState<string>("All Areas");
  const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);

  useEffect(() => {
    const areaParam = searchParams.get("area");
    if (areaParam && (AREA_FILTERS as readonly string[]).includes(areaParam)) {
      setAreaFilter(areaParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadActivities = async () => {
      const loadedActivities = await getActivities();
      setActivities(loadedActivities);

      const generatedMarkers: MapMarker[] = loadedActivities.map((activity, index) => {
        const cols = Math.ceil(Math.sqrt(loadedActivities.length)) || 1;
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = 20 + col * (60 / cols) + Math.random() * 5;
        const y = 20 + row * (60 / cols) + Math.random() * 5;

        return {
          id: activity.id,
          activity,
          x: Math.min(90, Math.max(10, x)),
          y: Math.min(90, Math.max(10, y)),
        };
      });

      setMarkers(generatedMarkers);

      const activityId = searchParams.get("activityId");
      if (activityId && loadedActivities.length > 0) {
        const activity = loadedActivities.find((a) => a.id === activityId);
        if (activity) {
          setSelectedActivity(activity);
          setFocusedMarkerId(activity.id);
          const dates = parseActivityDate(activity.activity_date);
          setAvailableDates(dates);
          setSelectedDateIndex(0);
          if (activity.activity_area) {
            setAreaFilter(activity.activity_area);
          }
        }
      }
    };

    loadActivities();
  }, [searchParams]);

  const filteredActivities = useMemo(
    () => activities.filter((a) => activityMatchesArea(a, areaFilter)),
    [activities, areaFilter]
  );

  const handleMarkerClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setFocusedMarkerId(activity.id);
    const dates = parseActivityDate(activity.activity_date);
    setAvailableDates(dates);
    setSelectedDateIndex(0);
  };

  const handleListItemClick = (activity: Activity) => {
    handleMarkerClick(activity);
    setFocusedMarkerId(activity.id);
  };

  const handleAreaFilter = (area: string) => {
    setAreaFilter(area);
    setSelectedActivity(null);
    setFocusedMarkerId(null);
  };

  const handleAddToCalendar = () => {
    if (!selectedActivity || availableDates.length === 0) return;

    const selectedDate = availableDates[selectedDateIndex];
    const endDate = new Date(selectedDate);
    endDate.setHours(endDate.getHours() + 2);

    const event: CalendarEvent = {
      title: selectedActivity.activity_title,
      description: `${selectedActivity.activity_title}\n\n${selectedActivity.activity_description || ""}\n\nOT FESTIVAL`,
      location: selectedActivity.activity_location || "Location TBA",
      startDate: selectedDate,
      endDate: endDate,
      allDay: false,
    };

    const filename = `${selectedActivity.activity_title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
    downloadICS(event, filename);
  };

  const handleViewEvent = async () => {
    if (!selectedActivity) return;
    router.push(`/?activityId=${selectedActivity.id}`);
  };

  const handleImageError = (activityId: string) => {
    setImageErrors((prev) => new Set(prev).add(activityId));
  };

  const hasValidImage = (activity: Activity): boolean => {
    if (imageErrors.has(activity.id)) return false;
    return !!(
      activity.primary_image &&
      (activity.primary_image.startsWith("http") || activity.primary_image.startsWith("data:image"))
    );
  };

  const formatDate = (date: Date): string => formatDisplayDateFromDate(date);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className="panel-column-header sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-[36px]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          <img
            src="/othering-logo-on-white.png"
            alt="Festival logo"
            className="block w-auto"
            style={{ height: SITE_LOGO_HEIGHT }}
          />
        </Link>
        <nav className="flex items-center gap-[24px]">
          <span
            className="text-black capitalize"
            style={{
              fontFamily: "var(--font-source-sans-3)",
              fontSize: "clamp(16px, 1.39vw, 20px)",
              fontWeight: 500,
              lineHeight: "clamp(24px, 2.08vw, 30px)",
            }}
          >
            View all programmes
          </span>
          <Link
            href="/"
            className="text-black capitalize transition-opacity hover:opacity-70"
            style={{
              fontFamily: "var(--font-source-sans-3)",
              fontSize: "clamp(16px, 1.39vw, 20px)",
              fontWeight: 500,
              lineHeight: "clamp(24px, 2.08vw, 30px)",
            }}
          >
            Back to workspace
          </Link>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1 flex-col min-[860px]:flex-row overflow-hidden">
        {/* Left column — area filters + activity list */}
        <aside className="flex w-full shrink-0 flex-col border-b border-black/10 min-[860px]:w-[min(320px,28vw)] min-[860px]:border-b-0 min-[860px]:border-r">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-[36px] py-4" style={{ fontFamily: "var(--font-inter)" }}>
            {AREA_FILTERS.map((area, i) => (
              <span key={area} className="inline-flex items-center gap-2">
                {i > 0 ? <span className="text-[#9A9A9A]/40">|</span> : null}
                <button
                  type="button"
                  onClick={() => handleAreaFilter(area)}
                  className={areaBtnClass(areaFilter === area)}
                >
                  {area}
                </button>
              </span>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-[36px] pb-6">
            {filteredActivities.length === 0 ? (
              <p
                className="text-[10px] tracking-[0.08em] text-[#9A9A9A]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                No activities in this area.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredActivities.map((activity) => (
                  <li key={activity.id}>
                    <button
                      type="button"
                      onClick={() => handleListItemClick(activity)}
                      className={`w-full text-left transition-colors ${
                        focusedMarkerId === activity.id ? "text-red-600" : "text-black hover:text-red-600"
                      }`}
                    >
                      <p
                        className="font-medium capitalize"
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: "clamp(14px, 1.2vw, 16px)",
                          lineHeight: 1.3,
                        }}
                      >
                        {activity.activity_title.toLowerCase()}
                      </p>
                      <p
                        className="mt-1 text-[10px] tracking-[0.08em] text-[#9A9A9A]"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {formatActivityCompactDate(activity.activity_date) ||
                          activity.activity_date ||
                          "Date TBA"}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="relative min-h-[280px] flex-1 bg-gray-100">
          <div className="absolute inset-0">
            <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {markers
                .filter((m) => activityMatchesArea(m.activity, areaFilter))
                .map((marker) => {
                  const hasImage = hasValidImage(marker.activity);
                  const isFocused = focusedMarkerId === marker.id;
                  return (
                    <button
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker.activity)}
                      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                        hasImage
                          ? "h-[48px] w-[48px] overflow-hidden rounded-full border-2 border-white shadow-lg"
                          : "h-[24px] w-[24px] rounded-full border-2 border-white bg-black"
                      } ${isFocused ? "ring-4 ring-red-500 ring-offset-2 scale-125" : ""}`}
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                      }}
                      aria-label={`Activity: ${marker.activity.activity_title}`}
                    >
                      {hasImage ? (
                        <img
                          src={marker.activity.primary_image!}
                          alt={marker.activity.activity_title}
                          className="h-full w-full object-cover"
                          onError={() => handleImageError(marker.activity.id)}
                        />
                      ) : (
                        <span className="sr-only">{marker.activity.activity_title}</span>
                      )}
                    </button>
                  );
                })}

              {markers.filter((m) => activityMatchesArea(m.activity, areaFilter)).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p
                    className="px-[36px] text-center text-black/50"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    No activities in this area. Select another region or add programmes with an activity area.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedActivity ? (
          <div className="flex w-full shrink-0 flex-col overflow-hidden border-t border-black/10 bg-white min-[860px]:w-[400px] min-[860px]:border-l min-[860px]:border-t-0">
            <div className="flex-1 overflow-y-auto scrollbar-hide px-[36px] py-[36px]">
              <h2
                className="mb-[16px] font-medium capitalize text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(24px, 2.5vw, 36px)",
                  lineHeight: "clamp(28px, 2.92vw, 42px)",
                  letterSpacing: "-1.44px",
                }}
              >
                {selectedActivity.activity_title.toLowerCase()}
              </h2>

              {selectedActivity.activity_location && (
                <div className="mb-[24px]">
                  <p
                    className="mb-[4px] font-medium uppercase text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "12px",
                      lineHeight: "16px",
                    }}
                  >
                    Location:
                  </p>
                  <p
                    className="text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {selectedActivity.activity_location}
                  </p>
                </div>
              )}

              {selectedActivity.activity_area && (
                <div className="mb-[24px]">
                  <p
                    className="mb-[4px] font-medium uppercase text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "12px",
                      lineHeight: "16px",
                    }}
                  >
                    Area:
                  </p>
                  <p
                    className="text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {selectedActivity.activity_area}
                  </p>
                </div>
              )}

              {availableDates.length > 0 && (
                <div className="mb-[24px]">
                  <p
                    className="mb-[8px] font-medium uppercase text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "12px",
                      lineHeight: "16px",
                    }}
                  >
                    Date{availableDates.length > 1 ? "s" : ""}:
                  </p>

                  {availableDates.length > 1 ? (
                    <select
                      value={selectedDateIndex}
                      onChange={(e) => setSelectedDateIndex(parseInt(e.target.value, 10))}
                      className="w-full rounded-[2px] border border-black/20 bg-white px-[12px] py-[8px] text-black focus:outline-none"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "16px",
                        lineHeight: "24px",
                      }}
                    >
                      {availableDates.map((date, index) => (
                        <option key={index} value={index}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p
                      className="text-black"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "16px",
                        lineHeight: "24px",
                      }}
                    >
                      {formatDate(availableDates[0])}
                    </p>
                  )}
                </div>
              )}

              {availableDates.length > 0 && (
                <button
                  onClick={handleAddToCalendar}
                  className="mb-[16px] inline-flex shrink-0 items-center justify-center bg-black px-[24px] py-[4px] font-medium uppercase text-white transition-all duration-200 hover:bg-black/90"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "clamp(16px, 1.39vw, 20px)",
                    lineHeight: "clamp(24px, 2.08vw, 30px)",
                  }}
                >
                  Add to calendar
                </button>
              )}

              <button
                onClick={handleViewEvent}
                className="inline-flex shrink-0 items-center justify-center bg-black px-[24px] py-[4px] font-medium uppercase text-white transition-all duration-200 hover:bg-black/90"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(16px, 1.39vw, 20px)",
                  lineHeight: "clamp(24px, 2.08vw, 30px)",
                }}
              >
                VIEW EVENT
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden w-[400px] shrink-0 items-center justify-center border-l border-black/10 px-[36px] py-[36px] min-[860px]:flex">
            <p
              className="text-center text-black/50"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Click on a map marker or list item to view activity details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
