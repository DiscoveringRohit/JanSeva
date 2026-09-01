"use client";

import { useEffect, useState } from "react";

// Client-side translation cache to avoid duplicate network calls
const memoryCache: Record<string, string> = {};

function getCacheKey(text: string, lang: string): string {
  return `${lang}:::${text.trim()}`;
}

export const translationService = {
  /**
   * Translate a single text string to target language
   */
  async translateText(
    text: string,
    targetLang: string,
    targetLangName?: string
  ): Promise<string> {
    if (!text || !text.trim()) return text;
    if (targetLang === "en") return text;

    const cacheKey = getCacheKey(text, targetLang);
    if (memoryCache[cacheKey]) {
      return memoryCache[cacheKey];
    }

    // Try reading from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`trans_${cacheKey}`);
        if (stored) {
          memoryCache[cacheKey] = stored;
          return stored;
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLang,
          targetLangName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translatedText || text;
        if (translated && translated !== text) {
          memoryCache[cacheKey] = translated;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`trans_${cacheKey}`, translated);
            } catch {}
          }
          return translated;
        }
      }
    } catch (err) {
      console.warn("Server translation route failed, trying direct translation engine:", err);
    }

    // Direct browser fallback to Google Translate engine
    try {
      const GOOGLE_LANG_MAP: Record<string, string> = {
        en: "en", hi: "hi", or: "or", bn: "bn", ta: "ta", te: "te",
        mr: "mr", gu: "gu", kn: "kn", ml: "ml", pa: "pa", as: "as",
        ur: "ur", sa: "sa", ne: "ne", mai: "mai", sd: "sd", ks: "ks",
        kok: "gom", doi: "doi", mni: "mni-Mtei", brx: "brx", sat: "sat",
      };
      const gLang = GOOGLE_LANG_MAP[targetLang] || targetLang;
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${gLang}&dt=t&q=${encodeURIComponent(text)}`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const data = await gRes.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map((s: any) => s[0]).filter(Boolean).join("");
          if (translated) {
            memoryCache[cacheKey] = translated;
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(`trans_${cacheKey}`, translated);
              } catch {}
            }
            return translated;
          }
        }
      }
    } catch (directErr) {
      console.warn("Direct translation fallback error:", directErr);
    }

    return text;
  },

  /**
   * Translate an array of text strings
   */
  async translateBatch(
    texts: string[],
    targetLang: string
  ): Promise<string[]> {
    if (!texts || texts.length === 0 || targetLang === "en") return texts;

    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];
    const results: string[] = [...texts];

    texts.forEach((txt, idx) => {
      const key = getCacheKey(txt, targetLang);
      if (memoryCache[key]) {
        results[idx] = memoryCache[key];
      } else {
        uncachedIndices.push(idx);
        uncachedTexts.push(txt);
      }
    });

    if (uncachedTexts.length === 0) {
      return results;
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: uncachedTexts,
          targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.translatedTexts)) {
          data.translatedTexts.forEach((translated: string, i: number) => {
            const originalIndex = uncachedIndices[i];
            const originalText = uncachedTexts[i];
            const key = getCacheKey(originalText, targetLang);
            memoryCache[key] = translated;
            results[originalIndex] = translated;
          });
        }
      }
    } catch (err) {
      console.warn("Batch translation error:", err);
    }

    return results;
  },
};

/**
 * React hook that automatically translates dynamic text to active language
 */
export function useAutoTranslate(text: string, activeLanguage: string, languageName?: string) {
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text || activeLanguage === "en") {
      setTranslated(text);
      return;
    }

    const key = getCacheKey(text, activeLanguage);
    if (memoryCache[key]) {
      setTranslated(memoryCache[key]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    translationService
      .translateText(text, activeLanguage, languageName)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, activeLanguage, languageName]);

  return { translated, isLoading };
}
