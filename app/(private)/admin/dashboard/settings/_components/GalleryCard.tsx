"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Images, Plus, Trash2 } from "lucide-react";
import { FieldArrayWithId } from "react-hook-form";
import { SettingsCard } from "./SettingsCard";
import SettingsImageUpload from "./SettingsImageUpload";
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
    <SettingsCard
      icon={Images}
      title="Gallery"
      description="Curated images shown in the app gallery. Add or remove as needed."
      action={
        <Button
          type="button"
          size="sm"
          onClick={addGallerySlot}
          className="cursor-pointer rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
        >
          <Plus className="size-4" />
          Add Image
        </Button>
      }
    >
      {galleryFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Images className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              No gallery images yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click &quot;Add Image&quot; to add your first gallery image.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {galleryFields.map((field, index) => {
            const slot = gallerySlots[index] || emptySlot(index);

            return (
              <div
                key={field.id}
                className="group flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
              >
                {/* Card header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Images className="size-4" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Gallery {index + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGallerySlot(index)}
                    aria-label={`Remove gallery ${index + 1}`}
                    className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Image upload */}
                <SettingsImageUpload
                  accept="image"
                  maxSize={5}
                  maxFiles={1}
                  onFilesChange={(files) => updateSlotFile(index, files)}
                  existingImageUrl={!slot.removedExisting ? slot.existingUrl : ""}
                  onRemoveExisting={() => removeSlotExisting(index)}
                />

                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Title
                  </Label>
                  <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => updateSlotTitle(index, e.target.value)}
                    placeholder={`Gallery ${index + 1}`}
                    className="h-10 w-full rounded-lg border border-border/80 bg-background/50 px-3 text-sm text-foreground shadow-none outline-none transition-all duration-200 placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}
