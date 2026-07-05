import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Topic } from "@/model/Topic";
import { NextRequest } from "next/server";

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const { name } = await req.json();

    if (!name?.trim()) {
      return apiResponse(false, 400, "Topic name is required.");
    }

    const slug = generateSlug(name);

    const exists = await Topic.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }],
    });

    if (exists) {
      return apiResponse(false, 409, "Topic already exists.");
    }

    const topic = await Topic.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!topic) {
      return apiResponse(false, 404, "Topic not found.");
    }

    return apiResponse(true, 200, "Topic updated successfully.", topic);
  },
  true,
);

export const DELETE = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return apiResponse(false, 404, "Topic not found.");
    }

    return apiResponse(true, 200, "Topic deleted successfully.");
  },
  true,
);
