"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import {
  createNews,
  updateNews,
  type NewsFormData,
} from "@/actions/news/newsActions";
import { getTopicList } from "@/actions/topic/topicActions";
import FileUploadComponent from "@/components/custom/FileUploadComponent";
import { ToastMessage } from "@/components/custom/ToastMessage";
import DatePickerField from "@/components/form/DatePickerField";
import InputField from "@/components/form/InputField";
import SunEditorField from "@/components/form/SunEditorField";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadSingleFile } from "@/lib/fileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeAlert, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import { z } from "zod";

// ── Zod schema ────────────────────────────────────────────────────────────────
const newsSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title is too long."),
  description: z
    .string()
    .refine((val) => val.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Description is required.",
    })
    .refine((val) => val.replace(/<[^>]*>/g, "").length <= 5000, {
      message: "Description is too long (max 5000 characters).",
    }),
  category: z.string().min(1, "A category is required."),
  publishedDate: z.string().min(1, "Published date is required."),
});

type NewsFormValues = z.infer<typeof newsSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  mode: "create" | "edit";
  initialData?: {
    _id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    categories: { _id: string; name: string }[];
    topics: string[];
    publishedDate: string;
  };
}

export default function NewsForm({ mode, initialData }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [topicOptions, setTopicOptions] = useState<
    { _id: string; name: string }[]
  >([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<
    { _id: string; name: string }[]
  >([]);

  // ── React Hook Form setup ─────────────────────────────────────────────────
  const methods = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.categories?.[0]?._id || "",
      publishedDate: initialData?.publishedDate || "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getCategoryList(1, 100, "").then((res) => {
      if (res?.status) setCategoryOptions(res.data.categories || []);
    });
  }, []);

  // ── Load topics ──────────────────────────────────────────────────────────
  useEffect(() => {
    getTopicList(1, 100, "").then((res) => {
      if (res?.status) {
        const topics = res.data.topics || [];
        setTopicOptions(topics);
        if (initialData?.topics?.length) {
          const matching = topics
            .filter((t: { name: string }) =>
              initialData.topics.includes(t.name),
            )
            .map((t: { _id: string }) => t._id);
          setSelectedTopicIds(matching);
        }
      }
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: NewsFormValues) => {
    setSubmitting(true);
    setServerError("");

    try {
      let imageUrl = initialData?.image;
      let iconUrl = initialData?.icon;

      if (imageRemoved) {
        imageUrl = undefined;
      } else if (imageFile) {
        setImageUploading(true);
        const uploaded = await uploadSingleFile(imageFile);
        if (uploaded?.url) {
          imageUrl = uploaded.url;
        } else {
          setServerError("Failed to upload image");
          setSubmitting(false);
          setImageUploading(false);
          return;
        }
        setImageUploading(false);
      }

      if (iconRemoved) {
        iconUrl = undefined;
      } else if (iconFile) {
        setIconUploading(true);
        const uploaded = await uploadSingleFile(iconFile);
        if (uploaded?.url) {
          iconUrl = uploaded.url;
        } else {
          setServerError("Failed to upload icon");
          setSubmitting(false);
          setIconUploading(false);
          return;
        }
        setIconUploading(false);
      }

      const data: NewsFormData = {
        title: values.title.trim(),
        description: values.description.trim(),
        image: imageUrl,
        icon: iconUrl,
        categories: [values.category],
        topics: selectedTopicIds
          .map((id) => topicOptions.find((t) => t._id === id)?.name)
          .filter((n): n is string => !!n),
        publishedDate: values.publishedDate,
      };

      const res = isEdit
        ? await updateNews(initialData!._id, data)
        : await createNews(data);

      if (res?.status) {
        ToastMessage.success({
          title:
            res?.message ||
            `News ${isEdit ? "updated" : "created"} successfully!`,
        });
        router.push("/admin/dashboard/news");
      } else {
        setServerError(
          res?.message || `Failed to ${isEdit ? "update" : "create"} news`,
        );
      }
    } catch {
      setServerError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* Title */}
        <InputField<NewsFormValues>
          name="title"
          label="Title"
          placeholder="Enter news title"
          className="h-12!"
          required
        />

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          {/* Category */}
          <div className="space-y-1">
            <Label className="text-sm font-dm-sans font-medium">
              Category <span className="text-red-500 ml-0.5 font-bold">*</span>
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full h-11! ${errors.category ? "border-red-400" : ""}`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {categoryOptions.length === 0 && (
                      <SelectItem value="__none__" disabled>
                        No categories found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <div className="flex items-center gap-1 mt-1">
                <BadgeAlert className="text-red-500 h-4 w-4" />
                <p className="text-red-500 text-xs font-dm-sans font-medium">
                  {errors.category.message}
                </p>
              </div>
            )}
          </div>

          {/* Topics */}
          <div className="space-y-1">
            <Label className="text-sm font-dm-sans font-medium">Topics</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="border-input h-11! data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9"
                >
                  <span className="text-muted-foreground">
                    {selectedTopicIds.length > 0
                      ? `${selectedTopicIds.length} topic${selectedTopicIds.length > 1 ? "s" : ""} selected`
                      : "Select topics"}
                  </span>
                  <ChevronDown className="size-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-full min-w-0 max-h-60 overflow-y-auto"
                align="start"
              >
                {topicOptions.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No topics found
                  </div>
                ) : (
                  topicOptions.map((topic) => {
                    const isSelected = selectedTopicIds.includes(topic._id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={topic._id}
                        checked={isSelected}
                        onCheckedChange={() => {
                          setSelectedTopicIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== topic._id)
                              : [...prev, topic._id],
                          );
                        }}
                      >
                        {topic.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedTopicIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedTopicIds.map((id) => {
                  const topic = topicOptions.find((t) => t._id === id);
                  if (!topic) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {topic.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTopicIds((prev) =>
                            prev.filter((tid) => tid !== id),
                          )
                        }
                        className="inline-flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {/* Published Date */}
          <DatePickerField<NewsFormValues>
            name="publishedDate"
            control={control}
            label="Published Date"
            required
            error={errors.publishedDate}
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {/* Image */}
          <div className="space-y-1.5">
            <Label className="text-sm font-dm-sans font-medium">
              News Image
            </Label>
            <FileUploadComponent
              accept="image"
              maxSize={5}
              maxFiles={1}
              onFilesChange={(files) => setImageFile(files[0] || null)}
              existingImageUrl={!imageRemoved ? initialData?.image || "" : ""}
              onRemoveExisting={() => {
                setImageRemoved(true);
                setImageFile(null);
              }}
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label className="text-sm font-dm-sans font-medium">
              News Icon
            </Label>
            <FileUploadComponent
              accept="image"
              maxSize={5}
              maxFiles={1}
              onFilesChange={(files) => setIconFile(files[0] || null)}
              existingImageUrl={!iconRemoved ? initialData?.icon || "" : ""}
              onRemoveExisting={() => {
                setIconRemoved(true);
                setIconFile(null);
              }}
            />
          </div>
        </div>

        {/* Description */}
        <SunEditorField<NewsFormValues>
          name="description"
          control={control}
          label="Description"
          placeholder="Write your news content here..."
          required
          height="320"
          maxLength={5000}
        />

        {/* Server-side error */}
        {serverError && (
          <div className="flex items-center gap-1">
            <BadgeAlert className="text-red-500 h-4 w-4" />
            <p className="text-red-500 text-sm font-dm-sans">{serverError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting || imageUploading || iconUploading}
            className="text-white"
          >
            {(submitting || imageUploading || iconUploading) && (
              <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
            )}
            {isEdit ? "Update News" : "Create News"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/dashboard/news">Cancel</Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
