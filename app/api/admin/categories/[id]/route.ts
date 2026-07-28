import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
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
    const body = await req.json();
    const { name, icon } = body;

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

    const updateData: Record<string, any> = {
      name: name.trim(),
      slug,
    };

    // Only touch icon if the client explicitly sent it
    // (string = new icon, null = remove icon, key omitted = leave unchanged)
    if (icon !== undefined) {
      updateData.icon = icon;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return apiResponse(false, 404, "Category not found.");
    }

    const updatedCategory = {
      ...(category.toObject ? category.toObject() : category),
      icon: prependAwsBaseUrl(category.icon),
    };

    return apiResponse(
      true,
      200,
      "Category updated successfully.",
      updatedCategory,
    );
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
