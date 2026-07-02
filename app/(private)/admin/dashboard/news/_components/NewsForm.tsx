"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import { createNews, updateNews, type NewsFormData } from "@/actions/news/newsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { X } from "lucide-react";

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

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.categories?.[0]?._id || "",
  );
  const [topics, setTopics] = useState<string[]>(initialData?.topics || []);
  const [topicInput, setTopicInput] = useState("");
  const [publishedDate, setPublishedDate] = useState(
    initialData?.publishedDate
      ? new Date(initialData.publishedDate).toISOString().split("T")[0]
      : "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await getCategoryList(1, 100, "");
    if (res?.status) {
      setCategoryOptions(res.data.categories || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required."); return; }
    if (!description.trim()) { setError("Description is required."); return; }
    if (!selectedCategory) { setError("A category is required."); return; }
    if (!publishedDate) { setError("Published date is required."); return; }

    setLoading(true);
    setError("");

    try {
      const data: NewsFormData = {
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        categories: [selectedCategory],
        topics,
        publishedDate: new Date(publishedDate).toISOString(),
      };

      const res = isEdit
        ? await updateNews(initialData!._id, data)
        : await createNews(data);

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || `News ${isEdit ? "updated" : "created"} successfully!`,
        });
        router.push("/admin/dashboard/news");
      } else {
        setError(res?.message || `Failed to ${isEdit ? "update" : "create"} news`);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
    }
    setTopicInput("");
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addTopic();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter news title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (error) setError(""); }}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter news description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (error) setError(""); }}
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          placeholder="https://example.com/image.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => { setSelectedCategory(value); if (error) setError(""); }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
            {categoryOptions.length === 0 && (
              <SelectItem value="__none__" disabled>No categories found</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topicInput">Topics</Label>
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

      <div className="space-y-2">
        <Label htmlFor="publishedDate">Published Date</Label>
        <Input
          id="publishedDate"
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />}
          {isEdit ? "Update News" : "Create News"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/dashboard/news">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
