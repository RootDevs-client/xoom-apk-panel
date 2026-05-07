// app/api/public/ocr/google/route.ts
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { NextRequest } from "next/server";

// ─── Clean text ──────────────────────────────────────────
function cleanText(text: string): string {
  return text
    .replace(/[.\-\/\\,_|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Google Vision ───────────────────────────────────────
async function extractWithGoogleVision(
  image: string,
  language: string,
): Promise<string> {
  const base64 = image.replace(/^data:.+;base64,/, "");

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: "TEXT_DETECTION" },
              { type: "DOCUMENT_TEXT_DETECTION" },
            ],
            imageContext: { languageHints: [language] },
          },
        ],
      }),
    },
  );

  const data = await res.json();

  // ── log full response ──
  console.log(
    "Google Vision Raw:",
    JSON.stringify(data?.responses?.[0], null, 2),
  );

  if (data?.error) {
    throw new Error(data.error.message);
  }

  // try fullTextAnnotation
  const fullText = data?.responses?.[0]?.fullTextAnnotation?.text?.trim();
  if (fullText) return fullText;

  // fallback to textAnnotations
  const simpleText =
    data?.responses?.[0]?.textAnnotations?.[0]?.description?.trim();
  if (simpleText) return simpleText;

  return "";
}

// ─── Main Route ──────────────────────────────────────────
export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { image, language = "eng" } = body;

  if (!image) {
    return apiResponse(false, 400, "Image is required!");
  }

  if (!process.env.GOOGLE_VISION_API_KEY) {
    return apiResponse(false, 500, "Google Vision API key not configured!");
  }

  let extractedText = "";

  try {
    extractedText = await extractWithGoogleVision(image, language);
  } catch (error: any) {
    console.error("Google Vision error:", error.message);
    return apiResponse(false, 500, error.message || "Google Vision failed!");
  }

  if (!extractedText) {
    return apiResponse(false, 404, "No text found in image!");
  }

  // ── clean ──
  const cleaned = cleanText(extractedText);

  // ── numbers only ──
  const numbers = (cleaned.match(/\d+/g) ?? []).join("");

  // ── emails ──
  const emails = extractedText.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? [];

  // ── phones ──
  const phones =
    extractedText.match(/[+]?[\d\s\-().]{7,}/g)?.map((p: string) => p.trim()) ??
    [];

  return apiResponse(true, 200, "Text extracted successfully!", {
    fullText: cleaned,
    numbers,
    emails,
    phones,
    language,
    engine: "google-vision",
  });
});
