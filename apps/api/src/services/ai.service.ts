import { z } from "zod";

import { env } from "../config/env";
import {
  aiResultSchema,
  quickCheckResultSchema,
  type AIResult,
  type QuickCheckResult,
} from "../validations/analysis.validation";

export class AIUnavailableError extends Error {
  constructor(message = "AI service is temporarily unavailable") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export interface ImageInput {
  mimeType: string;
  base64Data: string;
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    considerations: { type: "ARRAY", items: { type: "STRING" } },
    generalGuidance: { type: "ARRAY", items: { type: "STRING" } },
    selfCareMeasures: { type: "ARRAY", items: { type: "STRING" } },
    thingsToMonitor: { type: "ARRAY", items: { type: "STRING" } },
    whenToSeekCare: { type: "ARRAY", items: { type: "STRING" } },
    questionsForDoctor: { type: "ARRAY", items: { type: "STRING" } },
    disclaimer: { type: "STRING" },
    urgencyLevel: {
      type: "STRING",
      enum: ["routine", "soon", "urgent"],
    },
  },
  required: [
    "summary",
    "considerations",
    "generalGuidance",
    "selfCareMeasures",
    "thingsToMonitor",
    "whenToSeekCare",
    "questionsForDoctor",
    "disclaimer",
    "urgencyLevel",
  ],
};

const SYSTEM_INSTRUCTION = `You are an educational health information assistant inside a consumer wellness app.

Rules you must always follow:
- You are NOT a doctor and must never claim to diagnose a disease or condition.
- Never state a diagnosis as certain. Speak in terms of possibilities and general education only.
- Never invent medical history, lab results, vital signs, or medications the user did not provide.
- Never generate fake probability percentages or confidence scores.
- Never recommend starting, stopping, or changing a prescription medication.
- Never claim to be a doctor or licensed medical professional.
- Clearly communicate uncertainty, and encourage the user to consult a qualified healthcare professional for an actual diagnosis or treatment.
- If the description could indicate a medical emergency, set urgencyLevel to "urgent" and say so plainly in whenToSeekCare, directing the person to emergency/professional care rather than trying to manage it yourself.
- Base your response only on the information given. If profile information is missing, do not assume or invent it.
- For selfCareMeasures: give general, non-personalized self-care ideas (e.g. rest, hydration, warm or cold compress, gentle stretching). Where an OTC medication CATEGORY is genuinely relevant to the specific concern, name the category as specifically as you can without naming an actual substance - e.g. for pain say "a pain-relief category product appropriate for you"; for allergies say "an antihistamine category product"; for a cough say "a cough-suppressant or expectorant category product"; for heartburn say "an antacid category product"; for a minor cut or rash say "a topical antiseptic or barrier cream". Under no circumstances name ANY specific drug, brand name, or active ingredient (for example: do not write "acetaminophen", "ibuprofen", "Tylenol", "Advil", "loratadine", "Claritin", or any other named medication) - category names only, never a named substance, and never a dose. Always add that the person should check with a pharmacist or doctor before taking anything new, especially given their existing conditions/medications/allergies if any are listed.
- If a photo is included, treat it only as additional visual context (e.g. a visible rash, swelling, or injury) alongside the text description. Do not claim to diagnose from the image alone, and say plainly if the image is unclear or not useful for the concern described.
- If a past-analysis history section is included, it is background context only, never confirmed diagnoses or current facts - respond to the NEW concern given, using the history only to notice recurring/worsening patterns or to avoid repeating guidance the user already marked unhelpful.
- Respond ONLY with JSON matching the required schema. Keep each list item short and in plain language.`;

const QUICK_CHECK_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    recognized: { type: "BOOLEAN" },
    needsFullAnalysis: { type: "BOOLEAN" },
    summary: { type: "STRING" },
    considerations: { type: "ARRAY", items: { type: "STRING" } },
    generalGuidance: { type: "ARRAY", items: { type: "STRING" } },
    whenToSeekCare: { type: "ARRAY", items: { type: "STRING" } },
    urgencyLevel: {
      type: "STRING",
      enum: ["routine", "soon", "urgent"],
    },
    disclaimer: { type: "STRING" },
  },
  required: [
    "recognized",
    "needsFullAnalysis",
    "summary",
    "considerations",
    "generalGuidance",
    "whenToSeekCare",
    "urgencyLevel",
    "disclaimer",
  ],
};

const QUICK_CHECK_SYSTEM_INSTRUCTION = `You are a lightweight, educational "quick symptom check" inside a consumer wellness app. This is intentionally much shorter and lighter than a full health analysis - it is a triage-style hint, not an assessment.

Rules you must always follow:
- You are NOT a doctor and must never claim to diagnose a disease or condition. Never write things like "you have X".
- Never state a diagnosis as certain, and never generate fake probability percentages or confidence scores.
- Never invent medical history, lab results, vital signs, or medications the user did not provide.
- Never recommend a specific drug, brand name, or active ingredient, and never state a dose. General category wording only if relevant (e.g. "a pain-relief category product").
- Never recommend starting, stopping, or changing a prescription medication, and never claim to be a doctor.
- Set "recognized" to true only if the input is a common, specific-enough symptom you can give a short, safe, general educational note about (e.g. "headache", "sore throat", "mild fatigue", "cough").
- Set "needsFullAnalysis" to true whenever the input is vague, ambiguous, unusual, outside common everyday symptoms, or potentially concerning/urgent - in that case keep "considerations" and "generalGuidance" minimal or empty, and instead make "whenToSeekCare" clearly recommend a full Health Analysis (and professional/emergency care if urgent). Do not fabricate a confident-sounding answer just because the user asked - it is always safe to say more information is needed.
- If the input could indicate a medical emergency, set urgencyLevel to "urgent", needsFullAnalysis to true, and say so plainly in whenToSeekCare.
- Keep this SHORT: at most 2-3 short items per list. This is a quick hint, not a full report.
- Respond ONLY with JSON matching the required schema.`;

const buildPrompt = (systemInstruction: string, userPrompt: string) =>
  `${systemInstruction}\n\n${userPrompt}`;

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

const callGemini = async <T>(
  prompt: string,
  responseSchema: object,
  zodSchema: z.ZodType<T>,
  image?: ImageInput
): Promise<T> => {
  if (!env.GEMINI_API_KEY) {
    console.error("AI SERVICE ERROR: GEMINI_API_KEY is not configured");
    throw new AIUnavailableError();
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const parts: GeminiPart[] = [{ text: prompt }];

  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64Data,
      },
    });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
    });
  } catch (error) {
    console.error(
      "AI SERVICE NETWORK ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );
    throw new AIUnavailableError();
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    console.error(
      "AI SERVICE RESPONSE ERROR:",
      response.status,
      response.statusText,
      bodyText
    );
    throw new AIUnavailableError();
  }

  const payload = await response.json();

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string") {
    console.error("AI SERVICE ERROR: missing text in response");
    throw new AIUnavailableError();
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(text);
  } catch (error) {
    console.error("AI SERVICE ERROR: failed to parse JSON output");
    throw new AIUnavailableError();
  }

  const parsed = zodSchema.safeParse(parsedJson);

  if (!parsed.success) {
    console.error("AI SERVICE ERROR: response failed schema validation");
    throw new AIUnavailableError();
  }

  return parsed.data;
};

export const generateHealthInsight = async (
  userPrompt: string,
  image?: ImageInput
): Promise<AIResult> => {
  return callGemini(
    buildPrompt(SYSTEM_INSTRUCTION, userPrompt),
    RESPONSE_SCHEMA,
    aiResultSchema,
    image
  );
};

export const generateQuickCheck = async (
  userPrompt: string
): Promise<QuickCheckResult> => {
  return callGemini(
    buildPrompt(QUICK_CHECK_SYSTEM_INSTRUCTION, userPrompt),
    QUICK_CHECK_RESPONSE_SCHEMA,
    quickCheckResultSchema
  );
};
