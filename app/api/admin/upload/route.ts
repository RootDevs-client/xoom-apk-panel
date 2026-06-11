import { asyncFormDataHandler } from "@/lib/async-formdata-handler";
import { apiResponse, uploadImage } from "@/lib/server.utils";

export const POST = asyncFormDataHandler(
  null,
  async (req, data, formData) => {
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiResponse(false, 400, "File is required!");
    }

    const result = await uploadImage(file);
    return apiResponse(true, 200, "File uploaded successfully!", result);
  },
  true,
);
