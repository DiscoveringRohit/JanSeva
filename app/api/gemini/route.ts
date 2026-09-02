import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Supported Google Gemini models in order of priority for current API key
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
];

async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  promptParts: any[],
  generationConfig: any = {}
) {
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });
      const result = await model.generateContent(promptParts);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} failed, trying next fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate response");
}

function extractJson(text: string): any {
  // Remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try regex extraction of first {...}
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Unable to parse JSON from Gemini vision response");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, image, type = "chat", userContext } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. CHAT MODE (JanSeva Personal Civic Assistant with User Data)
    if (type === "chat" || (!image && message)) {
      if (!message) {
        return NextResponse.json(
          { error: "Message is required" },
          { status: 400 }
        );
      }

      let contextDetails = "";
      if (userContext) {
        contextDetails = `
=== CURRENT USER PROFILE & CIVIC DATA ===
- Name: ${userContext.name || "Citizen"}
- Username: ${userContext.username || "resident"}
- Location: ${userContext.city || "Bhubaneswar"}, PIN Code: ${userContext.pincode || "751030"}
- Civic XP: ${userContext.civicCitizenXP || 100} XP
- Citizen Level: Level ${userContext.level || 1} (${userContext.levelTitle || "Active Citizen"})
- Total Issues Reported: ${userContext.myReportsCount || 0}
- Total Issues Resolved: ${userContext.resolvedCount || 0}
- Badges Unlocked: ${(userContext.badges || []).map((b: any) => typeof b === "string" ? b : b.name).join(", ") || "Ward Pioneer"}
- User's Logged Tickets:
${
  (userContext.myIssues || []).length > 0
    ? (userContext.myIssues || [])
        .map(
          (i: any) =>
            `  * [Ticket #${i.id}] "${i.title}" | Category: ${i.category} | Status: ${i.status} | Urgency: ${i.urgency || "Moderate"} | SLA Target: ~${i.slaHours || 24}h`
        )
        .join("\n")
    : "  * No open grievances currently reported."
}
=========================================
`;
      }

      const prompt = `You are JanSeva AI, the dedicated personal civic AI companion for municipal citizens in India.
${contextDetails}

CORE INSTRUCTIONS:
1. Address the user warmly by their first name ("${userContext?.name ? userContext.name.split(" ")[0] : "Citizen"}").
2. Answer questions specifically using the user's real tickets, SLA timeline, XP score, badges, and PIN code when asked.
3. If they ask about "My Tickets", "My Status", or "Grievances", list their actual tickets from the data above with their current statuses and SLA targets.
4. If they ask about "Ward SLA" or "Resolution Time", explain the municipal SLA matrix (Critical: 12h, High: 24h, Moderate: 48h) and give the current status of their tickets.
5. If they ask about "XP", "Level", or "Badges", provide their exact XP (${userContext?.civicCitizenXP || 100} XP, Level ${userContext?.level || 1}) and explain how reporting/upvoting issues earns more XP.
6. Keep responses clean, concise, polite, and formatted with bullet points for readability.

User Question: ${message}`;

      const reply = await generateWithFallback(
        genAI,
        [prompt],
        {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      );

      return NextResponse.json({ reply });
    }

    // 2. CIVIC IMAGE VERIFICATION MODE (Gemini Vision)
    if (type === "verify-issue" || image) {
      if (!image) {
        return NextResponse.json(
          { error: "Image data is required for verification" },
          { status: 400 }
        );
      }

      // Clean base64 image data
      let base64Data = image;
      let mimeType = "image/jpeg";
      if (image.startsWith("data:")) {
        const parts = image.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      const visionPrompt = `You are the JanSeva Municipal AI Vision Inspector for citizen grievance verification.
Analyze this submitted image according to these 4 verification rules:

1. DEPARTMENT CLASSIFICATION:
   - Identify the municipal department responsible for this defect:
     "Roads", "Sanitation", "Water", "Electricity", "Waste", "Traffic", "Parks", or "Other".

2. IMAGE QUALITY & VISIBILITY:
   - Is the photo visible, clear enough to inspect, and not pitch black, completely blank, or corrupt? ("isValid": boolean)

3. ANTI-SPOOFING / REAL-SCENE CHECK:
   - Is this a photo depicting an outdoor/public environment or real physical infrastructure scene?
   - Set "isRealScene": true for any outdoor road, street, field, drain, or public infrastructure photo.
   - ONLY set "isRealScene": false if there are obvious physical laptop screen bezels, monitor frames, or printed paper borders clearly surrounding the entire image.

4. CIVIC GRIEVANCE VERIFICATION:
   - Does this photo depict ANY public infrastructure defect, damage, hazard, or municipal issue?
     Examples of VALID civic issues: collapsed road, broken culvert/bridge, pothole, road crack/cave-in, overflowing sewage, garbage dump, uncollected waste, hanging electric wire, broken streetlight, leaking pipeline, damaged park/tree hazard, waterlogging, or traffic obstacle.
   - Set "isCivicProblem": true for any of the above infrastructure defects.
   - ONLY set "isCivicProblem": false for personal selfies, indoor bedrooms, pet animals, food dishes, memes, documents, or unrelated private objects.

Return JSON in this exact structure:
{
  "isValid": true,
  "isCivicProblem": true,
  "isRealScene": true,
  "department": "Roads",
  "category": "Roads",
  "title": "Collapsed Road and Damaged Culvert",
  "detectedObject": "Collapsed road embankment crater & broken culvert",
  "urgency": "Critical",
  "estimatedSeverity": "Critical Road & Infrastructure Hazard",
  "suggestedSlaHours": 12,
  "confidence": 98.5,
  "summary": "Verified severe road collapse and culvert damage requiring immediate engineering dispatch.",
  "rejectionReason": null
}

If isCivicProblem is false or isRealScene is false or isValid is false:
Set "isValid": false and provide a user-friendly "rejectionReason" explaining why.`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      const text = await generateWithFallback(
        genAI,
        [visionPrompt, imagePart],
        {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      );

      const parsed = extractJson(text);

      // Auto-reconcile for outdoor infrastructure defects (roads, potholes, culverts, drains, garbage)
      const detectedLower = ((parsed.detectedObject || "") + " " + (parsed.summary || "") + " " + (parsed.title || "")).toLowerCase();
      const isInfraDefect = detectedLower.includes("road") || detectedLower.includes("pothole") || detectedLower.includes("culvert") || detectedLower.includes("drain") || detectedLower.includes("bridge") || detectedLower.includes("water") || detectedLower.includes("garbage") || detectedLower.includes("pipe") || detectedLower.includes("crack") || detectedLower.includes("collapse");

      if (isInfraDefect) {
        parsed.isCivicProblem = true;
        parsed.isRealScene = true;
        parsed.isValid = true;
        parsed.rejectionReason = null;
      } else if (!parsed.isCivicProblem || !parsed.isRealScene || !parsed.isValid) {
        parsed.isValid = false;
        if (!parsed.rejectionReason) {
          parsed.rejectionReason = !parsed.isRealScene
            ? "Photo appears to be captured from a screen. Please submit a direct outdoor photo."
            : "Non-civic photo: Image does not depict a public municipal defect or infrastructure problem.";
        }
      }

      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error: any) {
    console.error("Gemini Vision Route Error:", error);
    return NextResponse.json(
      {
        isValid: false,
        isCivicProblem: false,
        isRealScene: false,
        error: error?.message || "Failed to inspect image with Gemini Vision",
        rejectionReason: "Failed to inspect image. Please verify your internet connection or capture again.",
      },
      { status: 500 }
    );
  }
}