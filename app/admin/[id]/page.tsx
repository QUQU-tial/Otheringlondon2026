"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getSubmission, saveSubmission, updateActivityStatus, type Submission } from "../../lib/storage";

export default function AdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [status, setStatus] = useState<string>('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const sub = await getSubmission(submissionId);
      if (sub) {
        setSubmission(sub);
        setStatus(sub.status);
      }
    };
    load();
  }, [submissionId]);

  const handleApproveAndPublish = async () => {
    if (!submission) return;
    const updatedSubmission = { ...submission, status: 'published' as const };
    await saveSubmission(updatedSubmission);
    await updateActivityStatus(submission.id, "published");
    setStatus("published");
    setSubmission(updatedSubmission);
  };

  const handleReject = async () => {
    if (!submission) return;
    const updatedSubmission = { ...submission, status: 'rejected' as const };
    await saveSubmission(updatedSubmission);
    await updateActivityStatus(submission.id, "rejected");
    setStatus("rejected");
    setSubmission(updatedSubmission);
  };

  const handleRemove = async () => {
    if (!submission) return;
    // Soft delete: mark as removed
    const updatedSubmission = { ...submission, status: 'removed' as const, is_deleted: true };
    await saveSubmission(updatedSubmission);
    await updateActivityStatus(submission.id, "removed", { is_deleted: true });
    setShowRemoveConfirm(false);
    router.push('/admin');
  };

  if (!submission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black" style={{ fontFamily: "var(--font-inter)", fontSize: '16px' }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Content Container - max-width 672px, centered */}
      <div className="max-w-[672px] mx-auto px-[36px] py-[36px]">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-[36px] text-black hover:opacity-70 transition-opacity"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: '16px',
            lineHeight: '24px'
          }}
        >
          ← Back to List
        </button>

        {/* Page Title + Preview */}
        <div className="flex items-center justify-between mb-[36px]">
          <h1 
            className="font-medium text-black capitalize"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 'clamp(40px, 4.17vw, 60px)',
              lineHeight: 'clamp(40px, 4.17vw, 60px)',
              letterSpacing: '-4.8px'
            }}
          >
            Submission Detail
          </h1>
          <a
            href={`/event/${submission.id}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-[12px] py-[8px] border border-black bg-white text-black font-medium uppercase transition-colors hover:bg-black hover:text-white"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '12px',
              lineHeight: '16px'
            }}
          >
            Preview
          </a>
        </div>

        {/* Status Display */}
        <div className="mb-[36px] pb-[12px] border-b border-black">
          <span
            className="font-medium text-black uppercase"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '12px',
              lineHeight: '16px'
            }}
          >
            Status: {status}
          </span>
        </div>

        {/* Submission Fields - TAB 1 */}
        <div className="flex flex-col gap-[36px] mb-[36px]">
          <h2
            className="font-medium text-black capitalize"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '30px',
              lineHeight: '38px'
            }}
          >
            Basic Info
          </h2>

          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                First Name
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.first_name}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                Last Name
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.last_name}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                Organization Name
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.organization_name}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                Email
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.email}
              </p>
            </div>
          </div>
        </div>

        {/* Submission Fields - TAB 2 */}
        <div className="flex flex-col gap-[36px] mb-[36px]">
          <h2
            className="font-medium text-black capitalize"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '30px',
              lineHeight: '38px'
            }}
          >
            About the Exhibition
          </h2>

          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                activity_title
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.activity_title}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                author_name
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.author_name}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                activity_type
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.activity_type}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                activity_description
              </label>
              <div
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
                dangerouslySetInnerHTML={{ __html: submission.activity_description || '' }}
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                activity_location
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.activity_location}
              </p>
            </div>


            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                primary_image
              </label>
              <div className="w-full border border-black">
                {submission.primary_image && typeof submission.primary_image === 'string' && (submission.primary_image.startsWith('http') || submission.primary_image.startsWith('data:image')) ? (
                  <img 
                    src={submission.primary_image} 
                    alt={submission.primary_image_alt || 'Primary image'} 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
                    <span className="text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: '14px' }}>
                      Image not available – please re-upload
                    </span>
                  </div>
                )}
              </div>
              {submission.primary_image_alt && (
                <p
                  className="text-black/70"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: '12px',
                    lineHeight: '16px'
                  }}
                >
                  Alt: {submission.primary_image_alt}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                website_link
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.website_link}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                body_text_1
              </label>
              <div
                className="text-black"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
                dangerouslySetInnerHTML={{ __html: submission.body_text_1 || '' }}
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                additional_images_1
              </label>
              <div className="w-full border border-black">
                {submission.additional_images_1 && typeof submission.additional_images_1 === 'string' && (submission.additional_images_1.startsWith('http') || submission.additional_images_1.startsWith('data:image')) ? (
                  <img 
                    src={submission.additional_images_1} 
                    alt={submission.additional_images_1_alt || 'Additional image 1'} 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
                    <span className="text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: '14px' }}>
                      Image not available – please re-upload
                    </span>
                  </div>
                )}
              </div>
              {submission.additional_images_1_alt && (
                <p
                  className="text-black/70"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: '12px',
                    lineHeight: '16px'
                  }}
                >
                  Alt: {submission.additional_images_1_alt}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                body_text_2
              </label>
              <div
                className="text-black"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
                dangerouslySetInnerHTML={{ __html: submission.body_text_2 || '' }}
              />
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                additional_images_2
              </label>
              <div className="flex flex-col gap-[12px]">
                {submission.additional_images_2 && submission.additional_images_2.map((img: File | string, index: number) => (
                  <div key={index} className="w-full border border-black">
                    {typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:image')) ? (
                      <div className="relative">
                        <img 
                          src={img} 
                          alt={submission.additional_images_2_alt?.[index] || `Additional image 2 ${index + 1}`} 
                          className="w-full h-auto max-h-[300px] object-contain"
                        />
                        {submission.additional_images_2_alt && submission.additional_images_2_alt[index] && (
                          <p
                            className="text-black/70 absolute bottom-2 left-2 bg-white/80 px-[8px] py-[4px]"
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: '12px',
                              lineHeight: '16px'
                            }}
                          >
                            Alt: {submission.additional_images_2_alt[index]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
                        <span className="text-black/50" style={{ fontFamily: "var(--font-inter)", fontSize: '14px' }}>
                          Image not available – please re-upload
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                organizer
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.organizer}
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label
                className="font-medium text-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                partner
              </label>
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {submission.partner || "(empty)"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[16px] pt-[24px] border-t border-black">
          <button
            type="button"
            onClick={handleApproveAndPublish}
            className="px-[16px] py-[10px] bg-black text-white font-medium uppercase transition-colors hover:bg-black/90"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '16px',
              lineHeight: '24px',
              height: '40px'
            }}
          >
            Approve & Publish
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="px-[12px] py-[8px] border border-black bg-white text-black font-medium uppercase transition-colors hover:bg-black hover:text-white"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '16px',
              lineHeight: '24px',
              height: '32px'
            }}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setShowRemoveConfirm(true)}
            className="px-[12px] py-[8px] border border-black bg-white text-black font-medium uppercase transition-colors hover:bg-black hover:text-white"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: '16px',
              lineHeight: '24px',
              height: '32px'
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowRemoveConfirm(false)}
        >
          <div 
            className="bg-white rounded-[4px] p-[24px] max-w-[400px] w-full mx-[16px] border border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-medium text-black mb-[16px]"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: '24px',
                lineHeight: '32px'
              }}
            >
              Confirm removal
            </h2>
            <p
              className="text-black mb-[24px]"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: '16px',
                lineHeight: '24px'
              }}
            >
              This will remove the activity from the workspace. Continue?
            </p>
            <div className="flex gap-[16px]">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="inline-flex items-center justify-center px-[24px] py-[4px] text-black font-medium uppercase hover:opacity-70 transition-all duration-200"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(16px, 1.39vw, 20px)',
                  lineHeight: 'clamp(24px, 2.08vw, 30px)'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center justify-center bg-black px-[24px] py-[4px] text-white font-medium uppercase hover:bg-black/90 transition-all duration-200"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 'clamp(16px, 1.39vw, 20px)',
                  lineHeight: 'clamp(24px, 2.08vw, 30px)'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

