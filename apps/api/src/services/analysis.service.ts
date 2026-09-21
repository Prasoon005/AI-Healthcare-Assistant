import {
  createHealthAnalysis,
  findAnalysisById,
  findLatestAnalysisByUser,
  findRecentAnalysesByUser,
  updateAnalysisFeedback,
} from "../repositories/analysis.repository";
import { findProfileByUserId } from "../repositories/profile.repository";
import { createReminder } from "../repositories/reminder.repository";
import {
  generateHealthInsight,
  generateQuickCheck,
  type ImageInput,
} from "./ai.service";
import {
  containsEmergencyKeyword,
  EMERGENCY_MESSAGE,
  redactDrugNames,
} from "../utils/medicalSafety";
import type {
  AIResult,
  CreateAnalysisInput,
  QuickCheckResult,
} from "../validations/analysis.validation";

const HISTORY_LIMIT = 5;

const DURATION_LABELS: Record<string, string> = {
  less_than_a_day: "Less than a day",
  a_few_days: "A few days",
  about_a_week: "About a week",
  several_weeks: "Several weeks",
  a_month_or_more: "A month or more",
};

const sanitizeAIResult = (result: AIResult): AIResult => ({
  ...result,
  summary: redactDrugNames(result.summary),
  considerations: result.considerations.map(redactDrugNames),
  generalGuidance: result.generalGuidance.map(redactDrugNames),
  selfCareMeasures: result.selfCareMeasures.map(redactDrugNames),
  thingsToMonitor: result.thingsToMonitor.map(redactDrugNames),
  whenToSeekCare: result.whenToSeekCare.map(redactDrugNames),
  questionsForDoctor: result.questionsForDoctor.map(redactDrugNames),
});

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

export const buildProfileContext = (
  profile: Awaited<ReturnType<typeof findProfileByUserId>>
) => {
  if (!profile) {
    return "No health profile information is available for this user.";
  }

  const lines: string[] = [];

  if (profile.age !== null) lines.push(`Age: ${profile.age}`);
  if (profile.gender !== null) lines.push(`Gender: ${profile.gender}`);
  if (profile.height !== null) lines.push(`Height: ${profile.height} cm`);
  if (profile.weight !== null) lines.push(`Weight: ${profile.weight} kg`);
  if (profile.smoking !== null)
    lines.push(`Smokes: ${profile.smoking ? "yes" : "no"}`);
  if (profile.alcohol !== null)
    lines.push(`Drinks alcohol: ${profile.alcohol ? "yes" : "no"}`);
  if (profile.exerciseDays !== null)
    lines.push(`Exercise days per week: ${profile.exerciseDays}`);
  if (profile.sleepHours !== null)
    lines.push(`Average sleep hours: ${profile.sleepHours}`);
  if (profile.allergies) lines.push(`Known allergies: ${profile.allergies}`);
  if (profile.medicalConditions)
    lines.push(`Existing medical conditions: ${profile.medicalConditions}`);
  if (profile.medications)
    lines.push(`Current medications: ${profile.medications}`);

  if (lines.length === 0) {
    return "The user has a health profile but has not filled in any fields yet.";
  }

  return lines.join("\n");
};

type RecentAnalysis = Awaited<
  ReturnType<typeof findRecentAnalysesByUser>
>[number];

const buildHistoryContext = (analyses: RecentAnalysis[]) => {
  if (analyses.length === 0) {
    return "No prior health analyses on record for this user.";
  }

  return analyses
    .map((entry, index) => {
      const summary =
        typeof entry.aiResult === "object" &&
        entry.aiResult !== null &&
        "summary" in entry.aiResult
          ? String((entry.aiResult as { summary: unknown }).summary)
          : "";

      const feedback =
        entry.helpful === true
          ? "user found this helpful"
          : entry.helpful === false
          ? "user found this NOT helpful"
          : "not rated by user";

      return `${index + 1}. [${entry.createdAt.toISOString().slice(0, 10)}] Concern: "${truncate(
        entry.concern,
        100
      )}" | Duration: ${entry.duration} | Severity: ${entry.severity} | Urgency given: ${entry.urgencyLevel} | Prior summary: "${truncate(
        summary,
        150
      )}" | Feedback: ${feedback}`;
    })
    .join("\n");
};

const buildPrompt = (
  input: CreateAnalysisInput,
  profileContext: string,
  hasPhoto: boolean,
  historyContext: string
) => {
  return `A user of the health app has submitted the following health concern for educational analysis.

Health profile (only what the user has provided; treat anything not listed as unknown, do not guess it):
${profileContext}

The user's recent past health analyses, most recent first (background context only - these are NOT confirmed diagnoses; use them only to notice recurring or worsening patterns across visits, and factor in any "NOT helpful" feedback by giving a different angle than before rather than repeating the same guidance):
${historyContext}

Screening answers for THIS new concern:
- Concern: ${input.concern}
- Duration: ${DURATION_LABELS[input.duration] ?? input.duration}
- Severity: ${input.severity}
${
  input.additionalContext
    ? `- Additional context: ${input.additionalContext}`
    : "- Additional context: none provided"
}
${
  hasPhoto
    ? "- The user also attached a photo relevant to this concern (see image)."
    : ""
}

Return educational information in the required JSON schema, for the new concern above.`;
};

export const createAnalysis = async (
  userId: string,
  input: CreateAnalysisInput,
  photo?: ImageInput
) => {
  const profile = await findProfileByUserId(userId);
  const profileContext = buildProfileContext(profile);

  const recentAnalyses = await findRecentAnalysesByUser(
    userId,
    HISTORY_LIMIT
  );
  const historyContext = buildHistoryContext(recentAnalyses);

  const prompt = buildPrompt(input, profileContext, !!photo, historyContext);

  const rawResult = await generateHealthInsight(prompt, photo);
  const aiResult = sanitizeAIResult(rawResult);

  const combinedText = `${input.concern} ${input.additionalContext ?? ""}`;
  const emergencyDetected = containsEmergencyKeyword(combinedText);

  const finalUrgency = emergencyDetected ? "urgent" : aiResult.urgencyLevel;

  const finalResult = emergencyDetected
    ? {
        ...aiResult,
        urgencyLevel: "urgent" as const,
        whenToSeekCare: [
          EMERGENCY_MESSAGE,
          ...aiResult.whenToSeekCare,
        ],
      }
    : aiResult;

  const analysis = await createHealthAnalysis(userId, {
    concern: input.concern,
    duration: input.duration,
    severity: input.severity,
    additionalContext: input.additionalContext ?? null,
    profileSnapshot: profile
      ? JSON.parse(JSON.stringify(profile))
      : undefined,
    aiResult: finalResult,
    urgencyLevel: finalUrgency,
    hasPhoto: !!photo,
  });

  await maybeCreateFollowUpReminder(userId, analysis.id, input.concern, finalUrgency);

  return analysis;
};

/*
 * Auto-creates a follow-up reminder for non-routine analyses. This is an
 * in-app reminder only (no email) - the user marks it done by deleting it.
 */
const maybeCreateFollowUpReminder = async (
  userId: string,
  analysisId: string,
  concern: string,
  urgencyLevel: string
) => {
  if (urgencyLevel !== "soon" && urgencyLevel !== "urgent") return;

  const dueDate = new Date();
  dueDate.setDate(
    dueDate.getDate() + (urgencyLevel === "urgent" ? 1 : 3)
  );

  const title =
    urgencyLevel === "urgent"
      ? `See a doctor about: ${truncate(concern, 80)}`
      : `Follow up about: ${truncate(concern, 80)}`;

  await createReminder(userId, {
    title,
    note: "Created automatically from your health analysis.",
    dueDate,
    analysisId,
  });
};

const buildNeedsMoreInfoResult = (
  urgencyLevel: QuickCheckResult["urgencyLevel"],
  whenToSeekCare: string[]
): QuickCheckResult => ({
  recognized: false,
  needsFullAnalysis: true,
  summary:
    "We need more information to give you a useful educational overview.",
  considerations: [],
  generalGuidance: [],
  whenToSeekCare,
  urgencyLevel,
  disclaimer:
    "This quick check is educational only and does not replace professional medical advice.",
});

export const runQuickCheck = async (
  userId: string,
  symptom: string
): Promise<QuickCheckResult> => {
  if (containsEmergencyKeyword(symptom)) {
    return buildNeedsMoreInfoResult("urgent", [
      EMERGENCY_MESSAGE,
      "Please use Start Health Analysis or contact a healthcare professional for anything more detailed.",
    ]);
  }

  const profile = await findProfileByUserId(userId);
  const profileContext = buildProfileContext(profile);

  const prompt = `A user tapped a "quick symptom check" box on their health dashboard and typed the following, with no other context:

Health profile (only what the user has provided; treat anything not listed as unknown, do not guess it):
${profileContext}

User input: "${symptom}"

Decide if this is common/specific enough for a short educational note, or if it needs a full Health Analysis instead. Respond in the required JSON schema.`;

  const rawResult = await generateQuickCheck(prompt);

  return {
    ...rawResult,
    summary: redactDrugNames(rawResult.summary),
    considerations: rawResult.considerations.map(redactDrugNames),
    generalGuidance: rawResult.generalGuidance.map(redactDrugNames),
    whenToSeekCare: rawResult.whenToSeekCare.map(redactDrugNames),
  };
};

export const getAnalysis = async (userId: string, id: string) => {
  const analysis = await findAnalysisById(id, userId);

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  return analysis;
};

export const getLatestAnalysis = async (userId: string) => {
  return findLatestAnalysisByUser(userId);
};

const HISTORY_LIST_LIMIT = 20;

export const getAnalysisHistory = async (userId: string) => {
  return findRecentAnalysesByUser(userId, HISTORY_LIST_LIMIT);
};

export const submitAnalysisFeedback = async (
  userId: string,
  id: string,
  helpful: boolean
) => {
  const result = await updateAnalysisFeedback(id, userId, helpful);

  if (result.count === 0) {
    throw new Error("Analysis not found");
  }
};
