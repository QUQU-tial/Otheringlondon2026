"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActivities, type Activity } from "./lib/storage";
import { getCurrentUser, signOut, onAuthStateChange, type User } from "./lib/auth";
import { parseActivityDate, formatDisplayDateFromString } from "./lib/calendar";
import { heroTitleBalancedBreaks } from "./lib/hero-title-breaks";
import { MORANDI_HOVER_PALETTE } from "./lib/morandi-hover";
import { PrimaryPanelFaq } from "./components/PrimaryPanelFaq";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  /** Left list hover: new colour each hover (random, avoids repeating previous hover). */
  const activityHoverPaintRef = useRef<{ lastBar: string | null }>({ lastBar: null });

  const handleActivityListHoverPaint = (e: React.MouseEvent<HTMLButtonElement>) => {
    const palette = MORANDI_HOVER_PALETTE;
    const n = palette.length;
    let idx = Math.floor(Math.random() * n);
    if (n > 1) {
      let guard = 0;
      while (palette[idx].bar === activityHoverPaintRef.current.lastBar && guard++ < 16) {
        idx = Math.floor(Math.random() * n);
      }
    }
    const pick = palette[idx];
    activityHoverPaintRef.current.lastBar = pick.bar;
    e.currentTarget.style.setProperty("--activity-hover-bar", pick.bar);
    e.currentTarget.style.setProperty("--activity-hover-fg", pick.fg);
  };
  const filteredActivities = menuSearchQuery.trim()
    ? activities.filter((a) =>
        a.activity_title.toLowerCase().includes(menuSearchQuery.trim().toLowerCase())
      )
    : activities;
  const selectedActivity =
    activities.find((a) => a.id === selectedActivityId) ||
    (activities.length > 0 ? activities[0] : null);

  // Left panel: group activities by calendar week of their event date
  type WeekSection = {
    key: string;
    start: Date;
    end: Date;
    label: string;
    activities: Activity[];
  };

  const weekSections: WeekSection[] = [];
  const weekMap = new Map<string, WeekSection>();
  const unscheduled: Activity[] = [];

  const formatWeekLabel = (start: Date, end: Date): string => {
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const sDay = start.getDate();
    const sMonth = monthNames[start.getMonth()] ?? "";
    const sYear = start.getFullYear();
    const eDay = end.getDate();
    const eMonth = monthNames[end.getMonth()] ?? "";
    const eYear = end.getFullYear();

    if (sYear === eYear && sMonth === eMonth) {
      // 15–21 August, 2026
      return `${sDay}–${eDay} ${sMonth}, ${sYear}`;
    }
    // 29 August, 2026 – 4 September, 2026
    return `${sDay} ${sMonth}, ${sYear} – ${eDay} ${eMonth}, ${eYear}`;
  };

  const assignActivityToWeek = (activity: Activity) => {
    const dates = parseActivityDate(activity.activity_date || "");
    const first = dates[0];
    if (!first) {
      unscheduled.push(activity);
      return;
    }

    const start = new Date(first);
    const day = start.getDay(); // 0 (Sun) - 6 (Mon)
    const diffToMonday = (day + 6) % 7; // convert so week starts Monday
    start.setDate(start.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const key = start.toISOString().slice(0, 10);
    let section = weekMap.get(key);
    if (!section) {
      section = {
        key,
        start,
        end,
        label: formatWeekLabel(start, end),
        activities: [],
      };
      weekMap.set(key, section);
      weekSections.push(section);
    }
    section.activities.push(activity);
  };

  activities.forEach(assignActivityToWeek);
  // Put "Date TBA" section at the end if needed
  if (unscheduled.length > 0) {
    weekSections.push({
      key: "unscheduled",
      start: new Date(0),
      end: new Date(0),
      label: "Date TBA",
      activities: unscheduled,
    });
  }
  // Sort sections by week start (unscheduled stays at end)
  weekSections.sort((a, b) => {
    if (a.key === "unscheduled") return 1;
    if (b.key === "unscheduled") return -1;
    return a.start.getTime() - b.start.getTime();
  });

  useEffect(() => {
    const loadActivities = async () => {
      const loadedActivities = await getActivities();
      setActivities(loadedActivities);
      
      // Check for activityId in URL params (from partners page navigation)
      const urlActivityId = searchParams.get('activityId');
      
      if (loadedActivities.length > 0) {
        // Priority: URL param > current selection > first activity
        if (urlActivityId && loadedActivities.find(a => a.id === urlActivityId)) {
          setSelectedActivityId(urlActivityId);
          // Clear URL param after reading
          router.replace('/', { scroll: false });
        } else if (!selectedActivityId || !loadedActivities.find(a => a.id === selectedActivityId)) {
          setSelectedActivityId(loadedActivities[0].id);
        }
      } else {
        // No activities, clear selection
        setSelectedActivityId("");
      }
    };
    
    loadActivities();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadActivities();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [selectedActivityId, searchParams, router]);
  
  // Scroll-triggered reveal observer
  useEffect(() => {
    let observer: IntersectionObserver;
    
    // Small delay to ensure DOM is ready after activity change
    const timeoutId = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, observerOptions);

      // Remove revealed class from all elements first (for activity changes)
      const allElements = document.querySelectorAll('.reveal-content, .reveal-image');
      allElements.forEach((el) => el.classList.remove('revealed'));

      // Observe all reveal elements
      allElements.forEach((el) => observer.observe(el));

      // Check if elements are already in viewport (for initial load)
      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          el.classList.add('revealed');
        }
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        const allElements = document.querySelectorAll('.reveal-content, .reveal-image');
        allElements.forEach((el) => observer.unobserve(el));
      }
    };
  }, [selectedActivityId]); // Re-run when activity changes to observe new content
  
  // Auth state management
  useEffect(() => {
    // Get initial user
    getCurrentUser().then(setUser);
    
    // Listen to auth changes
    const unsubscribe = onAuthStateChange(setUser);
    return unsubscribe;
  }, []);
  
  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  
  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };
  
const handleMenuClose = () => {
    setMenuOpen(false);
    setMenuSearchQuery("");
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
    setMenuOpen(false);
    setMenuSearchQuery("");
    requestAnimationFrame(() => {
      const el = document.getElementById(`activity-${activityId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleLogin = () => {
    const returnTo = window.location.pathname;
    if (returnTo !== '/login') {
      sessionStorage.setItem('returnTo', returnTo);
    }
    router.push('/login');
    handleMenuClose();
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/');
    handleMenuClose();
  };
  
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Workspace Page Container */}
      <div className="workspace-container flex flex-col min-[860px]:flex-row h-full overflow-y-auto min-[860px]:overflow-hidden">
        {/* Panel / Primary */}
        <div 
          className="panel-primary relative flex h-screen min-[860px]:h-full min-[860px]:min-w-0 min-[860px]:shrink flex-col gap-[12px] bg-[#1C1C1C] shrink-0 overflow-hidden"
        >
          {/* Panel / Primary Menu Bar */}
          <header 
            className="flex shrink-0 items-center justify-between bg-[#1C1C1C] px-[36px] sticky top-0 z-10" 
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
                src="/othering-logo.png"
                alt="OT Festival – Othering"
                className="block"
                style={{
                  height: 'clamp(29px, 3vw, 38px)', // ~20% larger
                  width: 'auto',
                }}
              />
            </a>
            <nav className="ml-auto flex items-center gap-[24px] relative">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuClick}
                  className="text-white p-[4px] transition-opacity hover:opacity-70 focus:outline-none focus:opacity-80"
                  style={{ fontFamily: "var(--font-source-sans-3)" }}
                  aria-label="Menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-[8px] bg-[#2d2d2d] min-w-[240px] max-w-[320px] max-h-[min(90vh,480px)] overflow-y-auto flex flex-col z-50">
                    {/* Search activities */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-[10px] px-[16px] py-[12px] text-[#E1E1E1]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                          type="search"
                          placeholder="Search activities…"
                          value={menuSearchQuery}
                          onChange={(e) => setMenuSearchQuery(e.target.value)}
                          className="flex-1 min-w-0 bg-transparent border-0 text-white placeholder:text-[#888] focus:outline-none focus:ring-0"
                          style={{ fontFamily: "var(--font-poppins)", fontSize: "14px" }}
                          autoFocus
                        />
                      </div>
                      {activities.length > 0 && (
                        <div className="overflow-y-auto max-h-[100px]">
                          {filteredActivities.length === 0 ? (
                            <div className="px-[24px] py-[12px] text-[#888]" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px" }}>
                              No matches
                            </div>
                          ) : (
                            filteredActivities.map((activity) => (
                              <button
                                key={activity.id}
                                type="button"
                                onClick={() => handleSelectActivity(activity.id)}
                                className="w-full text-left px-[24px] py-[10px] text-white transition-colors hover:bg-white/10"
                                style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", fontWeight: 300 }}
                              >
                                {activity.activity_title}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col pt-1">
                      <a
                        href="/partners"
                        onClick={handleMenuClose}
                        className="px-[24px] py-[16px] text-white transition-all duration-200 hover:opacity-70"
                        style={{ 
                          fontFamily: "var(--font-poppins)",
                          fontSize: '16px',
                          fontWeight: 300,
                          lineHeight: 'normal'
                        }}
                      >
                        All our partners
                      </a>
                      <a
                        href="/submit"
                        onClick={handleMenuClose}
                        className="px-[24px] py-[16px] text-white transition-all duration-200 hover:opacity-70"
                        style={{ 
                          fontFamily: "var(--font-poppins)",
                          fontSize: '16px',
                          fontWeight: 300,
                          lineHeight: 'normal'
                        }}
                      >
                        Take part
                      </a>
                      <a
                        href="/about-us"
                        onClick={handleMenuClose}
                        className="px-[24px] py-[16px] text-white transition-all duration-200 hover:opacity-70"
                        style={{ 
                          fontFamily: "var(--font-poppins)",
                          fontSize: '16px',
                          fontWeight: 300,
                          lineHeight: 'normal'
                        }}
                      >
                        About us
                      </a>
                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="px-[24px] py-[16px] text-white transition-all duration-200 hover:opacity-70 text-left"
                          style={{ 
                            fontFamily: "var(--font-poppins)",
                            fontSize: '16px',
                            fontWeight: 300,
                            lineHeight: 'normal'
                          }}
                        >
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={handleLogin}
                          className="px-[24px] py-[16px] text-white transition-all duration-200 hover:opacity-70 text-left"
                          style={{ 
                            fontFamily: "var(--font-poppins)",
                            fontSize: '16px',
                            fontWeight: 300,
                            lineHeight: 'normal'
                          }}
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </header>

          {/* Panel / Primary Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="flex flex-col px-[36px] gap-[30px] min-w-0" style={{ fontFamily: "var(--font-inter)" }}>
            {/* Activity List */}
            <ul className="flex flex-col gap-[12px]">
              {activities.length === 0 ? (
                <li className="text-[#E1E1E1] text-center py-[40px]">
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: '16px' }}>
                    No published activities yet
                  </p>
                </li>
              ) : (
                <>
                  {weekSections.map((section, index) => {
                    const hideWeekLabel =
                      section.label === "14–20 September, 2026" ||
                      section.label === "14-20 September, 2026";
                    return (
                    <React.Fragment key={section.key}>
                      {!hideWeekLabel && (
                        <li className={`${index > 0 ? "mt-[12px] " : ""}text-[10px] tracking-[0.08em] uppercase text-[#9A9A9A]`}>
                          {section.label}
                        </li>
                      )}
                      {section.activities.map((activity, actIndex) => {
                        const firstInSectionGap =
                          hideWeekLabel && actIndex === 0 && index > 0 ? "mt-[12px]" : "";
                        if (selectedActivityId === activity.id) {
                          return (
                            <li
                              key={activity.id}
                              id={`activity-${activity.id}`}
                              className={firstInSectionGap}
                            >
                              <button
                                onClick={() => setSelectedActivityId(activity.id)}
                                className="w-full text-left uppercase transition-opacity hover:opacity-90 min-w-0 motion-reduce:transition-none"
                                style={{ fontFamily: "var(--font-source-sans-3)" }}
                              >
                                {/* Hero: 032c-style editorial; balanced word breaks */}
                                <div 
                                  className="hero-title hero-title-hyphenate flex flex-col font-bold text-white overflow-visible break-words"
                                  style={{
                                    fontSize: 'clamp(96px, calc(-160px + 25vw), 240px)',
                                    lineHeight: 'clamp(70.2px, calc(-116px + 18.26vw), 176px)'
                                  }}
                                >
                                  {heroTitleBalancedBreaks(activity.activity_title.toUpperCase())}
                                </div>
                              </button>
                            </li>
                          );
                        }
                        return (
                          <li
                            key={activity.id}
                            id={`activity-${activity.id}`}
                            className={firstInSectionGap}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedActivityId(activity.id)}
                              onMouseEnter={handleActivityListHoverPaint}
                              className="activity-list-item w-full text-left font-bold uppercase whitespace-pre-wrap"
                            >
                              <span
                                className="activity-title-wrapper"
                                style={{ 
                                  fontFamily: "var(--font-source-sans-3)",
                                  fontSize: 'clamp(20px, 2.08vw, 36px)',
                                  lineHeight: 'clamp(20px, 2.08vw, 36px)'
                                }}
                              >
                                <span className="activity-title-base">
                                  {activity.activity_title}
                                </span>
                                <span className="activity-title-overlay">
                                  {activity.activity_title}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </React.Fragment>
                    );
                  })}
                </>
              )}
            </ul>

            </div>
          </div>

          {/* JOIN US Section */}
          <div 
            className="flex shrink-0 items-end justify-end bg-[#1C1C1C] px-[36px]" 
            style={{
              paddingTop: 'clamp(8px, 0.83vw, 12px)',
              paddingBottom: 'clamp(20px, 1.67vw, 24px)'
            }}
          >
            <a
              href="/submit"
              className="flex items-center gap-[12px] text-white uppercase transition-all duration-200 hover:opacity-70 group"
              style={{ 
                fontFamily: "var(--font-inter)",
                fontSize: 'clamp(16px, 1.39vw, 20px)',
                fontWeight: 500,
                lineHeight: 'clamp(24px, 2.08vw, 30px)'
              }}
            >
              <span>Join us</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
            </a>
          </div>

          <PrimaryPanelFaq />
        </div>

        {/* Panel / Detail */}
        <div 
          className="panel-detail flex h-auto min-[860px]:h-full min-[860px]:min-w-0 min-[860px]:shrink flex-col gap-[12px] bg-white px-[36px] shrink-0"
        >
          {/* Panel / Detail Menu Bar */}
          <header 
            className="flex shrink-0 items-center justify-between bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/95" 
            style={{ 
              fontFamily: "var(--font-inter)",
              paddingTop: 'clamp(16px, 1.67vw, 24px)',
              paddingBottom: 'clamp(8px, 0.83vw, 12px)'
            }}
          >
            <a 
              href="#" 
              className="text-black capitalize transition-all duration-200 hover:opacity-70" 
              style={{ 
                fontFamily: "var(--font-source-sans-3)",
                fontSize: 'clamp(16px, 1.39vw, 20px)',
                fontWeight: 500,
                lineHeight: 'clamp(24px, 2.08vw, 30px)'
              }}
            >
              View all programmes
          </a>
          <a
              href={user ? "/submit" : "/submit"} 
              className="text-black capitalize transition-all duration-200 hover:opacity-70" 
              style={{ 
                fontFamily: "var(--font-source-sans-3)",
                fontSize: 'clamp(16px, 1.39vw, 20px)',
                fontWeight: 500,
                lineHeight: 'clamp(24px, 2.08vw, 30px)'
              }}
            >
              {user ? "My program" : "Become a Partner"}
            </a>
          </header>

          {/* Panel / Detail Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {selectedActivity ? (
              <div className="flex flex-col gap-[36px] pb-[60px]" style={{ fontFamily: "var(--font-inter)" }}>
              {/* Title Section Wrapper - 24px gap between title block and location/date */}
              <div className="flex flex-col gap-[24px]">
                {/* Title Block - 16px gap between title, author, image */}
                <div className="reveal-content flex flex-col gap-[16px]">
                  <h2 
                    className="font-medium text-black capitalize tracking-[-4.8px] whitespace-pre-wrap" 
                    style={{ 
                      fontFamily: "var(--font-inter)",
                      fontSize: 'clamp(40px, 4.17vw, 60px)',
                      lineHeight: 'clamp(40px, 4.17vw, 60px)'
                    }}
                  >
                    {selectedActivity.activity_title.toLowerCase()}
                  </h2>

                {/* Author Name */}
                <div className="flex items-center gap-[4px]">
                  <span 
                    className="font-medium text-black capitalize" 
                    style={{ 
                      fontFamily: "var(--font-poppins)",
                      fontSize: 'clamp(12px, 0.97vw, 14px)',
                      lineHeight: 'normal'
                    }}
                  >
                    by
                  </span>
                  <span 
                    className="font-medium text-black capitalize" 
                    style={{ 
                      fontFamily: "var(--font-poppins)",
                      fontSize: 'clamp(12px, 0.97vw, 14px)',
                      lineHeight: 'normal'
                    }}
                  >
                    {selectedActivity.author_name || selectedActivity.username}
                  </span>
                </div>

                {/* Primary Image */}
                {selectedActivity.primary_image && (selectedActivity.primary_image.startsWith('http') || selectedActivity.primary_image.startsWith('data:image')) ? (
                  <div className="reveal-image w-full">
                    <img 
                      src={selectedActivity.primary_image} 
                      alt="Primary image" 
                      className="w-full h-[388px] object-cover"
                    />
                  </div>
                ) : (
                  <div className="reveal-image flex h-[388px] w-full items-center justify-center bg-gray-300">
                    <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                      Image not available – please re-upload
                    </span>
                  </div>
                )}
              </div>

              {/* Meta Information - Location/Date (grid: value columns align) */}
              <div className="reveal-content grid grid-cols-[minmax(6.25rem,max-content)_minmax(0,1fr)] gap-x-4 gap-y-1 items-start">
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Location:
                </span>
                <a 
                  href={`/partners?activityId=${selectedActivity.id}`}
                  className="font-medium text-black min-w-0 break-words hover:opacity-70 transition-opacity underline"
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {selectedActivity.activity_location}
                </a>
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Date:
                </span>
                <span 
                  className="font-medium text-black min-w-0" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {formatDisplayDateFromString(selectedActivity.activity_date)}
                </span>
              </div>
            </div>
              
            {/* Website Button - hugs content, not full width */}
            <div className="reveal-content">
              <a
                href={selectedActivity.website_link}
            target="_blank"
            rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black px-[24px] py-[4px] text-white font-medium uppercase hover:bg-black/90 transition-all duration-200 shrink-0 motion-reduce:transition-none"
                style={{ 
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(16px, 1.39vw, 20px)',
                  lineHeight: 'clamp(24px, 2.08vw, 30px)'
                }}
              >
                Website
              </a>
            </div>

              <div className="reveal-content flex flex-col gap-[4px]">
              <div className="flex gap-[16px] items-start">
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Category:
                </span>
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {selectedActivity.activity_type}
                </span>
              </div>
              
              {/* Organisers / Partners */}
              <div className="flex gap-[16px] items-center">
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Organisers / Partners:
                </span>
                <a
                  href="#"
                  className="font-semibold text-black underline capitalize hover:no-underline"
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {selectedActivity.partner_name}
                </a>
              </div>
            </div>

            {/* Body Text 1 */}
            <div 
              className="reveal-content text-[14px] font-light leading-[normal] text-black" 
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              <div dangerouslySetInnerHTML={{ __html: selectedActivity.body_text_1 || '' }} />
            </div>

            {/* Additional Images 1 */}
            {selectedActivity.additional_images_1 && (selectedActivity.additional_images_1.startsWith('http') || selectedActivity.additional_images_1.startsWith('data:image')) ? (
              <div className="reveal-image aspect-[538/319] w-full">
                <img 
                  src={selectedActivity.additional_images_1} 
                  alt="Additional image 1" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="reveal-image aspect-[538/319] w-full flex items-center justify-center bg-gray-300">
                <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                  Image not available – please re-upload
                </span>
              </div>
            )}

            {/* Body Text 2 */}
            <div 
              className="reveal-content text-[14px] font-light leading-[normal] text-black" 
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              <div dangerouslySetInnerHTML={{ __html: selectedActivity.body_text_2 || '' }} />
            </div>

            {/* Additional Images 2 */}
            {selectedActivity.additional_images_2 && selectedActivity.additional_images_2.length > 0 ? (
              <div className="reveal-image flex flex-col gap-[12px]">
                {selectedActivity.additional_images_2.map((img, index) => (
                  img && (img.startsWith('http') || img.startsWith('data:image')) ? (
                    <img 
                      key={index}
                      src={img} 
                      alt={`Additional image 2 ${index + 1}`} 
                      className="w-full aspect-[538/319] object-cover"
                    />
                  ) : (
                    <div key={index} className="aspect-[538/319] w-full flex items-center justify-center bg-gray-300">
                      <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                        Image {index + 1}: Image not available – please re-upload
                      </span>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="reveal-image aspect-[538/319] w-full flex items-center justify-center bg-gray-300">
                <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                  Image not available – please re-upload
                </span>
              </div>
            )}

            {/* Media links: same pill as Website (top), seven palette backgrounds, black label */}
            <div className="reveal-content flex flex-wrap gap-[16px] items-center">
              {(() => {
                const paletteLen = MORANDI_HOVER_PALETTE.length;
                let colorOrdinal = 0;
                const nextBg = () =>
                  MORANDI_HOVER_PALETTE[colorOrdinal++ % paletteLen].bar;
                const endLinkBaseClass =
                  "inline-flex items-center justify-center px-[24px] py-[4px] text-black font-medium uppercase hover:opacity-90 transition-all duration-200 shrink-0 motion-reduce:transition-none no-underline";
                const endLinkTypography = {
                  fontFamily: "var(--font-inter)",
                  fontSize: "clamp(16px, 1.39vw, 20px)",
                  lineHeight: "clamp(24px, 2.08vw, 30px)",
                } as const;
                return (
                  <>
                    {selectedActivity.website_link && (
                      <a
                        href={selectedActivity.website_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={endLinkBaseClass}
                        style={{ ...endLinkTypography, backgroundColor: nextBg() }}
                      >
                        Website
                      </a>
                    )}
                    {selectedActivity.additional_media_links?.map((link, index) => {
                      if (!link.media_link) return null;
                      let displayText = link.media_name;
                      if (!displayText) {
                        try {
                          displayText = new URL(link.media_link).hostname;
                        } catch {
                          displayText = link.media_link;
                        }
                      }
                      return (
                        <a
                          key={index}
                          href={link.media_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={endLinkBaseClass}
                          style={{ ...endLinkTypography, backgroundColor: nextBg() }}
                        >
                          {displayText}
                        </a>
                      );
                    })}
                  </>
                );
              })()}
            </div>
            </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: '16px' }}>
                  No activity selected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
