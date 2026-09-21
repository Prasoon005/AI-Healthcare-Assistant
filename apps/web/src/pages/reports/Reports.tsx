import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Info,
  ListChecks,
  MessageCircleQuestion,
  Pill,
  Printer,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  askAboutReport,
  generateHealthReport,
  getFollowUpQuestions,
  getHealthReport,
  getHealthReports,
  REPORT_RANGE_OPTIONS,
  type FollowUpAnswer,
  type FollowUpQuestion,
  type HealthReport,
  type HealthReportSummary,
  type MetricSummary,
  type ReportContent,
  type ReportQuestionEntry,
  type ReportRange,
} from "../../api/reports";
import {
  getDocuments,
  uploadDocument,
  type MedicalDocument,
} from "../../api/documents";
import type { UrgencyLevel } from "../../api/analysis";

const URGENCY_CLASS: Record<UrgencyLevel, "low" | "moderate" | "high"> = {
  routine: "low",
  soon: "moderate",
  urgent: "high",
};

const RANGE_LABEL: Record<ReportRange, string> = Object.fromEntries(
  REPORT_RANGE_OPTIONS.map((option) => [option.value, option.label])
) as Record<ReportRange, string>;

const CONTENT_SECTIONS: { key: keyof ReportContent; label: string }[] = [
  { key: "patientOverview", label: "Patient overview" },
  { key: "profileSummary", label: "Profile summary" },
  { key: "healthHistory", label: "Health history" },
  { key: "previousAnalyses", label: "Previous analyses" },
  { key: "currentHealthStatus", label: "Current health status" },
  { key: "vitalsSummary", label: "Vitals summary" },
  { key: "medicationSummary", label: "Medication history / current status" },
  {
    key: "previousConcernsStatus",
    label: "Previous concerns & current status",
  },
  { key: "medicalDocumentsSummary", label: "Medical documents / test reports" },
  { key: "currentObservations", label: "Current observations" },
  { key: "persistentConcerns", label: "Persistent concerns" },
  {
    key: "generalWellnessConsiderations",
    label: "General wellness considerations",
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

const genderLabel = (gender: string | null) =>
  gender ? gender.toLowerCase().replace(/_/g, " ") : null;

const MetricTile = ({
  label,
  unit,
  metric,
}: {
  label: string;
  unit: string;
  metric: MetricSummary;
}) => (
  <div className="report-metric-tile">
    <span className="report-metric-label">{label}</span>

    {metric.count === 0 ? (
      <span className="report-metric-empty">No readings recorded</span>
    ) : (
      <>
        <span className="report-metric-value">
          {metric.latest}
          <span className="report-metric-unit">{unit}</span>
        </span>
        <span className="report-metric-range">
          avg {metric.avg} · min {metric.min} · max {metric.max}
        </span>
        <span className="report-metric-count">
          {metric.count} reading{metric.count === 1 ? "" : "s"}
        </span>
      </>
    )}
  </div>
);

/* ============================================================
   REPORT DETAIL (view an already-generated report)
============================================================ */

const AskHealthAI = ({ report }: { report: HealthReport }) => {
  const [log, setLog] = useState<ReportQuestionEntry[]>(report.questions);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || asking) return;

    try {
      setAsking(true);
      setError("");

      const result = await askAboutReport(report.id, trimmed);

      setLog((prev) => [...prev, result]);
      setQuestion("");
    } catch (err: any) {
      console.error("Failed to ask about report:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to answer right now. Please try again."
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="glass-card profile-section no-print">
      <div className="profile-section-header">
        <div>
          <h3>
            <MessageCircleQuestion size={16} className="analysis-header-icon" />
            Ask HealthAI about this report
          </h3>
          <p>Grounded in this report only — not a general-purpose chat</p>
        </div>
      </div>

      {log.length > 0 && (
        <div className="report-qa-log">
          {log.map((entry) => (
            <div key={entry.id} className="report-qa-entry">
              <span className="report-qa-question">{entry.question}</span>
              <span className="report-qa-answer">{entry.answer}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="profile-error-banner">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <form className="report-qa-form" onSubmit={handleAsk}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What should I discuss with my doctor?"
          maxLength={300}
          disabled={asking}
        />

        <button
          type="submit"
          className="profile-save-button"
          disabled={asking || !question.trim()}
        >
          <Send size={14} />
          {asking ? "Asking..." : "Ask"}
        </button>
      </form>
    </div>
  );
};

const ReportDetail = ({ report }: { report: HealthReport }) => {
  const {
    profileSnapshot,
    vitalsSummary,
    wellnessSnapshot,
    analysesSummary,
    medicationsSummary,
    documentsSummary,
    reportContent,
  } = report;

  return (
    <div className="report-print-area">
      <div className="glass-card report-header-card">
        <div className="profile-section-header">
          <div>
            <h3>
              <FileText size={16} className="analysis-header-icon" />
              Comprehensive health report — {RANGE_LABEL[report.rangeKey]}
            </h3>
            <p className="report-header-meta">
              Period:{" "}
              {report.periodStart
                ? `${formatDate(report.periodStart)} – ${formatDate(
                    report.periodEnd
                  )}`
                : `Up to ${formatDate(report.periodEnd)}`}
              {" · "}Generated {formatDateTime(report.createdAt)}
            </p>
          </div>

          <button
            type="button"
            className="profile-edit-button no-print"
            onClick={() => window.print()}
          >
            <Printer size={14} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <Sparkles size={16} className="analysis-header-icon" />
              AI health summary
            </h3>
            <p>
              Generated from your real recorded data only — educational, not a
              diagnosis
            </p>
          </div>
        </div>

        {CONTENT_SECTIONS.map((section) => (
          <div key={section.key} className="report-content-section">
            <h4>{section.label}</h4>
            <p>{reportContent[section.key] as string}</p>
          </div>
        ))}

        {reportContent.suggestedFollowUpTopics.length > 0 && (
          <div className="report-content-section">
            <h4>Suggested follow-up topics</h4>
            <ul>
              {reportContent.suggestedFollowUpTopics.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {reportContent.questionsForDoctor.length > 0 && (
          <div className="report-content-section">
            <h4>Questions to discuss with a healthcare professional</h4>
            <ul>
              {reportContent.questionsForDoctor.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Profile summary</h3>
            <p>Snapshot of your health profile at generation time</p>
          </div>
        </div>

        {profileSnapshot ? (
          <div className="report-profile-grid">
            {profileSnapshot.age !== null && (
              <div className="report-profile-item">
                <span>Age</span>
                <strong>{profileSnapshot.age}</strong>
              </div>
            )}
            {profileSnapshot.gender !== null && (
              <div className="report-profile-item">
                <span>Gender</span>
                <strong>{genderLabel(profileSnapshot.gender)}</strong>
              </div>
            )}
            {profileSnapshot.height !== null && (
              <div className="report-profile-item">
                <span>Height</span>
                <strong>{profileSnapshot.height} cm</strong>
              </div>
            )}
            {profileSnapshot.weight !== null && (
              <div className="report-profile-item">
                <span>Weight</span>
                <strong>{profileSnapshot.weight} kg</strong>
              </div>
            )}
            {profileSnapshot.smoking !== null && (
              <div className="report-profile-item">
                <span>Smoking</span>
                <strong>{profileSnapshot.smoking ? "Yes" : "No"}</strong>
              </div>
            )}
            {profileSnapshot.alcohol !== null && (
              <div className="report-profile-item">
                <span>Alcohol</span>
                <strong>{profileSnapshot.alcohol ? "Yes" : "No"}</strong>
              </div>
            )}
            {profileSnapshot.exerciseDays !== null && (
              <div className="report-profile-item">
                <span>Exercise</span>
                <strong>{profileSnapshot.exerciseDays} days/wk</strong>
              </div>
            )}
            {profileSnapshot.sleepHours !== null && (
              <div className="report-profile-item">
                <span>Sleep</span>
                <strong>{profileSnapshot.sleepHours} h</strong>
              </div>
            )}
            {profileSnapshot.allergies && (
              <div className="report-profile-item full-width">
                <span>Allergies</span>
                <strong>{profileSnapshot.allergies}</strong>
              </div>
            )}
            {profileSnapshot.medicalConditions && (
              <div className="report-profile-item full-width">
                <span>Medical conditions</span>
                <strong>{profileSnapshot.medicalConditions}</strong>
              </div>
            )}
            {profileSnapshot.medications && (
              <div className="report-profile-item full-width">
                <span>Current medications</span>
                <strong>{profileSnapshot.medications}</strong>
              </div>
            )}
          </div>
        ) : (
          <p className="report-empty-note">
            No health profile was on file when this report was generated.
          </p>
        )}
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <HeartPulse size={16} className="analysis-header-icon" />
              Vitals summary
            </h3>
            <p>
              {vitalsSummary.recordCount === 0
                ? "No vitals were recorded in this period"
                : `Based on ${vitalsSummary.recordCount} reading(s) in this period`}
            </p>
          </div>
        </div>

        <div className="report-metric-grid">
          <MetricTile
            label="Heart rate"
            unit=" bpm"
            metric={vitalsSummary.heartRate}
          />
          <MetricTile
            label="Systolic BP"
            unit=" mmHg"
            metric={vitalsSummary.systolic}
          />
          <MetricTile
            label="Diastolic BP"
            unit=" mmHg"
            metric={vitalsSummary.diastolic}
          />
          <MetricTile label="SpO2" unit="%" metric={vitalsSummary.spo2} />
        </div>
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <Sparkles size={16} className="analysis-header-icon" />
              Wellness indicator
            </h3>
            <p>Current lifestyle-based wellness signals from your profile</p>
          </div>
        </div>

        {wellnessSnapshot.available ? (
          <>
            <div className="report-wellness-score">
              Overall wellness indicator:{" "}
              <strong>{wellnessSnapshot.overallWellnessScore}</strong> / 100
            </div>

            <div className="report-wellness-items">
              {wellnessSnapshot.items.map((item) => (
                <div key={item.key} className="report-wellness-item">
                  <span>{item.label}</span>
                  <span className={`risk-badge ${item.level}`}>
                    {item.level}
                  </span>
                </div>
              ))}
            </div>

            {wellnessSnapshot.disclaimer && (
              <p className="report-empty-note">{wellnessSnapshot.disclaimer}</p>
            )}
          </>
        ) : (
          <p className="report-empty-note">
            Not enough profile data was available to calculate a wellness
            indicator at generation time.
          </p>
        )}
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <Pill size={16} className="analysis-header-icon" />
              Medications
            </h3>
            <p>
              {medicationsSummary.length === 0
                ? "No current medications on record"
                : `${medicationsSummary.length} current medication(s)`}
            </p>
          </div>
        </div>

        {medicationsSummary.length > 0 ? (
          <div className="report-profile-grid">
            {medicationsSummary.map((med) => (
              <div key={med.id} className="report-profile-item full-width">
                <span>{med.name}</span>
                <strong>
                  {med.dosage}
                  {med.instructions ? ` — ${med.instructions}` : ""}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="report-empty-note">Not available.</p>
        )}
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <ClipboardCheck size={16} className="analysis-header-icon" />
              Medical documents / test reports
            </h3>
            <p>
              {documentsSummary.length === 0
                ? "No documents were attached to this report"
                : `${documentsSummary.length} document(s) attached`}
            </p>
          </div>
        </div>

        {documentsSummary.length > 0 ? (
          <div className="report-profile-grid">
            {documentsSummary.map((doc) => (
              <div key={doc.id} className="report-profile-item">
                <span>{formatDate(doc.createdAt)}</span>
                <strong>{doc.name}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="report-empty-note">Not available.</p>
        )}
      </div>

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <ClipboardCheck size={16} className="analysis-header-icon" />
              Health analyses in this period
            </h3>
            <p>
              {analysesSummary.length === 0
                ? "No health analyses were recorded in this period"
                : `${analysesSummary.length} analysis/analyses in this period`}
            </p>
          </div>
        </div>

        {analysesSummary.length > 0 && (
          <>
            <div className="activity-list no-print">
              {analysesSummary.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/analysis?id=${entry.id}`}
                  className="activity-item"
                >
                  <div className="activity-item-icon">
                    <ClipboardCheck size={17} />
                  </div>

                  <div className="activity-item-content">
                    <strong>{entry.concern}</strong>
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>

                  <span
                    className={`risk-badge ${URGENCY_CLASS[entry.urgencyLevel]}`}
                  >
                    {entry.urgencyLevel}
                  </span>
                </Link>
              ))}
            </div>

            <div className="report-print-only">
              {analysesSummary.map((entry) => (
                <div key={entry.id} className="report-print-analysis-item">
                  <strong>{entry.concern}</strong>
                  <span>
                    {formatDate(entry.createdAt)} · {entry.severity} severity ·{" "}
                    {entry.urgencyLevel}
                  </span>
                  <p>{entry.summary}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AskHealthAI report={report} />

      <div className="analysis-disclaimer analysis-disclaimer-standalone">
        <ShieldCheck size={14} />
        <span>{reportContent.disclaimer}</span>
      </div>
    </div>
  );
};

/* ============================================================
   MULTI-STEP REPORT GENERATION WIZARD
============================================================ */

type WizardStep = "range" | "followup" | "documents" | "review";

const STEP_ORDER: { key: WizardStep; label: string }[] = [
  { key: "range", label: "Period" },
  { key: "followup", label: "Follow-up" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Generate" },
];

const GenerateWizard = ({
  onGenerated,
}: {
  onGenerated: (report: HealthReport) => void;
}) => {
  const [step, setStep] = useState<WizardStep>("range");
  const [selectedRange, setSelectedRange] = useState<ReportRange>("30d");

  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, FollowUpAnswer>>({});

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const loadQuestions = async () => {
    if (questionsLoaded) return;

    try {
      setQuestionsLoading(true);
      const result = await getFollowUpQuestions();
      setQuestions(result);
      setQuestionsLoaded(true);
    } catch (error) {
      console.error("Failed to load follow-up questions:", error);
      setQuestionsLoaded(true);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (documentsLoaded) return;

    try {
      setDocumentsLoading(true);
      const result = await getDocuments();
      setDocuments(result);
      setDocumentsLoaded(true);
    } catch (error) {
      console.error("Failed to load medical vault documents:", error);
      setDocumentsLoaded(true);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const goToStep = (next: WizardStep) => {
    if (next === "followup") loadQuestions();
    if (next === "documents") loadDocuments();
    setStep(next);
  };

  const selectAnswer = (question: FollowUpQuestion, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.questionId]: {
        questionId: question.questionId,
        type: question.type,
        refId: question.refId,
        status: value,
      },
    }));
  };

  const toggleDocument = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      setUploadError("");

      const result = await uploadDocument(file);
      const uploaded: MedicalDocument = result.data;

      setDocuments((prev) => [uploaded, ...prev]);
      setSelectedDocIds((prev) => [...prev, uploaded.id]);
    } catch (error: any) {
      console.error("Failed to upload document:", error);
      setUploadError(
        error?.response?.data?.message ||
          "Unable to upload this document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGenerateError("");

      const result = await generateHealthReport({
        range: selectedRange,
        followUpAnswers: Object.values(answers),
        documentIds: selectedDocIds,
      });

      onGenerated(result);
    } catch (error: any) {
      console.error("Failed to generate health report:", error);

      if (error?.response?.status === 503) {
        setGenerateError(
          error?.response?.data?.message ||
            "The AI service is temporarily unavailable. Please try again in a moment."
        );
      } else {
        setGenerateError(
          error?.response?.data?.message ||
            "Unable to generate a report right now. Please try again."
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  const stepIndex = STEP_ORDER.findIndex((item) => item.key === step);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <FileText size={16} className="analysis-header-icon" />
            Generate a comprehensive health report
          </h3>
          <p>
            Combines your profile, vitals, medications, analysis history and
            documents into one AI-generated educational report.
          </p>
        </div>
      </div>

      <div className="report-steps">
        {STEP_ORDER.map((item, index) => (
          <span
            key={item.key}
            className={`report-step-pill ${
              index === stepIndex
                ? "active"
                : index < stepIndex
                ? "done"
                : ""
            }`}
          >
            <span className="report-step-index">
              {index < stepIndex ? <Check size={10} /> : index + 1}
            </span>
            {item.label}
          </span>
        ))}
      </div>

      {step === "range" && (
        <>
          <div className="report-range-picker">
            {REPORT_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`report-range-button ${
                  selectedRange === option.value ? "active" : ""
                }`}
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="report-wizard-nav">
            <span />
            <button
              type="button"
              className="profile-save-button"
              onClick={() => goToStep("followup")}
            >
              Next: Follow-up questions
            </button>
          </div>
        </>
      )}

      {step === "followup" && (
        <>
          {questionsLoading ? (
            <p className="report-empty-note">
              Checking your medications and recent concerns...
            </p>
          ) : questions.length === 0 ? (
            <p className="report-empty-note">
              Nothing needs a follow-up check right now — you can continue.
            </p>
          ) : (
            <>
              <p className="report-empty-note">
                These are optional — answer any that apply.
              </p>

              {questions.map((question) => {
                const selected = answers[question.questionId]?.status;

                return (
                  <div key={question.questionId} className="followup-question-card">
                    <span className="followup-question-tag">
                      {question.type === "medication" ? "Medication" : "Concern"}
                    </span>
                    <strong>{question.prompt}</strong>

                    <div className="followup-question-options">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`followup-option-button ${
                            selected === option.value ? "selected" : ""
                          }`}
                          onClick={() => selectAnswer(question, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <div className="report-wizard-nav">
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => goToStep("range")}
            >
              Back
            </button>
            <button
              type="button"
              className="profile-save-button"
              onClick={() => goToStep("documents")}
            >
              Next: Documents
            </button>
          </div>
        </>
      )}

      {step === "documents" && (
        <>
          <p className="report-empty-note">
            Optionally attach medical/test reports from your Medical Vault —
            reuses the same upload and OCR pipeline as your dashboard vault.
          </p>

          {documentsLoading ? (
            <p className="report-empty-note">Loading your Medical Vault...</p>
          ) : (
            <div className="report-document-list">
              {documents.map((doc) => (
                <label key={doc.id} className="report-document-item">
                  <input
                    type="checkbox"
                    checked={selectedDocIds.includes(doc.id)}
                    onChange={() => toggleDocument(doc.id)}
                  />
                  <div className="report-document-item-meta">
                    <strong>{doc.originalName}</strong>
                    <span>
                      {doc.extractedText
                        ? "Text extracted"
                        : "No text extracted"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {uploadError && (
            <div className="profile-error-banner">
              <AlertTriangle size={16} />
              {uploadError}
            </div>
          )}

          <button
            type="button"
            className="report-upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={14} />
            {uploading ? "Uploading..." : "Add medical report"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleUpload}
            hidden
          />

          <div className="report-wizard-nav">
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => goToStep("followup")}
            >
              Back
            </button>
            <button
              type="button"
              className="profile-save-button"
              onClick={() => goToStep("review")}
            >
              Next: Review
            </button>
          </div>
        </>
      )}

      {step === "review" && (
        <>
          <div className="report-document-list">
            <div className="report-document-item">
              <ListChecks size={16} />
              <div className="report-document-item-meta">
                <strong>Period</strong>
                <span>{RANGE_LABEL[selectedRange]}</span>
              </div>
            </div>
            <div className="report-document-item">
              <ListChecks size={16} />
              <div className="report-document-item-meta">
                <strong>Follow-up answers</strong>
                <span>{answeredCount} answered</span>
              </div>
            </div>
            <div className="report-document-item">
              <ListChecks size={16} />
              <div className="report-document-item-meta">
                <strong>Attached documents</strong>
                <span>{selectedDocIds.length} attached</span>
              </div>
            </div>
          </div>

          {generateError && (
            <div className="profile-error-banner">
              <AlertTriangle size={16} />
              {generateError}
            </div>
          )}

          <div className="report-wizard-nav">
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => goToStep("documents")}
              disabled={generating}
            >
              Back
            </button>
            <button
              type="button"
              className="profile-save-button"
              disabled={generating}
              onClick={handleGenerate}
            >
              <FileText size={14} />
              {generating ? "Generating your report..." : "Generate report"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================
   PAGE
============================================================ */

const Reports = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reportId = searchParams.get("id");

  const [reports, setReports] = useState<HealthReportSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [report, setReport] = useState<HealthReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const result = await getHealthReports();
        setReports(result);
      } catch (error) {
        console.error("Failed to load health reports:", error);
        setListError("Unable to load your past reports right now.");
      } finally {
        setListLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      return;
    }

    const loadReport = async () => {
      try {
        setDetailLoading(true);
        setDetailError("");

        const result = await getHealthReport(reportId);
        setReport(result);
      } catch (error) {
        console.error("Failed to load health report:", error);
        setDetailError(
          "This report could not be found. It may have been removed."
        );
      } finally {
        setDetailLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  const handleGenerated = (result: HealthReport) => {
    setReports((prev) => [
      {
        id: result.id,
        rangeKey: result.rangeKey,
        periodStart: result.periodStart,
        periodEnd: result.periodEnd,
        createdAt: result.createdAt,
      },
      ...prev,
    ]);
    navigate(`/reports?id=${result.id}`);
  };

  if (reportId) {
    if (detailLoading) {
      return (
        <div className="profile-page">
          <div className="glass-card profile-loading">
            Loading your report...
          </div>
        </div>
      );
    }

    if (detailError || !report) {
      return (
        <div className="profile-page">
          <div className="glass-card profile-error-banner">
            <AlertTriangle size={16} />
            {detailError}
          </div>

          <button
            type="button"
            className="profile-edit-button analysis-inline-button"
            onClick={() => navigate("/reports")}
          >
            Back to reports
          </button>
        </div>
      );
    }

    return (
      <div className="profile-page">
        <Link to="/reports" className="report-back-link no-print">
          ← Back to reports
        </Link>

        <ReportDetail report={report} />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <GenerateWizard onGenerated={handleGenerated} />

      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>Your reports</h3>
            <p>Previously generated reports</p>
          </div>
        </div>

        {listLoading ? (
          <p className="report-empty-note">Loading your reports...</p>
        ) : listError ? (
          <p className="report-empty-note">{listError}</p>
        ) : reports.length === 0 ? (
          <p className="report-empty-note">
            You haven't generated any reports yet. Use the steps above to
            generate your first one.
          </p>
        ) : (
          <div className="activity-list">
            {reports.map((entry) => (
              <Link
                key={entry.id}
                to={`/reports?id=${entry.id}`}
                className="activity-item"
              >
                <div className="activity-item-icon">
                  <FileText size={17} />
                </div>

                <div className="activity-item-content">
                  <strong>{RANGE_LABEL[entry.rangeKey]}</strong>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="report-empty-note">
        <Info size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Reports are educational summaries of information already in your
        account. They do not replace professional medical advice.
      </div>
    </div>
  );
};

export default Reports;
