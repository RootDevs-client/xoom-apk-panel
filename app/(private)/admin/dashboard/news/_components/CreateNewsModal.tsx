"use client";

import { getCategoryList } from "@/actions/category/categoryActions";
import { getTopicList } from "@/actions/topic/topicActions";
import { createNews, type NewsFormData } from "@/actions/news/newsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import FileUploadComponent from "@/components/custom/FileUploadComponent";
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
import { uploadSingleFile } from "@/lib/fileUpload";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ImSpinner9 } from "react-icons/im";
import { ChevronDown, X } from "lucide-react";

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
  const [topicOptions, setTopicOptions] = useState<
    { _id: string; name: string }[]
  >([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [publishedDate, setPublishedDate] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUploading, setIconUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (open) {
      loadCategories();
      loadTopics();
    }
  }, [open]);

  const loadCategories = async () => {
    const res = await getCategoryList(1, 100, "");
    if (res?.status) {
      setCategoryOptions(res.data.categories || []);
    }
  };

  const loadTopics = async () => {
    const res = await getTopicList(1, 100, "");
    if (res?.status) {
      setTopicOptions(res.data.topics || []);
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
      let imageUrl: string | undefined;
      let iconUrl: string | undefined;

      if (imageFile) {
        setImageUploading(true);
        const uploaded = await uploadSingleFile(imageFile);
        if (uploaded?.url) {
          imageUrl = uploaded.url;
        } else {
          setError("Failed to upload image");
          setLoading(false);
          setImageUploading(false);
          return;
        }
        setImageUploading(false);
      }

      if (iconFile) {
        setIconUploading(true);
        const uploaded = await uploadSingleFile(iconFile);
        if (uploaded?.url) {
          iconUrl = uploaded.url;
        } else {
          setError("Failed to upload icon");
          setLoading(false);
          setIconUploading(false);
          return;
        }
        setIconUploading(false);
      }

      const data: NewsFormData = {
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        icon: iconUrl,
        categories: [selectedCategory],
        topics: selectedTopicIds
          .map((id) => topicOptions.find((t) => t._id === id)?.name)
          .filter((n): n is string => !!n),
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
        setImageFile(null);
        setIconFile(null);
        setSelectedCategory("");
        setSelectedTopicIds([]);
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

  return (
      <Dialog open={open} onOpenChange={(v) => !loading && !imageUploading && !iconUploading && onOpenChange(v)}>
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

            <div className="space-y-1.5">
              <Label>Image</Label>
              <FileUploadComponent
                accept="image"
                maxSize={5}
                maxFiles={1}
                onFilesChange={(files) => setImageFile(files[0] || null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <FileUploadComponent
                accept="image"
                maxSize={5}
                maxFiles={1}
                onFilesChange={(files) => setIconFile(files[0] || null)}
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
              <Label>Topics</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9"
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
              disabled={loading || imageUploading || iconUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || imageUploading || iconUploading}>
              {(loading || imageUploading || iconUploading) && (
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
