"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Camera, User, Eye, X } from "lucide-react";
import { useUploadAvatar } from "@/hooks/use-upload-avatar";
import { useModalDialogLifecycle } from "@/components/runs/hooks/use-modal-dialog-lifecycle";

interface AvatarEditorProps {
  avatarUrl: string | null | undefined;
  onChange?: (newUrl: string) => void;
  className?: string;
}

function isLocalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

export function AvatarEditor({ avatarUrl, onChange, className }: AvatarEditorProps) {
  const [currentUrl, setCurrentUrl] = useState(avatarUrl);
  const [imageError, setImageError] = useState(false);
  const [showFullscreenAvatar, setShowFullscreenAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();

  const { closeButtonRef, dialogRef, handleDialogKeyDown } = useModalDialogLifecycle({
    open: showFullscreenAvatar,
    onClose: useCallback(() => setShowFullscreenAvatar(false), []),
  });

  // Sync state if avatarUrl prop changes
  useEffect(() => {
    setCurrentUrl(avatarUrl);
    setImageError(false);
  }, [avatarUrl]);

  const handleAvatarClick = useCallback(() => {
    if (onChange) {
      fileInputRef.current?.click();
    }
  }, [onChange]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onChange) return;

      try {
        const result = await uploadAvatar.mutateAsync(file);
        setCurrentUrl(result.avatarUrl);
        setImageError(false);
        onChange(result.avatarUrl);
      } catch {
        // Error is handled by the hook
      } finally {
        e.target.value = "";
      }
    },
    [onChange, uploadAvatar],
  );

  const showImage = currentUrl && !imageError;
  const unoptimized = useMemo(
    () => currentUrl ? isLocalUrl(currentUrl) : false,
    [currentUrl],
  );

  const handleContainerClick = useCallback(() => {
    if (showImage) {
      setShowFullscreenAvatar(true);
    } else if (onChange) {
      handleAvatarClick();
    }
  }, [showImage, onChange, handleAvatarClick]);

  const handleFloatingChangeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleAvatarClick();
    },
    [handleAvatarClick],
  );

  const handleFullscreenChangeClick = useCallback(() => {
    setShowFullscreenAvatar(false);
    handleAvatarClick();
  }, [handleAvatarClick]);

  const closeFullscreen = useCallback(() => {
    setShowFullscreenAvatar(false);
  }, []);

  const handleModalBackdropMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) setShowFullscreenAvatar(false);
  }, []);

  const isEditable = !!onChange;

  return (
    <div className={className}>
      <div
        className={`relative group/avatar ${showImage || isEditable ? "cursor-pointer" : "cursor-default"}`}
        onClick={handleContainerClick}
      >
        <div className="w-full aspect-square rounded-xl bg-surface-container overflow-hidden relative border border-white/5">
          {showImage ? (
            <>
              <Image
                src={currentUrl!}
                alt="User profile"
                fill
                unoptimized={unoptimized}
                onError={() => setImageError(true)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                <Eye className="size-8 text-white drop-shadow-md animate-in fade-in zoom-in duration-200" />
                <span className="text-white text-xs font-semibold drop-shadow-md font-label uppercase tracking-wider animate-in fade-in duration-200">
                  View Photo
                </span>
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={handleFloatingChangeClick}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-surface-container-high/95 text-on-surface border border-white/10 shadow-lg hover:bg-primary hover:text-white hover:border-primary active:scale-95 transition-all duration-200 z-10"
                  title="Change photo"
                >
                  <Camera className="size-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                <User className="size-10 text-on-surface-variant" />
              </div>
              {isEditable && (
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="size-8 text-white" />
                </div>
              )}
            </>
          )}
        </div>
        {isEditable && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        )}
        <div className="font-label text-[10px] text-on-surface-variant mt-4 uppercase tracking-widest text-center">
          {uploadAvatar.isPending ? (
            "Uploading..."
          ) : showImage ? (
            <span className="flex items-center justify-center gap-1.5">
              <span>Click to view</span>
              {isEditable && (
                <>
                  <span className="text-on-surface-variant/40">•</span>
                  <button
                    type="button"
                    onClick={handleFloatingChangeClick}
                    className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2 font-bold uppercase tracking-wider"
                  >
                    Change
                  </button>
                </>
              )}
            </span>
          ) : isEditable ? (
            "Click to change photo"
          ) : (
            "No profile photo"
          )}
        </div>
      </div>

      {showFullscreenAvatar && currentUrl && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
          onMouseDown={handleModalBackdropMouseDown}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Profile picture view"
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-200"
            onKeyDown={handleDialogKeyDown}
          >
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
              {isEditable && (
                <button
                  type="button"
                  onClick={handleFullscreenChangeClick}
                  className="p-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white text-on-surface border border-white/10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider font-label transition-all"
                >
                  <Camera className="size-4" />
                  Change Photo
                </button>
              )}
              <button
                ref={closeButtonRef}
                type="button"
                className="p-2 rounded-lg bg-surface-container-high hover:bg-error hover:text-white text-on-surface border border-white/10 transition-all"
                aria-label="Close fullscreen view"
                onClick={closeFullscreen}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative mt-12 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-lowest max-h-[75vh] max-w-full shadow-2xl flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUrl}
                alt="User profile fullscreen"
                className="max-h-[75vh] max-w-full object-contain rounded-2xl transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
