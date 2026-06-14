import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

// ─────────────────────────────────────────────
// Clean OCR text
// ─────────────────────────────────────────────
function cleanText(text: string): string {
  return text
    .replace(/[.\-\/\\,_|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─────────────────────────────────────────────
// Google Vision OCR
// ─────────────────────────────────────────────
async function googleVisionOCR(base64: string): Promise<string> {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    },
  );

  const data = await res.json();

  if (data?.error) {
    throw new Error(data.error.message);
  }

  return (
    data?.responses?.[0]?.fullTextAnnotation?.text ||
    data?.responses?.[0]?.textAnnotations?.[0]?.description ||
    ""
  );
}

// ─────────────────────────────────────────────
// OCR.space fallback
// ─────────────────────────────────────────────
async function ocrSpaceFallback(base64: string): Promise<string> {
  const form = new FormData();

  form.append("base64Image", `data:image/jpeg;base64,${base64}`);
  form.append("language", "eng");
  form.append("apikey", process.env.OCR_SPACE_KEY!);

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  return data?.ParsedResults?.[0]?.ParsedText || "";
}

// ─────────────────────────────────────────────
// Gemini Flash OCR fallback (NEW)
// ─────────────────────────────────────────────
async function geminiFlashOCR(base64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  // curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
  //   -H 'Content-Type: application/json' \
  //   -H 'X-goog-api-key: YOUR_API_KEY' \
  //   -X POST \
  //   -d '{
  //     "contents": [
  //       {
  //         "parts": [
  //           {
  //             "text": "Explain how AI works in a few words"
  //           }
  //         ]
  //       }
  //     ]
  //   }'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Extract all text from this image. Return only raw text.",
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await res.json();
  console.log(data);
  if (data?.error) {
    throw new Error(JSON.stringify(data.error));
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// ─────────────────────────────────────────────
// Main OCR Handler
// ─────────────────────────────────────────────
export const POST = asyncHandler(async (req: NextRequest) => {
  const { image } = await req.json();

  if (!image) {
    return apiResponse(false, 400, "Image is required!");
  }

  const base64 = image.replace(/^data:.+;base64,/, "");

  let extractedText = "";
  let engine = "google-vision";

  // ────────────────
  // 1. Google Vision
  // ────────────────
  try {
    extractedText = await googleVisionOCR(base64);
  } catch (err) {
    console.log("Google Vision failed:", err);
  }

  // ────────────────
  // 2. OCR.space
  // ────────────────
  if (!extractedText || extractedText.trim().length < 3) {
    console.log("Using OCR.space fallback...");
    engine = "ocr-space";

    try {
      extractedText = await ocrSpaceFallback(base64);
    } catch (err) {
      console.log("OCR.space failed:", err);
    }
  }

  // ────────────────
  // 3. Gemini Flash OCR (NEW)
  // ────────────────
  if (!extractedText || extractedText.trim().length < 3) {
    console.log("Using Gemini Flash fallback...");
    engine = "gemini-flash";

    try {
      extractedText = await geminiFlashOCR(base64);
    } catch (err) {
      console.log("Gemini OCR failed:", err);
    }
  }

  // ────────────────
  // No text found — save debug image
  // ────────────────
  if (!extractedText) {
    const filePath = path.join(process.cwd(), "debug", `${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

    return apiResponse(false, 404, "No text found in image!");
  }

  // ────────────────
  // Clean + extract data
  // ────────────────
  const cleaned = cleanText(extractedText);

  const numbers = (cleaned.match(/\d+/g) ?? []).join("");
  const emails = extractedText.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? [];
  const phones =
    extractedText.match(/[+]?[\d\s\-().]{7,}/g)?.map((p) => p.trim()) ?? [];

  // ────────────────
  // Response
  // ────────────────
  return apiResponse(true, 200, "OCR success", {
    fullText: cleaned,
    numbers,
    emails,
    phones,
    engine,
  });
});
