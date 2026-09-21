import { findProfileByUserId } from "../repositories/profile.repository";
import { calculateCompletion } from "./profile.service";
import {
  getUserVitalLogs,
  getUserVitalLogsInRange,
} from "../repositories/vital.repository";
import {
  findAnalysesByUserInRange,
  findRecentAnalysesByUser,
} from "../repositories/analysis.repository";
import {
  findAllMedicationsByUser,
  findMedicationLogsByUserInRange,
} from "../repositories/medication.repository";
import {
  findDocumentsByUserInRange,
  getUserDocuments,
} from "../repositories/document.repository";
import { findReportsForHistory } from "../repositories/report.repository";
import {
  REPORT_RANGE_LABELS,
  type StoredFollowUpAnswer,
} from "./report.service";
import { generateHistoryInsight } from "./ai.service";
import { redactDrugNames } from "../utils/medicalSafety";
import type {
  HistoryEventType,
  HistoryQuery,
  HistoryRange,
} from "../validations/history.validation";

const RANGE_DAYS: Record<Exclude<HistoryRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const HISTORY_RANGE_LABELS: Record<HistoryRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

const resolvePeriod = (range: HistoryRange) => {
  const periodEnd = new Date();

  if (range === "all") {
    return { periodStart: null as Date | null, periodEnd };
  }

  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - RANGE_DAYS[range]);

  return { periodStart, periodEnd };
};

const inRange = (iso: string, start: Date | null, end: Date) => {
  const time = new Date(iso).getTime();
  return (!start || time >= start.getTime()) && time <= end.getTime();
};

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const FOLLOWUP_STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  still_taking: "Still taking",
  stopped_early: "Stopped early",
  not_sure: "Not sure",
  resolved: "Resolved",
  improved: "Improved",
  still_present: "Still present",
  worse: "Worse",
};

/* ============================================================
   UNIFIED TIMELINE (derived from existing tables - no new
   "Event" table; every event traces back to a real record)
============================================================ */

export interface HistoryEvent {
  id: string;
  type: Exclude<HistoryEventType, "all">;
  title: string;
  description: string;
  occurredAt: string;
  link: { type: "analysis" | "report" | "document"; id: string } | null;
}

type ProfileRecord = Awaited<ReturnType<typeof findProfileByUserId>>;
type AnalysesList = Awaited<ReturnType<typeof findAnalysesByUserInRange>>;
type ReportsList = Awaited<ReturnType<typeof findReportsForHistory>>;
type VitalLogs = Awaited<ReturnType<typeof getUserVitalLogsInRange>>;
type DocumentsList = Awaited<ReturnType<typeof findDocumentsByUserInRange>>;
type MedicationsList = Awaited<ReturnType<typeof findAllMedicationsByUser>>;

const buildProfileEvents = (profile: ProfileRecord): HistoryEvent[] => {
  if (!profile) return [];

  const events: HistoryEvent[] = [
    {
      id: `profile-created:${profile.id}`,
      type: "profile",
      title: "Health profile created",
      description: "Your health profile was set up.",
      occurredAt: profile.createdAt.toISOString(),
      link: null,
    },
  ];

  if (profile.updatedAt.getTime() !== profile.createdAt.getTime()) {
    events.push({
      id: `profile-updated:${profile.id}:${profile.updatedAt.getTime()}`,
      type: "profile",
      title: "Health profile updated",
      description: "Your health profile information was updated.",
      occurredAt: profile.updatedAt.toISOString(),
      link: null,
    });
  }

  return events;
};

const buildAnalysisEvents = (analyses: AnalysesList): HistoryEvent[] =>
  analyses.map((entry) => ({
    id: `analysis:${entry.id}`,
    type: "analysis",
    title: `Health analysis: ${truncate(entry.concern, 80)}`,
    description: `${entry.severity} severity · ${entry.urgencyLevel} urgency`,
    occurredAt: entry.createdAt.toISOString(),
    link: { type: "analysis", id: entry.id },
  }));

const buildReportEvents = (reports: ReportsList): HistoryEvent[] =>
  reports.map((entry) => ({
    id: `report:${entry.id}`,
    type: "report",
    title: "Comprehensive health report generated",
    description: `Covers: ${
      REPORT_RANGE_LABELS[entry.rangeKey as keyof typeof REPORT_RANGE_LABELS] ??
      entry.rangeKey
    }`,
    occurredAt: entry.createdAt.toISOString(),
    link: { type: "report", id: entry.id },
  }));

const buildVitalEvents = (logs: VitalLogs): HistoryEvent[] =>
  logs.map((log) => {
    const parts: string[] = [];

    if (log.heartRate !== null) parts.push(`HR ${log.heartRate} bpm`);
    if (log.systolic !== null && log.diastolic !== null)
      parts.push(`BP ${log.systolic}/${log.diastolic} mmHg`);
    if (log.spo2 !== null) parts.push(`SpO2 ${log.spo2}%`);

    return {
      id: `vital:${log.id}`,
      type: "vital",
      title: "Vitals recorded",
      description: parts.length > 0 ? parts.join(" · ") : "Vital reading recorded",
      occurredAt: log.recordedAt.toISOString(),
      link: null,
    };
  });

const buildDocumentEvents = (documents: DocumentsList): HistoryEvent[] =>
  documents.map((doc) => ({
    id: `document:${doc.id}`,
    type: "document",
    title: doc.originalName,
    description: doc.extractedText?.trim()
      ? "Medical document uploaded · text extracted"
      : "Medical document uploaded",
    occurredAt: doc.createdAt.toISOString(),
    link: { type: "document", id: doc.id },
  }));

const buildMedicationAddedEvents = (
  medications: MedicationsList
): HistoryEvent[] =>
  medications.map((med) => ({
    id: `medication:${med.id}`,
    type: "medication",
    title: `Medication added: ${med.name}`,
    description: `${med.dosage}${
      med.instructions ? ` — ${med.instructions}` : ""
    }`,
    occurredAt: med.createdAt.toISOString(),
    link: null,
  }));

/*
 * Follow-up answers (Phase 11) are the only record of medication-course
 * status and concern status. A medication/analysis may since have been
 * deleted, so this prefers a live name/concern lookup and falls back to
 * the label embedded at answer-time (see report.service.ts) rather than
 * showing a broken reference.
 */
const buildFollowUpEvents = (
  reports: ReportsList,
  medicationsById: Map<string, { name: string }>,
  analysesById: Map<string, { concern: string }>
): HistoryEvent[] => {
  const events: HistoryEvent[] = [];

  for (const report of reports) {
    const answers =
      (report.followUpAnswers as unknown as StoredFollowUpAnswer[] | null) ??
      [];

    for (const answer of answers) {
      const statusLabel = FOLLOWUP_STATUS_LABEL[answer.status] ?? answer.status;

      if (answer.type === "medication") {
        const label =
          medicationsById.get(answer.refId)?.name ??
          answer.refLabel ??
          "Medication";

        events.push({
          id: `followup:${report.id}:${answer.questionId}`,
          type: "followup",
          title: `Medication follow-up: ${label}`,
          description: `Reported status: ${statusLabel}`,
          occurredAt: answer.answeredAt,
          link: { type: "report", id: report.id },
        });
      } else {
        const liveConcern = analysesById.get(answer.refId)?.concern;
        const label = truncate(liveConcern ?? answer.refLabel ?? "Previous concern", 80);

        events.push({
          id: `followup:${report.id}:${answer.questionId}`,
          type: "followup",
          title: `Concern follow-up: ${label}`,
          description: `Reported status: ${statusLabel}`,
          occurredAt: answer.answeredAt,
          link: { type: "analysis", id: answer.refId },
        });
      }
    }
  }

  return events;
};

export const getHistory = async (userId: string, query: HistoryQuery) => {
  const { periodStart, periodEnd } = resolvePeriod(query.range);

  const [profile, analyses, reports, vitalLogs, documents, allMedications] =
    await Promise.all([
      findProfileByUserId(userId),
      findAnalysesByUserInRange(userId, periodStart, periodEnd),
      findReportsForHistory(userId, periodStart, periodEnd),
      getUserVitalLogsInRange(userId, periodStart, periodEnd),
      findDocumentsByUserInRange(userId, periodStart, periodEnd),
      findAllMedicationsByUser(userId),
    ]);

  const medicationsInRange = allMedications.filter(
    (med) => !periodStart || med.createdAt.getTime() >= periodStart.getTime()
  );

  const medicationsById = new Map(allMedications.map((med) => [med.id, med]));
  const analysesById = new Map(analyses.map((entry) => [entry.id, entry]));

  let events: HistoryEvent[] = [
    ...buildProfileEvents(profile).filter((event) =>
      inRange(event.occurredAt, periodStart, periodEnd)
    ),
    ...buildAnalysisEvents(analyses),
    ...buildReportEvents(reports),
    ...buildVitalEvents(vitalLogs),
    ...buildDocumentEvents(documents),
    ...buildMedicationAddedEvents(medicationsInRange),
    ...buildFollowUpEvents(reports, medicationsById, analysesById),
  ];

  if (query.type !== "all") {
    events = events.filter((event) => event.type === query.type);
  }

  if (query.search) {
    const term = query.search.toLowerCase();
    events = events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term)
    );
  }

  events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  const total = events.length;
  const offset = (query.page - 1) * query.pageSize;
  const paginated = events.slice(offset, offset + query.pageSize);

  return {
    events: paginated,
    total,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: offset + query.pageSize < total,
  };
};

const RECENT_SOURCE_CAP = 10;

export const getRecentEvents = async (
  userId: string,
  limit: number
): Promise<HistoryEvent[]> => {
  const periodEnd = new Date();

  const [profile, analyses, reports, vitalLogs, documents, allMedications] =
    await Promise.all([
      findProfileByUserId(userId),
      findRecentAnalysesByUser(userId, RECENT_SOURCE_CAP),
      findReportsForHistory(userId, null, periodEnd, RECENT_SOURCE_CAP),
      getUserVitalLogsInRange(userId, null, periodEnd, RECENT_SOURCE_CAP),
      findDocumentsByUserInRange(userId, null, periodEnd, RECENT_SOURCE_CAP),
      findAllMedicationsByUser(userId),
    ]);

  const medicationsById = new Map(allMedications.map((med) => [med.id, med]));
  const analysesById = new Map(analyses.map((entry) => [entry.id, entry]));

  const events: HistoryEvent[] = [
    ...buildProfileEvents(profile),
    ...buildAnalysisEvents(analyses),
    ...buildReportEvents(reports),
    ...buildVitalEvents(vitalLogs),
    ...buildDocumentEvents(documents),
    ...buildMedicationAddedEvents(allMedications.slice(0, RECENT_SOURCE_CAP)),
    ...buildFollowUpEvents(reports, medicationsById, analysesById),
  ];

  events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return events.slice(0, limit);
};

/* ============================================================
   LONGITUDINAL ANALYTICS
============================================================ */

interface VitalTrendPoint {
  date: string;
  value: number;
}

const buildVitalTrend = (
  logs: VitalLogs,
  key: "heartRate" | "systolic" | "diastolic" | "spo2"
): VitalTrendPoint[] =>
  logs
    .filter((log) => log[key] !== null)
    .slice()
    .reverse() // logs are newest-first; charts read chronologically
    .map((log) => ({
      date: log.recordedAt.toISOString(),
      value: log[key] as number,
    }));

const buildConcernStatus = (analyses: AnalysesList, reports: ReportsList) => {
  const latestByConcern = new Map<string, StoredFollowUpAnswer>();

  for (const report of reports) {
    const answers =
      (report.followUpAnswers as unknown as StoredFollowUpAnswer[] | null) ??
      [];

    for (const answer of answers) {
      if (answer.type !== "concern") continue;

      const existing = latestByConcern.get(answer.refId);
      if (
        !existing ||
        new Date(answer.answeredAt).getTime() >
          new Date(existing.answeredAt).getTime()
      ) {
        latestByConcern.set(answer.refId, answer);
      }
    }
  }

  const counts = {
    resolved: 0,
    improved: 0,
    persistent: 0,
    worsening: 0,
    unknown: 0,
  };

  for (const analysis of analyses) {
    const answer = latestByConcern.get(analysis.id);

    if (!answer) {
      counts.unknown++;
      continue;
    }

    switch (answer.status) {
      case "resolved":
        counts.resolved++;
        break;
      case "improved":
        counts.improved++;
        break;
      case "still_present":
        counts.persistent++;
        break;
      case "worse":
        counts.worsening++;
        break;
      default:
        counts.unknown++;
    }
  }

  return counts;
};

const buildHealthTrackingProgress = (params: {
  profileCompletion: number;
  hasVitals: boolean;
  hasMedications: boolean;
  hasFollowUpCompletion: boolean;
  hasDocuments: boolean;
}) => {
  const breakdown = [
    {
      key: "profile",
      label: "Profile completeness",
      value: Math.round(params.profileCompletion / 5),
      max: 20,
    },
    {
      key: "vitals",
      label: "Vitals recorded",
      value: params.hasVitals ? 20 : 0,
      max: 20,
    },
    {
      key: "medications",
      label: "Medications tracked",
      value: params.hasMedications ? 20 : 0,
      max: 20,
    },
    {
      key: "followups",
      label: "Follow-ups completed",
      value: params.hasFollowUpCompletion ? 20 : 0,
      max: 20,
    },
    {
      key: "documents",
      label: "Documents organized",
      value: params.hasDocuments ? 20 : 0,
      max: 20,
    },
  ];

  return {
    label: "Health Tracking Progress",
    score: breakdown.reduce((sum, item) => sum + item.value, 0),
    disclaimer:
      "This reflects how much of your health data you've recorded in this app - it is not a medical assessment.",
    breakdown,
  };
};

const buildInsightPrompt = (
  range: HistoryRange,
  volume: {
    analyses: number;
    reports: number;
    vitals: number;
    documents: number;
    medications: number;
    followups: number;
  },
  concernStatus: ReturnType<typeof buildConcernStatus>
) => `Describe the user's recorded health activity for the period: ${HISTORY_RANGE_LABELS[range]}.

Recorded counts in this period:
- Health analyses: ${volume.analyses}
- Health reports generated: ${volume.reports}
- Vitals recorded: ${volume.vitals}
- Medical documents uploaded: ${volume.documents}
- Medications added: ${volume.medications}
- Follow-up answers recorded: ${volume.followups}

Concern status from follow-up answers (out of ${
  concernStatus.resolved +
  concernStatus.improved +
  concernStatus.persistent +
  concernStatus.worsening +
  concernStatus.unknown
} tracked concern(s)): resolved ${concernStatus.resolved}, improved ${
  concernStatus.improved
}, still present ${concernStatus.persistent}, worse ${
  concernStatus.worsening
}, unknown/not updated ${concernStatus.unknown}.

Write the short descriptive summary now, following the required JSON schema exactly.`;

const MIN_ACTIVITY_FOR_INSIGHT = 2;

export const getAnalytics = async (userId: string, range: HistoryRange) => {
  const { periodStart, periodEnd } = resolvePeriod(range);

  const [
    profile,
    analyses,
    reports,
    vitalLogs,
    documents,
    allMedications,
    medicationLogs,
    allTimeVitals,
    allTimeDocuments,
    allTimeReports,
  ] = await Promise.all([
    findProfileByUserId(userId),
    findAnalysesByUserInRange(userId, periodStart, periodEnd),
    findReportsForHistory(userId, periodStart, periodEnd),
    getUserVitalLogsInRange(userId, periodStart, periodEnd),
    findDocumentsByUserInRange(userId, periodStart, periodEnd),
    findAllMedicationsByUser(userId),
    findMedicationLogsByUserInRange(userId, periodStart, periodEnd),
    getUserVitalLogs(userId),
    getUserDocuments(userId),
    findReportsForHistory(userId, null, periodEnd),
  ]);

  const medicationsAddedInRange = allMedications.filter(
    (med) => !periodStart || med.createdAt.getTime() >= periodStart.getTime()
  ).length;

  const followUpsInRange = reports.reduce(
    (sum, report) =>
      sum +
      (
        (report.followUpAnswers as unknown as StoredFollowUpAnswer[] | null) ??
        []
      ).length,
    0
  );

  const activityVolume = {
    analyses: analyses.length,
    reports: reports.length,
    vitals: vitalLogs.length,
    documents: documents.length,
    medications: medicationsAddedInRange,
    followups: followUpsInRange,
  };

  const vitalTrends = {
    heartRate: buildVitalTrend(vitalLogs, "heartRate"),
    systolic: buildVitalTrend(vitalLogs, "systolic"),
    diastolic: buildVitalTrend(vitalLogs, "diastolic"),
    spo2: buildVitalTrend(vitalLogs, "spo2"),
  };

  const medicationTracking = {
    activeMedications: allMedications.filter((med) => med.active).length,
    totalMedicationsTracked: allMedications.length,
    dosesScheduled: medicationLogs.length,
    dosesTaken: medicationLogs.filter((log) => log.taken).length,
  };

  const concernStatus = buildConcernStatus(analyses, reports);

  const hasFollowUpCompletion = allTimeReports.some(
    (report) =>
      (
        (report.followUpAnswers as unknown as StoredFollowUpAnswer[] | null) ??
        []
      ).length > 0
  );

  const healthTrackingProgress = buildHealthTrackingProgress({
    profileCompletion: calculateCompletion(profile),
    hasVitals: allTimeVitals.length > 0,
    hasMedications: allMedications.length > 0,
    hasFollowUpCompletion,
    hasDocuments: allTimeDocuments.length > 0,
  });

  const totalActivity =
    activityVolume.analyses +
    activityVolume.reports +
    activityVolume.vitals +
    activityVolume.documents +
    activityVolume.medications +
    activityVolume.followups;

  let aiInsight: { available: boolean; text: string | null } = {
    available: false,
    text: null,
  };

  if (totalActivity >= MIN_ACTIVITY_FOR_INSIGHT) {
    try {
      const prompt = buildInsightPrompt(range, activityVolume, concernStatus);
      const rawResult = await generateHistoryInsight(prompt);

      aiInsight = {
        available: true,
        text: redactDrugNames(rawResult.insight),
      };
    } catch (error) {
      console.error(
        "HISTORY INSIGHT ERROR:",
        error instanceof Error ? error.message : "unknown error"
      );
      // AI insight is optional - if it fails, analytics still return normally.
      aiInsight = { available: false, text: null };
    }
  }

  return {
    range,
    periodStart: periodStart ? periodStart.toISOString() : null,
    periodEnd: periodEnd.toISOString(),
    activityVolume,
    vitalTrends,
    medicationTracking,
    concernStatus,
    healthTrackingProgress,
    aiInsight,
  };
};
