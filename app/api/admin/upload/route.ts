import { asyncFormDataHandler } from "@/lib/async-formdata-handler";
import { uploadToS3 } from "@/lib/s3";
import { apiResponse } from "@/lib/server.utils";

export const POST = asyncFormDataHandler(
  null,
  async (req, data, formData) => {
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiResponse(false, 400, "File is required!");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToS3(buffer, file.name, file.type);
    return apiResponse(true, 200, "File uploaded successfully!", result);
  },
  true,
);
