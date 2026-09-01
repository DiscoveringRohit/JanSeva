import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Language code mapping for Google Translate API compatibility
const GOOGLE_LANG_MAP: Record<string, string> = {
  en: "en",
  hi: "hi",
  or: "or", // Odia
  bn: "bn", // Bengali
  ta: "ta", // Tamil
  te: "te", // Telugu
  mr: "mr", // Marathi
  gu: "gu", // Gujarati
  kn: "kn", // Kannada
  ml: "ml", // Malayalam
  pa: "pa", // Punjabi
  as: "as", // Assamese
  ur: "ur", // Urdu
  sa: "sa", // Sanskrit
  ne: "ne", // Nepali
  mai: "mai", // Maithili
  sd: "sd", // Sindhi
  ks: "ks", // Kashmiri
  kok: "gom", // Konkani
  doi: "doi", // Dogri
  mni: "mni-Mtei", // Manipuri
  brx: "brx", // Bodo
  sat: "sat", // Santali
};

async function translateWithGoogle(text: string, targetLang: string, sourceLang: string = "auto"): Promise<string> {
  const gLang = GOOGLE_LANG_MAP[targetLang] || targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${gLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "*/*",
    },
  });

  if (!res.ok) {
    throw new Error(`Google Translate failed with status ${res.status}`);
  }

  const rawText = await res.text();
  try {
    const data = JSON.parse(rawText);
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedSegments = data[0]
        .filter((seg: any) => seg && typeof seg[0] === "string")
        .map((seg: any) => seg[0]);
      if (translatedSegments.length > 0) {
        return translatedSegments.join("");
      }
    }
  } catch {
    // Regex extraction fallback if Google returns raw unescaped JSON
    const match = rawText.match(/\["([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (match && match[1]) {
      return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
  }

  throw new Error("Invalid response format from Google Translate");
}

async function translateWithGemini(text: string, targetLangName: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Translate the following civic complaint / municipal text accurately and naturally into ${targetLangName}. 
Only return the translated text. Do not add any commentary, quotes, or markdown explanations.

Text to translate:
"""
${text}
"""`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, texts, targetLang, targetLangName, sourceLang = "auto" } = body;

    if (!targetLang) {
      return NextResponse.json({ error: "targetLang is required" }, { status: 400 });
    }

    // Single string translation
    if (typeof text === "string") {
      if (!text.trim() || (targetLang === "en" && (sourceLang === "en" || !sourceLang))) {
        return NextResponse.json({ translatedText: text, success: true });
      }

      try {
        const translated = await translateWithGoogle(text, targetLang, sourceLang);
        return NextResponse.json({ translatedText: translated, engine: "google", success: true });
      } catch (gErr) {
        console.warn("Google Translate error, falling back to Gemini:", gErr);
        if (process.env.GEMINI_API_KEY) {
          try {
            const geminiTranslated = await translateWithGemini(text, targetLangName || targetLang);
            return NextResponse.json({ translatedText: geminiTranslated, engine: "gemini", success: true });
          } catch (geminiErr) {
            console.error("Gemini Translation error:", geminiErr);
          }
        }
        return NextResponse.json({ translatedText: text, fallback: true, success: true });
      }
    }

    // Batch array translation
    if (Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(async (item: string) => {
          if (!item || !item.trim()) return item;
          try {
            return await translateWithGoogle(item, targetLang, sourceLang);
          } catch {
            return item;
          }
        })
      );

      return NextResponse.json({ translatedTexts: results, engine: "google", success: true });
    }

    return NextResponse.json({ error: "text or texts array required" }, { status: 400 });
  } catch (error: any) {
    console.error("Translation route error:", error);
    // Never crash with 500, return original input gracefully
    return NextResponse.json({ translatedText: "", fallback: true, error: error?.message || "Translation error", success: true }, { status: 200 });
  }
}
