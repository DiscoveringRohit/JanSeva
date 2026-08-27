import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });

      let contextDetails = "";
      if (userContext) {
        contextDetails = `
=== CURRENT USER PROFILE & CIVIC DATA ===
- Name: ${userContext.name || "Citizen"}
- Username: ${userContext.username || "resident"}
- Location: ${userContext.city || "Bhubaneswar"}, PIN Code: ${userContext.pincode || "835103"}
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const reply = response.text();

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

      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const visionPrompt = `You are the JanSeva Municipal AI Vision Inspector.
Analyze this submitted photo strictly according to these 4 verification rules:

1. DEPARTMENT CLASSIFICATION:
   - Identify the municipal department. Must be one of:
     "Roads", "Sanitation", "Water", "Electricity", "Waste", "Traffic", "Parks", or "Other".

2. IMAGE QUALITY & AUTHENTICITY:
   - Is the image clear, visible, and not completely dark, blurry, blank, or corrupt? ("isValid": boolean)

3. ANTI-SPOOFING / REAL-SCENE CHECK:
   - Is this a genuine real-world physical photo of an outdoor/public environment?
   - If it is a photo of another screen (laptop/phone/monitor/TV display) or a photo of a printed paper/document, set "isRealScene": false.

4. CIVIC GRIEVANCE VERIFICATION:
   - Does this photo ACTUALLY depict a real public infrastructure defect or municipal problem (e.g. pothole, broken road, overflowing sewage, garbage dump, uncollected waste, hanging electric wire, broken streetlight, leaking pipeline, damaged park bench/tree hazard)?
   - If it is a personal selfie, person face, pet/animal, indoor bedroom/furniture, food plate, document, meme, screenshot, or unrelated object, set "isCivicProblem": false.

Return JSON in this exact structure:
{
  "isValid": true,
  "isCivicProblem": true,
  "isRealScene": true,
  "department": "Roads",
  "category": "Roads",
  "title": "Severe Pothole on Road",
  "detectedObject": "Deep asphalt pothole crater",
  "urgency": "Critical" | "High" | "Moderate" | "Low",
  "estimatedSeverity": "High Priority Road Hazard",
  "suggestedSlaHours": 24,
  "confidence": 96.5,
  "summary": "Verified physical road defect requiring asphalt patching squad.",
  "rejectionReason": null
}

If isCivicProblem is false or isRealScene is false or isValid is false:
Set "isValid": false and provide a clear, user-friendly "rejectionReason" in English explaining why the photo was rejected (e.g. "This image appears to be a selfie / screen photo / non-civic scene instead of a public infrastructure problem.").`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([visionPrompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();
      const parsed = JSON.parse(text);

      // Enforce strict gate
      if (!parsed.isCivicProblem || !parsed.isRealScene || !parsed.isValid) {
        parsed.isValid = false;
        if (!parsed.rejectionReason) {
          parsed.rejectionReason = !parsed.isRealScene
            ? "Spoof detected: Photo appears to be captured from a screen or printed image. Please capture a real live photo."
            : "Non-civic photo: This image does not show a public infrastructure defect or municipal grievance.";
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