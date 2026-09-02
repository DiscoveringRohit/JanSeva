// Multilingual Web Speech API Service for JanSeva Civic Grievances & AI Chatbot
// Supports browser SpeechRecognition with language locale mapping (en-IN, hi-IN, or-IN, bn-IN, etc.)

export const SPEECH_LANG_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  or: "or-IN", // Odia
  bn: "bn-IN", // Bengali
  as: "as-IN", // Assamese
  gu: "gu-IN", // Gujarati
  mr: "mr-IN", // Marathi
  ta: "ta-IN", // Tamil
  te: "te-IN", // Telugu
  kn: "kn-IN", // Kannada
  ml: "ml-IN", // Malayalam
  pa: "pa-IN", // Punjabi
  ur: "ur-IN", // Urdu
};

export interface SpeechRecognitionOptions {
  language?: string; // Language code, e.g. "hi", "or", "en"
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognizer(options: SpeechRecognitionOptions) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    options.onError?.("Speech recognition is not supported in this browser. Please type manually or use Chrome/Edge.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = SPEECH_LANG_MAP[options.language || "en"] || "en-IN";

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    const fullText = (finalTranscript + interimTranscript).trim();
    if (fullText) {
      options.onResult(fullText, false);
    }
  };

  recognition.onerror = (event: any) => {
    let err = "Speech recognition error";
    if (event.error === "no-speech") {
      err = "No speech detected. Please try speaking into your microphone again.";
    } else if (event.error === "audio-capture") {
      err = "No microphone found. Please check your audio hardware settings.";
    } else if (event.error === "not-allowed") {
      err = "Microphone permission denied. Please allow microphone access in browser settings.";
    }
    console.warn("WebSpeech recognition error:", event.error);
    options.onError?.(err);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  return recognition;
}

export function speakText(text: string, language: string = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[language] || "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
}
