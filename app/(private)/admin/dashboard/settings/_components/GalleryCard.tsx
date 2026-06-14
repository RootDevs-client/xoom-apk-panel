"use client";

import FileUploadComponent from "@/components/custom/FileUploadComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Images, Plus, Trash2 } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";
import { GallerySlot } from "./types";

function emptySlot(index: number): GallerySlot {
  return {
    title: `Gallery ${index + 1}`,
    existingUrl: "",
    newFile: null,
    removedExisting: false,
  };
}

interface GalleryCardProps {
  galleryFields: FieldArrayWithId<any, "galleries", "id">[];
  gallerySlots: GallerySlot[];
  addGallerySlot: () => void;
  removeGallerySlot: (index: number) => void;
  updateSlotTitle: (index: number, title: string) => void;
  updateSlotFile: (index: number, files: File[]) => void;
  removeSlotExisting: (index: number) => void;
}

export function GalleryCard({
  galleryFields,
  gallerySlots,
  addGallerySlot,
  removeGallerySlot,
  updateSlotTitle,
  updateSlotFile,
  removeSlotExisting,
}: GalleryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Images className="h-4 w-4 text-primary" />
            Gallery
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGallerySlot}
            className="flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        </CardTitle>
        <CardDescription>
          Images shown in the app gallery. Add or remove as needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {galleryFields.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No gallery images yet. Click &quot;Add Image&quot; to add one.
          </p>
        )}

        {galleryFields.map((field, index) => {
          const slot = gallerySlots[index] || emptySlot(index);

          return (
            <div
              key={field.id}
              className="flex flex-col gap-4 border rounded-md p-3 relative"
            >
              {/* Remove slot button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGallerySlot(index)}
                className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              {/* Title */}
              <div className="space-y-1.5 pr-8">
                <Label>Gallery {index + 1} Title</Label>
                <input
                  type="text"
                  value={slot.title}
                  onChange={(e) => updateSlotTitle(index, e.target.value)}
                  placeholder={`Gallery ${index + 1}`}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <Label>Image</Label>
                <FileUploadComponent
                  accept="image"
                  maxSize={5}
                  maxFiles={1}
                  onFilesChange={(files) => updateSlotFile(index, files)}
                  existingImageUrl={
                    !slot.removedExisting ? slot.existingUrl : ""
                  }
                  onRemoveExisting={() => removeSlotExisting(index)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
