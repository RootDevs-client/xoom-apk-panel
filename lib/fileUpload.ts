import { uploadFile } from "@/actions/fileUpload/fileUploadActions";

interface UploadResult {
  imageId: string;
  url: string;
}

/**
 * Upload a single file.
 * Passes the raw File to the server action — FormData is built there to avoid
 * Next.js serialization stripping the file contents across the action boundary.
 */
export async function uploadSingleFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const res = await uploadFile(formData);

  if (res.status && res.data?.path) {
    return {
      imageId: res.data.path,
      url: res.data.path,
    };
  }

  return null;
}

/**
 * Upload multiple files sequentially and return all results.
 */
export async function uploadMultipleFiles(
  files: File[],
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (const file of files) {
    const result = await uploadSingleFile(file);
    if (result) results.push(result);
  }
  return results;
}
