"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/context/app-context";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslator() {
  const { language } = useApp();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Define global initialization callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages:
                "en,hi,bn,as,gu,mr,ta,te,kn,ml,pa,or,ur,sa,ne,kok,mai,doi,mni,brx,sat,sd,ks",
              autoDisplay: false,
              layout:
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
          isInitialized.current = true;
          applyLanguage(language);
        }
      } catch (e) {
        console.warn("Google Translate init error:", e);
      }
    };

    // If script already loaded, initialize directly
    if (window.google?.translate?.TranslateElement && !isInitialized.current) {
      window.googleTranslateElementInit();
    }
  }, []);

  // When language changes in context, translate the whole page
  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const applyLanguage = (lang: string) => {
    if (typeof window === "undefined") return;

    try {
      // 1. Set Google Translate cookies
      const targetVal = `/en/${lang}`;
      document.cookie = `googtrans=${targetVal}; path=/;`;
      document.cookie = `googtrans=${targetVal}; path=/; domain=${window.location.hostname};`;

      // 2. Trigger Google Translate combo box if present
      const selectElem = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;

      if (selectElem) {
        selectElem.value = lang;
        selectElem.dispatchEvent(new Event("change"));
      }
    } catch (err) {
      console.warn("Error applying whole-site language:", err);
    }
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" style={{ display: "none" }} />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
