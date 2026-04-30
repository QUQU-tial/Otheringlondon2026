"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActivities, type Activity } from "../lib/storage";
import { parseActivityDate, downloadICS, type CalendarEvent, formatDisplayDateFromDate } from "../lib/calendar";
import { getCurrentUser } from "../lib/auth";

interface MapMarker {
  id: string;
  activity: Activity;
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
}

export default function PartnersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadActivities = async () => {
      const loadedActivities = await getActivities();
      setActivities(loadedActivities);

    // Generate mock map positions (in a real implementation, these would come from geocoding)
    const generatedMarkers: MapMarker[] = loadedActivities.map((activity, index) => {
      // Distribute markers across the map area
      const cols = Math.ceil(Math.sqrt(loadedActivities.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = 20 + (col * (60 / cols)) + Math.random() * 5;
      const y = 20 + (row * (60 / cols)) + Math.random() * 5;
      
      return {
        id: activity.id,
        activity,
        x: Math.min(90, Math.max(10, x)),
        y: Math.min(90, Math.max(10, y))
      };
    });

    setMarkers(generatedMarkers);

    // If activityId in URL, select that activity on the map
    const activityId = searchParams.get("activityId");
    if (activityId && loadedActivities.length > 0) {
      const activity = loadedActivities.find((a) => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
        const dates = parseActivityDate(activity.activity_date);
        setAvailableDates(dates);
        setSelectedDateIndex(0);
      }
    }
    };

    loadActivities();
  }, [searchParams]);

  const handleMarkerClick = (activity: Activity) => {
    setSelectedActivity(activity);
    const dates = parseActivityDate(activity.activity_date);
    setAvailableDates(dates);
    setSelectedDateIndex(0);
  };

  const handleAddToCalendar = () => {
    if (!selectedActivity || availableDates.length === 0) return;

    const selectedDate = availableDates[selectedDateIndex];
    const endDate = new Date(selectedDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2-hour event

    const event: CalendarEvent = {
      title: selectedActivity.activity_title,
      description: `${selectedActivity.activity_title}\n\n${selectedActivity.activity_description || ''}\n\nOT FESTIVAL`,
      location: selectedActivity.activity_location || 'Location TBA',
      startDate: selectedDate,
      endDate: endDate,
      allDay: false
    };

    const filename = `${selectedActivity.activity_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    downloadICS(event, filename);
  };

  const handleViewEvent = async () => {
    if (!selectedActivity) return;

    // Navigate to workspace with activity ID
    // The workspace page will need to read from URL params to auto-select
    const targetUrl = `/?activityId=${selectedActivity.id}`;
    
    // Check if user is logged in (workspace is public, but we check for consistency)
    const user = await getCurrentUser();
    
    // Workspace is public, so navigate directly
    router.push(targetUrl);
  };

  const handleImageError = (activityId: string) => {
    setImageErrors(prev => new Set(prev).add(activityId));
  };

  const hasValidImage = (activity: Activity): boolean => {
    if (imageErrors.has(activity.id)) return false;
    return !!(
      activity.primary_image &&
      (activity.primary_image.startsWith('http') || activity.primary_image.startsWith('data:image'))
    );
  };

  const formatDate = (date: Date): string => {
    return formatDisplayDateFromDate(date);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header 
        className="flex shrink-0 items-center justify-between bg-white px-[36px] sticky top-0 z-10 border-b border-black/10"
        style={{ 
          fontFamily: "var(--font-inter)",
          paddingTop: 'clamp(16px, 1.67vw, 24px)',
          paddingBottom: 'clamp(8px, 0.83vw, 12px)'
        }}
      >
        <a
          href="/"
          className="inline-flex items-center transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          <img
            src="/othering-logo-on-white.png"
            alt="Festival logo"
            className="block"
            style={{
              height: 'clamp(24px, 2.5vw, 32px)',
              width: 'auto',
            }}
          />
        </a>
        <a 
          href="/"
          className="text-black capitalize transition-all duration-200 hover:opacity-70" 
          style={{ 
            fontFamily: "var(--font-inter)",
            fontSize: 'clamp(16px, 1.39vw, 20px)',
            fontWeight: 500,
            lineHeight: 'clamp(24px, 2.08vw, 30px)'
          }}
        >
          Back to Workspace
        </a>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-[860px]:flex-row overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100 border-r border-black/10">
          <div className="absolute inset-0">
            {/* Placeholder Map Background */}
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
              {/* Simple grid pattern to simulate map */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />
              
              {/* Map Markers */}
              {markers.map((marker) => {
                const hasImage = hasValidImage(marker.activity);
                return (
                  <button
                    key={marker.id}
                    onClick={() => handleMarkerClick(marker.activity)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform z-10 ${
                      hasImage 
                        ? 'w-[48px] h-[48px] rounded-full border-2 border-white overflow-hidden shadow-lg' 
                        : 'w-[24px] h-[24px] rounded-full bg-black border-2 border-white'
                    }`}
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`
                    }}
                    aria-label={`Activity: ${marker.activity.activity_title}`}
                  >
                    {hasImage ? (
                      <img
                        src={marker.activity.primary_image!}
                        alt={marker.activity.activity_title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(marker.activity.id)}
                      />
                    ) : (
                      <span className="sr-only">{marker.activity.activity_title}</span>
                    )}
                  </button>
                );
              })}

              {/* Map Instructions */}
              {markers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p
                    className="text-black/50 text-center px-[36px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                  >
                    No activities available. Activities will appear as markers on the map.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Detail Panel */}
        {selectedActivity && (
          <div className="w-full min-[860px]:w-[400px] bg-white border-l border-black/10 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide px-[36px] py-[36px]">
              {/* Activity Title */}
              <h2
                className="font-medium text-black capitalize mb-[16px]"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(24px, 2.5vw, 36px)',
                  lineHeight: 'clamp(28px, 2.92vw, 42px)',
                  letterSpacing: '-1.44px'
                }}
              >
                {selectedActivity.activity_title.toLowerCase()}
              </h2>

              {/* Address */}
              {selectedActivity.activity_location && (
                <div className="mb-[24px]">
                  <p
                    className="font-medium text-black uppercase mb-[4px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: '12px',
                      lineHeight: '16px'
                    }}
                  >
                    Location:
                  </p>
                  <p
                    className="text-black"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                  >
                    {selectedActivity.activity_location}
                  </p>
                </div>
              )}

              {/* Date Selector */}
              {availableDates.length > 0 && (
                <div className="mb-[24px]">
                  <p
                    className="font-medium text-black uppercase mb-[8px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: '12px',
                      lineHeight: '16px'
                    }}
                  >
                    Date{availableDates.length > 1 ? 's' : ''}:
                  </p>
                  
                  {availableDates.length > 1 ? (
                    <select
                      value={selectedDateIndex}
                      onChange={(e) => setSelectedDateIndex(parseInt(e.target.value, 10))}
                      className="w-full px-[12px] py-[8px] border border-black/20 bg-white text-black focus:outline-none rounded-[2px]"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: '16px',
                        lineHeight: '24px'
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
                        fontSize: '16px',
                        lineHeight: '24px'
                      }}
                    >
                      {formatDate(availableDates[0])}
                    </p>
                  )}
                </div>
              )}

              {/* Add to Calendar Button */}
              {availableDates.length > 0 && (
                <button
                  onClick={handleAddToCalendar}
                  disabled={availableDates.length === 0}
                  className={`inline-flex items-center justify-center bg-black px-[24px] py-[4px] text-white font-medium uppercase transition-all duration-200 shrink-0 mb-[16px] ${
                    availableDates.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/90'
                  }`}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Add to calendar
                </button>
              )}

              {/* View Event Button */}
              <button
                onClick={handleViewEvent}
                className="inline-flex items-center justify-center bg-black px-[24px] py-[4px] text-white font-medium uppercase transition-all duration-200 shrink-0 hover:bg-black/90"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(16px, 1.39vw, 20px)',
                  lineHeight: 'clamp(24px, 2.08vw, 30px)'
                }}
              >
                VIEW EVENT
              </button>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedActivity && (
          <div className="w-full min-[860px]:w-[400px] bg-white border-l border-black/10 flex items-center justify-center px-[36px] py-[36px]">
            <p
              className="text-black/50 text-center"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: '16px',
                lineHeight: '24px'
              }}
            >
              Click on a map marker to view activity details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
