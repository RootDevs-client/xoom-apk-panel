import { asyncFormDataHandler } from "@/lib/async-formdata-handler";
import { apiResponse, uploadImage } from "@/lib/server.utils";

export const POST = asyncFormDataHandler(
  null,
  async (req, data, formData) => {
    const file = formData.get("file") as File | null;
    if (!file) {
      return apiResponse(false, 400, "File is required!");
    }
    console.log("file", file);
    console.log("file name", file?.name);
    console.log("file size", file?.size);

    const result = await uploadImage(file);
    console.log("result,user-select-allow-file", result);
    return apiResponse(true, 200, "File uploaded successfully!", result);
  },
  true,
);
