"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import { createNews, type NewsFormData } from "@/actions/news/newsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FlatpickrInput from "@/components/form/FlatpickrInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateNewsModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    const res = await getCategoryList(1, 100, "");
    if (res?.status) {
      setCategoryOptions(res.data.categories || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!selectedCategory) {
      setError("A category is required.");
      return;
    }
    if (!publishedDate) {
      setError("Published date is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data: NewsFormData = {
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        categories: [selectedCategory],
        topics,
        publishedDate,
      };

      const res = await createNews(data);

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "News created successfully!",
        });
        setTitle("");
        setDescription("");
        setImage("");
        setSelectedCategory("");
        setTopics([]);
        setTopicInput("");
        setPublishedDate("");
        onOpenChange(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to create news");
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
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create News</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter news title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter news description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
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
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  if (error) setError("");
                }}
              >
                <SelectTrigger className="w-full">
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
              <FlatpickrInput
                id="publishedDate"
                value={publishedDate}
                onChange={(v) => {
                  setPublishedDate(v);
                  if (error) setError("");
                }}
                placeholder="Select published date"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && (
                <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
