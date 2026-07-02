"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import {
  createNews,
  updateNews,
  type NewsFormData,
} from "@/actions/news/newsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
import SunEditorField from "@/components/form/SunEditorField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeAlert, X } from "lucide-react";
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
  image: z.string().url("Must be a valid URL.").or(z.literal("")).optional(),
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
    categories: { _id: string; name: string }[];
    topics: string[];
    publishedDate: string;
  };
}

export default function NewsForm({ mode, initialData }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Topics are managed outside RHF (tag input)
  const [topics, setTopics] = useState<string[]>(initialData?.topics || []);
  const [topicInput, setTopicInput] = useState("");

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
      image: initialData?.image || "",
      category: initialData?.categories?.[0]?._id || "",
      publishedDate: initialData?.publishedDate
        ? new Date(initialData.publishedDate).toISOString().split("T")[0]
        : "",
    },
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = methods;

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getCategoryList(1, 100, "").then((res) => {
      if (res?.status) setCategoryOptions(res.data.categories || []);
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: NewsFormValues) => {
    setSubmitting(true);
    setServerError("");

    try {
      const data: NewsFormData = {
        title: values.title.trim(),
        description: values.description.trim(),
        image: values.image?.trim() || undefined,
        categories: [values.category],
        topics,
        publishedDate: new Date(values.publishedDate).toISOString(),
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

  // ── Topic tag helpers ─────────────────────────────────────────────────────
  const addTopic = () => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
    }
    setTopicInput("");
  };

  const removeTopic = (index: number) =>
    setTopics(topics.filter((_, i) => i !== index));

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addTopic();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Title */}
        <InputField<NewsFormValues>
          name="title"
          label="Title"
          placeholder="Enter news title"
          required
        />

        {/* Description */}
        <SunEditorField<NewsFormValues>
          name="description"
          control={control}
          label="Description"
          placeholder="Write your news content here..."
          required
          height="320"
        />

        {/* Image URL */}
        <InputField<NewsFormValues>
          name="image"
          label="Image URL"
          placeholder="https://example.com/image.jpg"
        />

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
                  className={`w-full ${errors.category ? "border-red-400" : ""}`}
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
          <Label
            htmlFor="topicInput"
            className="text-sm font-dm-sans font-medium"
          >
            Topics
          </Label>
          <Input
            id="topicInput"
            placeholder="Type a topic and press Enter or Tab"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleTopicKeyDown}
          />
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(idx)}
                    className="inline-flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Published Date */}
        <div className="space-y-1">
          <Label
            htmlFor="publishedDate"
            className="text-sm font-dm-sans font-medium"
          >
            Published Date{" "}
            <span className="text-red-500 ml-0.5 font-bold">*</span>
          </Label>
          <Input
            id="publishedDate"
            type="date"
            {...register("publishedDate")}
            className={
              errors.publishedDate
                ? "border-red-400 focus-visible:ring-red-400"
                : ""
            }
          />
          {errors.publishedDate && (
            <div className="flex items-center gap-1 mt-1">
              <BadgeAlert className="text-red-500 h-4 w-4" />
              <p className="text-red-500 text-xs font-dm-sans font-medium">
                {errors.publishedDate.message}
              </p>
            </div>
          )}
        </div>

        {/* Server-side error */}
        {serverError && (
          <div className="flex items-center gap-1">
            <BadgeAlert className="text-red-500 h-4 w-4" />
            <p className="text-red-500 text-sm font-dm-sans">{serverError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting} className="text-white">
            {submitting && <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />}
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
