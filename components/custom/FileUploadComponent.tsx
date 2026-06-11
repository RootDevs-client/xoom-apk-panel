"use client";

import { BadgeAlert, Check, File, Upload, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
// types
interface FileUploadProps {
  accept?: "image" | "file" | string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  existingImageUrl?: string; // For edit mode
  onRemoveExisting?: () => void; // Callback when existing image is removed
  error?: string;
  required?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

const IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

// Utility functions
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

const FileUploadComponent = ({
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
}: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showExistingImage, setShowExistingImage] = useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset existing image display when existingImageUrl changes
  useEffect(() => {
    setShowExistingImage(!!existingImageUrl);
  }, [existingImageUrl]);

  const isUploadDisabled = disabled || uploadedFiles.length >= maxFiles;

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `${file.name} exceeds ${maxSize}MB limit`;
    }

    // Type validation
    if (accept === "image") {
      if (!isImageFile(file)) {
        return `${file.name} is not an image file`;
      }
      if (!isAllowedImageType(file)) {
        return `${file.name}  must be PNG, JPG, JPEG, or SVG`;
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
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
          continue;
        }

        const preview = await generatePreview(file);
        validUploads.push({
          file,
          preview,
          id: crypto.randomUUID(),
        });
      }

      if (validUploads.length > 0) {
        // Hide existing image when new file is uploaded
        setShowExistingImage(false);
        const updatedFiles = [...uploadedFiles, ...validUploads];
        setUploadedFiles(updatedFiles);
        // IMPORTANT: Call onFilesChange here with the new files

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

    // Show existing image again if no new files
    if (newFiles.length === 0 && existingImageUrl) {
      setShowExistingImage(true);
    }
  };
  const removeExistingImage = () => {
    setShowExistingImage(false);
    onRemoveExisting?.();
  };

  const openFileDialog = () => {
    if (!isUploadDisabled) {
      inputRef.current?.click();
    }
  };
  // Show existing image (edit mode)
  if (
    maxFiles === 1 &&
    showExistingImage &&
    existingImageUrl &&
    uploadedFiles.length === 0
  ) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={existingImageUrl}
            alt="Current image"
            width={100}
            height={100}
            className="w-full h-48 object-cover"
          />

          {/* Overlay with delete button */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <p className="font-medium text-sm">Current Image</p>
                <p className="text-xs opacity-90">Click to replace</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeExistingImage();
                }}
                disabled={disabled}
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 shrink-0"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Replace button */}
        {/* <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className="mt-2 w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Replace Image
        </button> */}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={getAcceptString(accept)}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    );
  }

  // Single file mode with NEW image preview
  if (maxFiles === 1 && uploadedFiles.length > 0 && uploadedFiles[0].preview) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={uploadedFiles[0].preview}
            alt={uploadedFiles[0].file.name}
            width={100}
            height={100}
            className="w-full h-48 object-cover"
          />

          {/* Overlay with file info and delete button */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <p className="font-medium text-sm truncate">
                  {uploadedFiles[0].file.name}
                </p>
                <p className="text-xs opacity-90">
                  {formatFileSize(uploadedFiles[0].file.size)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(uploadedFiles[0].id);
                }}
                disabled={disabled}
                type="button"
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone - Hidden when single file uploaded */}

      <div
        className={`relative border-2 border-dashed rounded-lg h-48 p-8 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${
          isUploadDisabled
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "cursor-pointer hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
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

        <div className="flex flex-col items-center gap-2">
          <div
            className={`p-3 rounded-full ${
              dragActive ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                dragActive ? "text-blue-500" : "text-gray-400"
              }`}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept === "image" ? "Images only" : "Any file type"} • Max{" "}
              {maxSize}MB • Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center mt-2 gap-1">
          <BadgeAlert className="text-red-500 h-4 w-4" />
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((error, idx) => (
            <div
              key={idx}
              className="text-sm text-red-600 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List (for multiple files or non-image single file) */}
      {uploadedFiles.length > 0 &&
        (maxFiles > 1 || !uploadedFiles[0].preview) && (
          <div className={`${isUploadDisabled ? "" : "mt-4"} space-y-2`}>
            <p className="text-sm font-medium text-gray-700">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </p>
            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Preview or Icon */}
                  <div className="shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        width={48}
                        height={48}
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <File className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>

                  {/* Success Icon */}
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadedFile.id);
                    }}
                    disabled={disabled}
                    className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default FileUploadComponent;
