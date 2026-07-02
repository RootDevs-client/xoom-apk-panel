"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import { updateNews } from "@/actions/news/newsActions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { X } from "lucide-react";
import { type NewsItem } from "./columns";

interface Props {
  row: NewsItem;
  onSuccess: () => void;
}

export default function EditNewsCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(row.title);
  const [description, setDescription] = useState(row.description);
  const [image, setImage] = useState(row.image || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    row.categories?.[0]?._id || "",
  );
  const [topics, setTopics] = useState<string[]>(row.topics || []);
  const [topicInput, setTopicInput] = useState("");
  const [publishedDate, setPublishedDate] = useState(
    row.publishedDate
      ? new Date(row.publishedDate).toISOString().split("T")[0]
      : "",
  );

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
      const res = await updateNews(row._id, {
        title: title.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        categories: [selectedCategory],
        topics,
        publishedDate: new Date(publishedDate).toISOString(),
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "News updated successfully!",
        });
        setOpen(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to update news");
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
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={() => {
          setTitle(row.title);
          setDescription(row.description);
          setImage(row.image || "");
          setSelectedCategory(row.categories?.[0]?._id || "");
          setTopics(row.topics || []);
          setTopicInput("");
          setPublishedDate(
            row.publishedDate
              ? new Date(row.publishedDate).toISOString().split("T")[0]
              : "",
          );
          setError("");
          setOpen(true);
        }}
      >
        <Pencil className="size-3" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit News</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
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
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
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
                <Label htmlFor="edit-topicInput">Topics</Label>
                <Input
                  id="edit-topicInput"
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
                <Label htmlFor="edit-publishedDate">Published Date</Label>
                <Input
                  id="edit-publishedDate"
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
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
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
