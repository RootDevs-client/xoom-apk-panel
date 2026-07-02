import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Category } from "@/model/Category";
import { NextRequest } from "next/server";

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Update Category
export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const { name } = await req.json();

    if (!name?.trim()) {
      return apiResponse(false, 400, "Category name is required.");
    }

    const slug = generateSlug(name);

    const exists = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }],
    });

    if (exists) {
      return apiResponse(false, 409, "Category already exists.");
    }

    const category = await Category.findByIdAndUpdate(
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

    if (!category) {
      return apiResponse(false, 404, "Category not found.");
    }

    return apiResponse(true, 200, "Category updated successfully.", category);
  },
  true,
);

// Delete Category
export const DELETE = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return apiResponse(false, 404, "Category not found.");
    }

    return apiResponse(true, 200, "Category deleted successfully.");
  },
  true,
);
