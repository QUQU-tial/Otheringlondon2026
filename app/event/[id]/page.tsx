"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSubmission, getActivities, type Activity } from "../../lib/storage";
import { formatDisplayDateFromString } from "../../lib/calendar";

export default function EventDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = params.id as string;
  const isPreview = searchParams.get('preview') === 'true';
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      // For preview, get from submissions; otherwise get from activities
      if (isPreview) {
        const submission = await getSubmission(eventId);
        if (submission) {
          // Map submission-like row to Activity shape inline
          const activityFromSubmission: Activity = {
            id: submission.id,
            activity_title: submission.activity_title,
            author_name: submission.author_name,
            username: submission.username,
            activity_location: submission.activity_location,
            activity_date: submission.activity_date,
            activity_type: submission.activity_type,
            partner_name: submission.partner || submission.organizer,
            website_link: submission.website_link,
            body_text_1: submission.body_text_1,
            body_text_2: submission.body_text_2,
            activity_description: submission.activity_description,
            organizer: submission.organizer,
            partner: submission.partner,
            additional_media_links: submission.additional_media_links || [],
            primary_image: typeof submission.primary_image === "string" ? submission.primary_image : null,
            additional_images_1: typeof submission.additional_images_1 === "string" ? submission.additional_images_1 : null,
            additional_images_2: submission.additional_images_2?.filter((img): img is string => typeof img === "string") || null,
            createdAt: submission.createdAt,
            is_deleted: submission.is_deleted,
          };
          setActivity(activityFromSubmission);
        }
      } else {
        const activities = await getActivities();
        const foundActivity = activities.find((a) => a.id === eventId);
        setActivity(foundActivity || null);
      }

      setIsLoading(false);
    };

    load();
  }, [eventId, isPreview]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: '16px' }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-black mb-[16px]" style={{ fontFamily: "var(--font-inter)", fontSize: '16px' }}>
            Event not found
          </p>
          <a
            href="/submit"
            className="text-black underline hover:opacity-70"
            style={{ fontFamily: "var(--font-inter)", fontSize: '14px' }}
          >
            Back to submission form
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-black/5 border-b border-black/10 px-[36px] py-[12px]">
          <div className="max-w-[874px] mx-auto flex items-center justify-between">
            <p
              className="text-black/70"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              Preview — this is how your event will appear once published.
            </p>
            <a
              href="/submit"
              className="text-black underline hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              Back to editing
            </a>
          </div>
        </div>
      )}

      {/* Event Detail Content - Reusing Workspace Detail Panel Layout */}
      <div className="max-w-[874px] mx-auto px-[36px] py-[36px]">
        <div className="flex flex-col gap-[36px] pb-[60px]" style={{ fontFamily: "var(--font-inter)" }}>
          {/* Title Section */}
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <h2 
                className="font-medium text-black capitalize tracking-[-4.8px] whitespace-pre-wrap" 
                style={{ 
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(40px, 4.17vw, 60px)',
                  lineHeight: 'clamp(40px, 4.17vw, 60px)'
                }}
              >
                {activity.activity_title.toLowerCase()}
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
                  {activity.author_name || activity.username}
                </span>
              </div>

              {/* Primary Image */}
              {activity.primary_image && (activity.primary_image.startsWith('http') || activity.primary_image.startsWith('data:image')) ? (
                <div className="w-full">
                  <img 
                    src={activity.primary_image} 
                    alt="Primary image" 
                    className="w-full h-[388px] object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-[388px] w-full items-center justify-center bg-gray-300">
                  <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                    Image not available – please re-upload
                  </span>
                </div>
              )}
            </div>

            {/* Meta Information - Location/Date */}
            <div className="flex flex-col gap-[4px]">
              <div className="flex gap-[16px] items-start">
                <span 
                  className="font-medium text-black capitalize shrink-0" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Location:
                </span>
                <span 
                  className="font-medium text-black lowercase shrink-0" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {activity.activity_location.toLowerCase()}
                </span>
              </div>
              <div className="flex gap-[16px] items-start">
                <span 
                  className="font-medium text-black capitalize shrink-0" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Date:
                </span>
                <span 
                  className="font-medium text-black lowercase shrink-0" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {formatDisplayDateFromString(activity.activity_date)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Website Button */}
          {activity.website_link && (
            <div>
              <a
                href={activity.website_link}
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
          )}

          {/* Category and Organizer/Partner */}
          <div className="flex flex-col gap-[4px]">
            <div className="flex gap-[16px] items-start">
              <span 
                className="font-medium text-black capitalize" 
                style={{ 
                  fontFamily: "var(--font-source-sans-3)",
                  fontSize: 'clamp(16px, 1.39vw, 20px)',
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
                  lineHeight: 'clamp(24px, 2.08vw, 30px)'
                }}
              >
                {activity.activity_type}
              </span>
            </div>
            
            {(activity.organizer || activity.partner) && (
              <div className="flex gap-[16px] items-center">
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Organisers / Partners:
                </span>
                <span 
                  className="font-medium text-black capitalize" 
                  style={{ 
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  {activity.partner || activity.organizer}
                </span>
              </div>
            )}
          </div>

          {/* Activity Description */}
          {activity.activity_description && (
            <div
              className="text-black"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 'clamp(16px, 1.39vw, 20px)',
                lineHeight: 'clamp(24px, 2.08vw, 30px)'
              }}
              dangerouslySetInnerHTML={{ __html: activity.activity_description }}
            />
          )}

          {/* Body Text 1 */}
          {activity.body_text_1 && (
            <div 
              className="text-[14px] font-medium leading-[normal] text-black" 
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              <div dangerouslySetInnerHTML={{ __html: activity.body_text_1 || '' }} />
            </div>
          )}

          {/* Additional Images 1 */}
          {activity.additional_images_1 && (activity.additional_images_1.startsWith('http') || activity.additional_images_1.startsWith('data:image')) ? (
            <div className="w-full">
              <img 
                src={activity.additional_images_1} 
                alt="Additional image 1" 
                className="w-full aspect-[538/319] object-cover"
              />
            </div>
          ) : activity.additional_images_1 ? (
            <div className="aspect-[538/319] w-full flex items-center justify-center bg-gray-300">
              <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                Image not available – please re-upload
              </span>
            </div>
          ) : null}

          {/* Body Text 2 */}
          {activity.body_text_2 && (
            <div 
              className="text-[14px] font-medium leading-[normal] text-black" 
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              <div dangerouslySetInnerHTML={{ __html: activity.body_text_2 || '' }} />
            </div>
          )}

          {/* Additional Images 2 */}
          {activity.additional_images_2 && activity.additional_images_2.length > 0 ? (
            <div className="flex flex-col gap-[12px]">
              {activity.additional_images_2.map((img, index) => (
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
            activity.additional_images_2 === null && (
              <div className="aspect-[538/319] w-full flex items-center justify-center bg-gray-300">
                <span className="text-[14px] leading-[20px] text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                  Image not available – please re-upload
                </span>
              </div>
            )
          )}

          {/* Media Links - Inline text buttons */}
          {(activity.website_link || (activity.additional_media_links && activity.additional_media_links.length > 0)) && (
            <div className="flex flex-wrap gap-[16px] items-center">
              {activity.website_link && (
                <a
                  href={activity.website_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-[24px] py-[4px] text-black font-medium uppercase hover:opacity-70 transition-all duration-200 shrink-0"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 'clamp(16px, 1.39vw, 20px)',
                    lineHeight: 'clamp(24px, 2.08vw, 30px)'
                  }}
                >
                  Website
                </a>
              )}
              {activity.additional_media_links && activity.additional_media_links.length > 0 && (
                <>
                  {activity.website_link && <span className="text-black">·</span>}
                  {activity.additional_media_links.map((link, index) => (
                    <span key={index} className="flex items-center gap-[16px]">
                      {index > 0 && <span className="text-black">·</span>}
                      <a
                        href={link.media_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-[24px] py-[4px] text-black font-medium uppercase hover:opacity-70 transition-all duration-200 shrink-0"
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 'clamp(16px, 1.39vw, 20px)',
                          lineHeight: 'clamp(24px, 2.08vw, 30px)'
                        }}
                      >
                        {link.media_name || link.media_link}
                      </a>
                    </span>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

