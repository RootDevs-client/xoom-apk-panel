import { uploadFile } from "@/actions/fileUpload/fileUploadActions";

interface UploadResult {
  imageId: string;
  url: string;
}

export async function uploadSingleFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const res = await uploadFile(formData);
  if (res.status && res.data?.url) {
    return {
      imageId: res.data.url,
      url: res.data.url,
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
