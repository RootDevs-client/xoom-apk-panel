"use client";

import { BadgeAlert, ImagePlus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SettingsImageUploadProps {
  accept?: "image" | "file" | string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  existingImageUrl?: string; // edit mode
  onRemoveExisting?: () => void; // callback when existing image is removed
  error?: string;
  required?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

// ─── Constants & helpers ─────────────────────────────────────────────────────
const IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getAcceptString = (accept: string): string => {
  if (accept === "image") return IMAGE_TYPES.join(",");
  if (accept === "file") return "*/*";
  return accept;
};

const isImageFile = (file: File) => file.type.startsWith("image/");

const isAllowedImageType = (file: File) =>
  IMAGE_TYPES.some((type) => file.type.startsWith(type));

// ─── Component ───────────────────────────────────────────────────────────────
const SettingsImageUpload = ({
  accept = "file",
  maxSize = 5,
  maxFiles = 5,
  onFilesChange,
  className = "",
  disabled = false,
  existingImageUrl,
  onRemoveExisting,
  error,
  required = false,
}: SettingsImageUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showExistingImage, setShowExistingImage] = useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowExistingImage(!!existingImageUrl);
  }, [existingImageUrl]);

  const isUploadDisabled = disabled || uploadedFiles.length >= maxFiles;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `${file.name} exceeds ${maxSize}MB limit`;
    }
    if (accept === "image") {
      if (!isImageFile(file)) {
        return `${file.name} is not an image file`;
      }
      if (!isAllowedImageType(file)) {
        return `${file.name} must be PNG, JPG, JPEG, or SVG`;
      }
    }
    return null;
  };

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!isImageFile(file)) return resolve(undefined);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || isUploadDisabled) return;

      const newErrors: string[] = [];
      const validUploads: UploadedFile[] = [];

      if (uploadedFiles.length + files.length > maxFiles) {
        setErrors([`Maximum ${maxFiles} files allowed`]);
        return;
      }

      for (const file of Array.from(files)) {
        const vError = validateFile(file);
        if (vError) {
          newErrors.push(vError);
          continue;
        }
        const preview = await generatePreview(file);
        validUploads.push({ file, preview, id: crypto.randomUUID() });
      }

      if (validUploads.length > 0) {
        setShowExistingImage(false);
        const updatedFiles = [...uploadedFiles, ...validUploads];
        setUploadedFiles(updatedFiles);
        onFilesChange?.(updatedFiles.map((f) => f.file));
      }

      setErrors(newErrors);
    },
    [uploadedFiles, maxFiles, isUploadDisabled, onFilesChange, accept, maxSize],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploadDisabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (isUploadDisabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    const newFiles = uploadedFiles.filter((f) => f.id !== id);
    setUploadedFiles(newFiles);
    setErrors([]);
    onFilesChange?.(newFiles.map((f) => f.file));
    if (newFiles.length === 0 && existingImageUrl) {
      setShowExistingImage(true);
    }
  };

  const removeExistingImage = () => {
    setShowExistingImage(false);
    onRemoveExisting?.();
  };

  const openFileDialog = () => {
    if (!isUploadDisabled) inputRef.current?.click();
  };

  // ── Existing image preview (edit mode) ───────────────────────────────────
  if (
    maxFiles === 1 &&
    showExistingImage &&
    existingImageUrl &&
    uploadedFiles.length === 0
  ) {
    return (
      <div className={cn("w-full", className)}>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm">
          <img
            src={existingImageUrl}
            alt="Current image"
            width={600}
            height={360}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

          {/* Action bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
            <div className="text-white">
              <p className="text-sm font-medium drop-shadow">Current image</p>
              <p className="text-xs text-white/80">Tap replace to change</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow"
              >
                <RefreshCw className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeExistingImage();
                }}
                disabled={disabled}
                aria-label="Remove image"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-red-500/95 p-1.5 text-white shadow-sm backdrop-blur transition-all hover:bg-red-600 hover:shadow"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={getAcceptString(accept)}
          onChange={handleChange}
          disabled={disabled}
        />

        {error && (
          <div className="mt-2 flex items-center gap-1.5">
            <BadgeAlert className="h-3.5 w-3.5 text-red-500" />
            <p className="text-xs font-medium text-red-500">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Single file NEW image preview ─────────────────────────────────────────
  if (maxFiles === 1 && uploadedFiles.length > 0 && uploadedFiles[0].preview) {
    const file = uploadedFiles[0];
    return (
      <div className={cn("w-full", className)}>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm">
          <img
            src={file.preview}
            alt={file.file.name}
            width={600}
            height={360}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-medium drop-shadow">
                {file.file.name}
              </p>
              <p className="text-xs text-white/80">
                {formatFileSize(file.file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(file.id);
              }}
              disabled={disabled}
              aria-label="Remove image"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-500/95 p-1.5 text-white shadow-sm backdrop-blur transition-all hover:bg-red-600 hover:shadow"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dropzone ──────────────────────────────────────────────────────────────
  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openFileDialog();
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center outline-none transition-all duration-200",
          dragActive
            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/[0.03]",
          isUploadDisabled &&
            "cursor-not-allowed opacity-50 hover:border-border hover:bg-muted/30",
          "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={getAcceptString(accept)}
          onChange={handleChange}
          multiple={maxFiles > 1}
          disabled={isUploadDisabled}
        />

        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl transition-colors",
            dragActive
              ? "bg-primary/15 text-primary"
              : "bg-card text-muted-foreground shadow-sm ring-1 ring-border group-hover:text-primary",
          )}
        >
          <UploadCloud className="size-6" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {dragActive ? "Drop image to upload" : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            {accept === "image" ? "PNG, JPG, JPEG, SVG or WEBP" : "Any file type"} • Max{" "}
            {maxSize}MB
            {required && <span className="text-red-500"> • Required</span>}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5">
          <BadgeAlert className="h-3.5 w-3.5 text-red-500" />
          <p className="text-xs font-medium text-red-500">{error}</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-red-500"
            >
              <BadgeAlert className="h-3.5 w-3.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Multi-file list */}
      {uploadedFiles.length > 0 &&
        (maxFiles > 1 || !uploadedFiles[0].preview) && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Uploaded files ({uploadedFiles.length}/{maxFiles})
            </p>
            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  {uploadedFile.preview ? (
                    <img
                      width={48}
                      height={48}
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ImagePlus className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile.id);
                    }}
                    disabled={disabled}
                    aria-label="Remove file"
                    className="shrink-0 cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default SettingsImageUpload;
