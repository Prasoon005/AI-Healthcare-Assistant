import { buildProfileContext } from "./analysis.service";
import { findProfileByUserId } from "../repositories/profile.repository";
import { getUserVitalLogsInRange } from "../repositories/vital.repository";
import {
  findAnalysesByUserInRange,
  findRecentAnalysesByUser,
} from "../repositories/analysis.repository";
import { getUserMedications } from "../repositories/medication.repository";
import { findDocumentsByIds } from "../repositories/document.repository";
import { calculateRiskMatrix } from "./risk.service";
import {
  answerReportQuestion as callReportQA,
  generateComprehensiveReport,
} from "./ai.service";
import { redactDrugNames } from "../utils/medicalSafety";
import {
  createHealthReport,
  createReportQuestion,
  findLatestReportByUser,
  findLatestReportSummaryByUser,
  findReportById,
  findReportOwnedByUser,
  findReportsByUser,
} from "../repositories/report.repository";
import type {
  FollowUpAnswerInput,
  GenerateReportInput,
  ReportContent,
  ReportRange,
} from "../validations/report.validation";

const RANGE_DAYS: Record<Exclude<ReportRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const REPORT_RANGE_LABELS: Record<ReportRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

const resolvePeriod = (range: ReportRange) => {
  const periodEnd = new Date();

  if (range === "all") {
    return { periodStart: null as Date | null, periodEnd };
  }

  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - RANGE_DAYS[range]);

  return { periodStart, periodEnd };
};

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

/* ============================================================
   VITALS SUMMARY (deterministic stats, no AI involved)
============================================================ */

interface MetricSummary {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  latest: number | null;
  latestAt: string | null;
}

const summarizeMetric = (
  points: { value: number | null; recordedAt: Date }[]
): MetricSummary => {
  const readings = points.filter(
    (point): point is { value: number; recordedAt: Date } =>
      point.value !== null && point.value !== undefined
  );

  if (readings.length === 0) {
    return {
      count: 0,
      avg: null,
      min: null,
      max: null,
      latest: null,
      latestAt: null,
    };
  }

  const values = readings.map((reading) => reading.value);
  const latest = readings[0]; // pre-sorted newest first by the caller's query

  return {
    count: readings.length,
    avg:
      Math.round(
        (values.reduce((sum, value) => sum + value, 0) / values.length) * 10
      ) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: latest.value,
    latestAt: latest.recordedAt.toISOString(),
  };
};

type VitalLogs = Awaited<ReturnType<typeof getUserVitalLogsInRange>>;

const buildVitalsSummary = (logs: VitalLogs) => ({
  recordCount: logs.length,
  heartRate: summarizeMetric(
    logs.map((log) => ({ value: log.heartRate, recordedAt: log.recordedAt }))
  ),
  systolic: summarizeMetric(
    logs.map((log) => ({ value: log.systolic, recordedAt: log.recordedAt }))
  ),
  diastolic: summarizeMetric(
    logs.map((log) => ({ value: log.diastolic, recordedAt: log.recordedAt }))
  ),
  spo2: summarizeMetric(
    logs.map((log) => ({ value: log.spo2, recordedAt: log.recordedAt }))
  ),
});

const describeMetric = (label: string, metric: MetricSummary, unit: string) =>
  metric.count === 0
    ? `${label}: no readings in this period.`
    : `${label}: latest ${metric.latest}${unit}, average ${metric.avg}${unit}, range ${metric.min}-${metric.max}${unit} across ${metric.count} reading(s).`;

const buildVitalsTextContext = (summary: ReturnType<typeof buildVitalsSummary>) =>
  [
    describeMetric("Heart rate", summary.heartRate, " bpm"),
    describeMetric("Systolic blood pressure", summary.systolic, " mmHg"),
    describeMetric("Diastolic blood pressure", summary.diastolic, " mmHg"),
    describeMetric("Blood oxygen (SpO2)", summary.spo2, "%"),
  ].join("\n");

/* ============================================================
   ANALYSIS HISTORY SUMMARY
============================================================ */

type AnalysesList = Awaited<ReturnType<typeof findAnalysesByUserInRange>>;

const extractSummaryText = (aiResult: unknown) =>
  typeof aiResult === "object" && aiResult !== null && "summary" in aiResult
    ? String((aiResult as { summary: unknown }).summary)
    : "";

const buildAnalysesSummary = (analyses: AnalysesList) =>
  analyses.map((entry) => ({
    id: entry.id,
    concern: truncate(entry.concern, 150),
    duration: entry.duration,
    severity: entry.severity,
    urgencyLevel: entry.urgencyLevel,
    summary: truncate(extractSummaryText(entry.aiResult), 300),
    createdAt: entry.createdAt.toISOString(),
  }));

const buildAnalysesHistoryContext = (analyses: AnalysesList) => {
  if (analyses.length === 0) {
    return "No health analyses on record for this period.";
  }

  return analyses
    .map(
      (entry, index) =>
        `${index + 1}. [${entry.createdAt.toISOString().slice(0, 10)}] Concern: "${truncate(
          entry.concern,
          120
        )}" | Urgency: ${entry.urgencyLevel} | Summary: "${truncate(
          extractSummaryText(entry.aiResult),
          200
        )}"`
    )
    .join("\n");
};

/* ============================================================
   MEDICATIONS SUMMARY
============================================================ */

type Medications = Awaited<ReturnType<typeof getUserMedications>>;

const buildMedicationsSummary = (medications: Medications) =>
  medications.map((med) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    instructions: med.instructions,
  }));

const buildMedicationsContext = (medications: Medications) => {
  if (medications.length === 0) {
    return "No current medications on record.";
  }

  return medications
    .map(
      (med) =>
        `- ${med.name}, ${med.dosage}${
          med.instructions ? ` (${med.instructions})` : ""
        }`
    )
    .join("\n");
};

/* ============================================================
   DOCUMENTS SUMMARY (reuses the existing Medical Vault/OCR pipeline -
   only the documents the user explicitly attached to this report)
============================================================ */

type Documents = Awaited<ReturnType<typeof findDocumentsByIds>>;

const buildDocumentsSummary = (documents: Documents) =>
  documents.map((doc) => ({
    id: doc.id,
    name: doc.originalName,
    mimeType: doc.mimeType,
    hasExtractedText: !!doc.extractedText?.trim(),
    createdAt: doc.createdAt.toISOString(),
  }));

const buildDocumentsContext = (documents: Documents) => {
  if (documents.length === 0) {
    return "No medical/test documents were attached to this report.";
  }

  return documents
    .map((doc) => {
      const extracted = doc.extractedText?.trim();

      return `- "${doc.originalName}" (uploaded ${doc.createdAt
        .toISOString()
        .slice(0, 10)}): ${
        extracted
          ? `extracted text: "${truncate(extracted, 800)}"`
          : "no text could be extracted from this document (OCR found nothing usable) - do not invent its contents."
      }`;
    })
    .join("\n\n");
};

/* ============================================================
   WELLNESS SNAPSHOT (reuses the existing risk-matrix service, no
   new score is invented here)
============================================================ */

const buildWellnessTextContext = (
  risk: Awaited<ReturnType<typeof calculateRiskMatrix>>
) => {
  if (!risk.available) {
    return "Not enough profile data was available to compute a wellness indicator.";
  }

  const items = risk.items
    .map((item) => `${item.label}: ${item.level} (${item.description})`)
    .join("\n");

  return `Overall wellness indicator: ${risk.overallWellnessScore}/100 (higher is better; this is an existing lifestyle-based signal, not a medical score - report it as-is, do not recompute or reinterpret it).\n${items}`;
};

/* ============================================================
   ADAPTIVE FOLLOW-UP QUESTIONS
============================================================ */

export interface FollowUpQuestionOption {
  value: string;
  label: string;
}

export interface FollowUpQuestion {
  questionId: string;
  type: "medication" | "concern";
  refId: string;
  refLabel: string;
  prompt: string;
  options: FollowUpQuestionOption[];
}

export type StoredFollowUpAnswer = FollowUpAnswerInput & {
  answeredAt: string;
  // Embedded so History (Phase 12) can still label this event correctly
  // even if the underlying medication/analysis is later deleted.
  refLabel: string;
};

const MEDICATION_OPTIONS: FollowUpQuestionOption[] = [
  { value: "completed", label: "Completed" },
  { value: "still_taking", label: "Still taking" },
  { value: "stopped_early", label: "Stopped early" },
  { value: "not_sure", label: "Not sure" },
];

const CONCERN_OPTIONS: FollowUpQuestionOption[] = [
  { value: "resolved", label: "Resolved" },
  { value: "improved", label: "Improved" },
  { value: "still_present", label: "Still present" },
  { value: "worse", label: "Worse" },
  { value: "not_sure", label: "Not sure" },
];

export const getFollowUpQuestions = async (
  userId: string
): Promise<FollowUpQuestion[]> => {
  const [medications, recentAnalyses, lastReport] = await Promise.all([
    getUserMedications(userId),
    findRecentAnalysesByUser(userId, 10),
    findLatestReportByUser(userId),
  ]);

  const lastAnswers =
    (lastReport?.followUpAnswers as unknown as StoredFollowUpAnswer[] | null) ??
    [];

  const questions: FollowUpQuestion[] = [];

  for (const med of medications) {
    const lastAnswer = lastAnswers.find(
      (answer) => answer.type === "medication" && answer.refId === med.id
    );

    // Medication and condition status are tracked separately - a medication
    // marked "completed"/"stopped early" is a terminal medication-course
    // answer, it does not imply the underlying concern is resolved.
    if (
      lastAnswer &&
      (lastAnswer.status === "completed" || lastAnswer.status === "stopped_early")
    ) {
      continue;
    }

    questions.push({
      questionId: `medication:${med.id}`,
      type: "medication",
      refId: med.id,
      refLabel: `${med.name} (${med.dosage})`,
      prompt: `Have you completed "${med.name}"?`,
      options: MEDICATION_OPTIONS,
    });
  }

  const nonRoutine = recentAnalyses.filter(
    (analysis) => analysis.urgencyLevel !== "routine"
  );
  const candidates =
    nonRoutine.length > 0 ? nonRoutine.slice(0, 5) : recentAnalyses.slice(0, 1);

  for (const analysis of candidates) {
    const lastAnswer = lastAnswers.find(
      (answer) => answer.type === "concern" && answer.refId === analysis.id
    );

    if (lastAnswer && lastAnswer.status === "resolved") {
      continue;
    }

    const shortConcern = truncate(analysis.concern, 80);

    questions.push({
      questionId: `concern:${analysis.id}`,
      type: "concern",
      refId: analysis.id,
      refLabel: shortConcern,
      prompt: `Is "${shortConcern}" still present?`,
      options: CONCERN_OPTIONS,
    });
  }

  return questions;
};

const buildFollowUpContext = (
  answers: StoredFollowUpAnswer[],
  medications: Medications,
  analyses: Awaited<ReturnType<typeof findRecentAnalysesByUser>>
) => {
  if (answers.length === 0) {
    return "The user did not answer any follow-up questions this time.";
  }

  return answers
    .map((answer) => {
      if (answer.type === "medication") {
        const med = medications.find((item) => item.id === answer.refId);
        return `- Medication "${med?.name ?? "unknown"}": user reports status = ${answer.status}`;
      }

      const analysis = analyses.find((item) => item.id === answer.refId);
      return `- Previous concern "${truncate(
        analysis?.concern ?? "unknown",
        100
      )}": user reports status = ${answer.status}`;
    })
    .join("\n");
};

/* ============================================================
   AI REPORT CONTENT SANITIZATION (defense-in-depth, same pattern as
   the drug-name scrubber already used for Health Analysis)
============================================================ */

const sanitizeReportContent = (content: ReportContent): ReportContent => ({
  patientOverview: redactDrugNames(content.patientOverview),
  profileSummary: redactDrugNames(content.profileSummary),
  healthHistory: redactDrugNames(content.healthHistory),
  previousAnalyses: redactDrugNames(content.previousAnalyses),
  currentHealthStatus: redactDrugNames(content.currentHealthStatus),
  vitalsSummary: redactDrugNames(content.vitalsSummary),
  medicationSummary: redactDrugNames(content.medicationSummary),
  previousConcernsStatus: redactDrugNames(content.previousConcernsStatus),
  medicalDocumentsSummary: redactDrugNames(content.medicalDocumentsSummary),
  currentObservations: redactDrugNames(content.currentObservations),
  persistentConcerns: redactDrugNames(content.persistentConcerns),
  generalWellnessConsiderations: redactDrugNames(
    content.generalWellnessConsiderations
  ),
  suggestedFollowUpTopics: content.suggestedFollowUpTopics.map(redactDrugNames),
  questionsForDoctor: content.questionsForDoctor.map(redactDrugNames),
  disclaimer: redactDrugNames(content.disclaimer),
});

/* ============================================================
   REPORT GENERATION
============================================================ */

const buildReportPrompt = (params: {
  range: ReportRange;
  profileContext: string;
  vitalsContext: string;
  wellnessContext: string;
  medicationsContext: string;
  analysesContext: string;
  documentsContext: string;
  followUpContext: string;
}) => `Generate a comprehensive educational health report for a user of the HealthAI app, covering the period: ${
  REPORT_RANGE_LABELS[params.range]
}.

Use ONLY the real information given below. Do not invent anything not present here.

HEALTH PROFILE:
${params.profileContext}

VITALS (from the selected period):
${params.vitalsContext}

WELLNESS INDICATOR (current, lifestyle-based, not a medical score):
${params.wellnessContext}

CURRENT MEDICATIONS:
${params.medicationsContext}

HEALTH ANALYSIS HISTORY (from the selected period):
${params.analysesContext}

MEDICAL/TEST DOCUMENTS ATTACHED TO THIS REPORT:
${params.documentsContext}

USER FOLLOW-UP ANSWERS (collected just now, about their medications and previous concerns):
${params.followUpContext}

Generate the structured report now, following the required JSON schema exactly.`;

export const generateReport = async (
  userId: string,
  input: GenerateReportInput
) => {
  const { periodStart, periodEnd } = resolvePeriod(input.range);

  const [
    profile,
    vitalLogs,
    analysesInRange,
    recentAnalyses,
    riskMatrix,
    medications,
    documents,
  ] = await Promise.all([
    findProfileByUserId(userId),
    getUserVitalLogsInRange(userId, periodStart, periodEnd),
    findAnalysesByUserInRange(userId, periodStart, periodEnd),
    findRecentAnalysesByUser(userId, 10),
    calculateRiskMatrix(userId),
    getUserMedications(userId),
    findDocumentsByIds(userId, input.documentIds),
  ]);

  const vitalsSummary = buildVitalsSummary(vitalLogs);
  const analysesSummary = buildAnalysesSummary(analysesInRange);
  const medicationsSummary = buildMedicationsSummary(medications);
  const documentsSummary = buildDocumentsSummary(documents);

  const storedFollowUpAnswers: StoredFollowUpAnswer[] = input.followUpAnswers.map(
    (answer) => ({
      ...answer,
      refLabel:
        answer.type === "medication"
          ? medications.find((med) => med.id === answer.refId)?.name ??
            "Medication"
          : truncate(
              recentAnalyses.find((item) => item.id === answer.refId)
                ?.concern ?? "Previous concern",
              100
            ),
      answeredAt: new Date().toISOString(),
    })
  );

  // Analyses considered for the "history/concern status" narrative fall back
  // to recent analyses when the chosen range has none, so a short range
  // doesn't make an otherwise-relevant recent concern disappear from context.
  const analysesForHistory =
    analysesInRange.length > 0 ? analysesInRange : recentAnalyses;

  const prompt = buildReportPrompt({
    range: input.range,
    profileContext: buildProfileContext(profile),
    vitalsContext: buildVitalsTextContext(vitalsSummary),
    wellnessContext: buildWellnessTextContext(riskMatrix),
    medicationsContext: buildMedicationsContext(medications),
    analysesContext: buildAnalysesHistoryContext(analysesForHistory),
    documentsContext: buildDocumentsContext(documents),
    followUpContext: buildFollowUpContext(
      storedFollowUpAnswers,
      medications,
      recentAnalyses
    ),
  });

  const rawContent = await generateComprehensiveReport(prompt);
  const reportContent = sanitizeReportContent(rawContent);

  return createHealthReport(userId, {
    rangeKey: input.range,
    periodStart,
    periodEnd,
    profileSnapshot: profile ? JSON.parse(JSON.stringify(profile)) : undefined,
    vitalsSummary: JSON.parse(JSON.stringify(vitalsSummary)),
    wellnessSnapshot: JSON.parse(JSON.stringify(riskMatrix)),
    analysesSummary: JSON.parse(JSON.stringify(analysesSummary)),
    medicationsSummary: JSON.parse(JSON.stringify(medicationsSummary)),
    documentsSummary: JSON.parse(JSON.stringify(documentsSummary)),
    followUpAnswers: JSON.parse(JSON.stringify(storedFollowUpAnswers)),
    reportContent: JSON.parse(JSON.stringify(reportContent)),
  });
};

export const getReports = async (userId: string) => findReportsByUser(userId);

export const getLatestReport = async (userId: string) =>
  findLatestReportSummaryByUser(userId);

export const getReport = async (userId: string, id: string) => {
  const report = await findReportById(id, userId);

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
};

/* ============================================================
   ASK HEALTHAI ABOUT A REPORT (grounded Q&A, persisted per report)
============================================================ */

const buildReportContentText = (content: ReportContent) =>
  Object.entries(content)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${key}:\n${value.map((item) => `- ${item}`).join("\n")}`
        : `${key}: ${value}`
    )
    .join("\n\n");

export const askReportQuestion = async (
  userId: string,
  reportId: string,
  question: string
) => {
  const report = await findReportOwnedByUser(reportId, userId);

  if (!report) {
    throw new Error("Report not found");
  }

  const contentText = buildReportContentText(
    report.reportContent as unknown as ReportContent
  );

  const prompt = `REPORT CONTENT:
${contentText}

USER QUESTION ABOUT THIS REPORT:
"${question}"

Answer strictly based on the report content above.`;

  const rawResult = await callReportQA(prompt);
  const answer = redactDrugNames(rawResult.answer);

  return createReportQuestion(reportId, { question, answer });
};
