import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Check, ClipboardCheck, FileText, HeartPulse, Info, ListChecks, MessageCircleQuestion, Pill, Printer, Send, ShieldCheck, Sparkles, Upload, } from "lucide-react";
import { askAboutReport, generateHealthReport, getFollowUpQuestions, getHealthReport, getHealthReports, REPORT_RANGE_OPTIONS, } from "../../api/reports";
import { getDocuments, uploadDocument, } from "../../api/documents";
const URGENCY_CLASS = {
    routine: "low",
    soon: "moderate",
    urgent: "high",
};
const RANGE_LABEL = Object.fromEntries(REPORT_RANGE_OPTIONS.map((option) => [option.value, option.label]));
const CONTENT_SECTIONS = [
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
const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
});
const formatDateTime = (iso) => new Date(iso).toLocaleString();
const genderLabel = (gender) => gender ? gender.toLowerCase().replace(/_/g, " ") : null;
const MetricTile = ({ label, unit, metric, }) => (_jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: label }), metric.count === 0 ? (_jsx("span", { className: "report-metric-empty", children: "No readings recorded" })) : (_jsxs(_Fragment, { children: [_jsxs("span", { className: "report-metric-value", children: [metric.latest, _jsx("span", { className: "report-metric-unit", children: unit })] }), _jsxs("span", { className: "report-metric-range", children: ["avg ", metric.avg, " \u00B7 min ", metric.min, " \u00B7 max ", metric.max] }), _jsxs("span", { className: "report-metric-count", children: [metric.count, " reading", metric.count === 1 ? "" : "s"] })] }))] }));
/* ============================================================
   REPORT DETAIL (view an already-generated report)
============================================================ */
const AskHealthAI = ({ report }) => {
    const [log, setLog] = useState(report.questions);
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState("");
    const handleAsk = async (e) => {
        e.preventDefault();
        const trimmed = question.trim();
        if (!trimmed || asking)
            return;
        try {
            setAsking(true);
            setError("");
            const result = await askAboutReport(report.id, trimmed);
            setLog((prev) => [...prev, result]);
            setQuestion("");
        }
        catch (err) {
            console.error("Failed to ask about report:", err);
            setError(err?.response?.data?.message ||
                "Unable to answer right now. Please try again.");
        }
        finally {
            setAsking(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section no-print", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(MessageCircleQuestion, { size: 16, className: "analysis-header-icon" }), "Ask HealthAI about this report"] }), _jsx("p", { children: "Grounded in this report only \u2014 not a general-purpose chat" })] }) }), log.length > 0 && (_jsx("div", { className: "report-qa-log", children: log.map((entry) => (_jsxs("div", { className: "report-qa-entry", children: [_jsx("span", { className: "report-qa-question", children: entry.question }), _jsx("span", { className: "report-qa-answer", children: entry.answer })] }, entry.id))) })), error && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })), _jsxs("form", { className: "report-qa-form", onSubmit: handleAsk, children: [_jsx("input", { value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "e.g. What should I discuss with my doctor?", maxLength: 300, disabled: asking }), _jsxs("button", { type: "submit", className: "profile-save-button", disabled: asking || !question.trim(), children: [_jsx(Send, { size: 14 }), asking ? "Asking..." : "Ask"] })] })] }));
};
const ReportDetail = ({ report }) => {
    const { profileSnapshot, vitalsSummary, wellnessSnapshot, analysesSummary, medicationsSummary, documentsSummary, reportContent, } = report;
    return (_jsxs("div", { className: "report-print-area", children: [_jsx("div", { className: "glass-card report-header-card", children: _jsxs("div", { className: "profile-section-header", children: [_jsxs("div", { children: [_jsxs("h3", { children: [_jsx(FileText, { size: 16, className: "analysis-header-icon" }), "Comprehensive health report \u2014 ", RANGE_LABEL[report.rangeKey]] }), _jsxs("p", { className: "report-header-meta", children: ["Period:", " ", report.periodStart
                                            ? `${formatDate(report.periodStart)} – ${formatDate(report.periodEnd)}`
                                            : `Up to ${formatDate(report.periodEnd)}`, " · ", "Generated ", formatDateTime(report.createdAt)] })] }), _jsxs("button", { type: "button", className: "profile-edit-button no-print", onClick: () => window.print(), children: [_jsx(Printer, { size: 14 }), "Print / Save as PDF"] })] }) }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(Sparkles, { size: 16, className: "analysis-header-icon" }), "AI health summary"] }), _jsx("p", { children: "Generated from your real recorded data only \u2014 educational, not a diagnosis" })] }) }), CONTENT_SECTIONS.map((section) => (_jsxs("div", { className: "report-content-section", children: [_jsx("h4", { children: section.label }), _jsx("p", { children: reportContent[section.key] })] }, section.key))), reportContent.suggestedFollowUpTopics.length > 0 && (_jsxs("div", { className: "report-content-section", children: [_jsx("h4", { children: "Suggested follow-up topics" }), _jsx("ul", { children: reportContent.suggestedFollowUpTopics.map((item, index) => (_jsx("li", { children: item }, index))) })] })), reportContent.questionsForDoctor.length > 0 && (_jsxs("div", { className: "report-content-section", children: [_jsx("h4", { children: "Questions to discuss with a healthcare professional" }), _jsx("ul", { children: reportContent.questionsForDoctor.map((item, index) => (_jsx("li", { children: item }, index))) })] }))] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Profile summary" }), _jsx("p", { children: "Snapshot of your health profile at generation time" })] }) }), profileSnapshot ? (_jsxs("div", { className: "report-profile-grid", children: [profileSnapshot.age !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Age" }), _jsx("strong", { children: profileSnapshot.age })] })), profileSnapshot.gender !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Gender" }), _jsx("strong", { children: genderLabel(profileSnapshot.gender) })] })), profileSnapshot.height !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Height" }), _jsxs("strong", { children: [profileSnapshot.height, " cm"] })] })), profileSnapshot.weight !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Weight" }), _jsxs("strong", { children: [profileSnapshot.weight, " kg"] })] })), profileSnapshot.smoking !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Smoking" }), _jsx("strong", { children: profileSnapshot.smoking ? "Yes" : "No" })] })), profileSnapshot.alcohol !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Alcohol" }), _jsx("strong", { children: profileSnapshot.alcohol ? "Yes" : "No" })] })), profileSnapshot.exerciseDays !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Exercise" }), _jsxs("strong", { children: [profileSnapshot.exerciseDays, " days/wk"] })] })), profileSnapshot.sleepHours !== null && (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: "Sleep" }), _jsxs("strong", { children: [profileSnapshot.sleepHours, " h"] })] })), profileSnapshot.allergies && (_jsxs("div", { className: "report-profile-item full-width", children: [_jsx("span", { children: "Allergies" }), _jsx("strong", { children: profileSnapshot.allergies })] })), profileSnapshot.medicalConditions && (_jsxs("div", { className: "report-profile-item full-width", children: [_jsx("span", { children: "Medical conditions" }), _jsx("strong", { children: profileSnapshot.medicalConditions })] })), profileSnapshot.medications && (_jsxs("div", { className: "report-profile-item full-width", children: [_jsx("span", { children: "Current medications" }), _jsx("strong", { children: profileSnapshot.medications })] }))] })) : (_jsx("p", { className: "report-empty-note", children: "No health profile was on file when this report was generated." }))] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(HeartPulse, { size: 16, className: "analysis-header-icon" }), "Vitals summary"] }), _jsx("p", { children: vitalsSummary.recordCount === 0
                                        ? "No vitals were recorded in this period"
                                        : `Based on ${vitalsSummary.recordCount} reading(s) in this period` })] }) }), _jsxs("div", { className: "report-metric-grid", children: [_jsx(MetricTile, { label: "Heart rate", unit: " bpm", metric: vitalsSummary.heartRate }), _jsx(MetricTile, { label: "Systolic BP", unit: " mmHg", metric: vitalsSummary.systolic }), _jsx(MetricTile, { label: "Diastolic BP", unit: " mmHg", metric: vitalsSummary.diastolic }), _jsx(MetricTile, { label: "SpO2", unit: "%", metric: vitalsSummary.spo2 })] })] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(Sparkles, { size: 16, className: "analysis-header-icon" }), "Wellness indicator"] }), _jsx("p", { children: "Current lifestyle-based wellness signals from your profile" })] }) }), wellnessSnapshot.available ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "report-wellness-score", children: ["Overall wellness indicator:", " ", _jsx("strong", { children: wellnessSnapshot.overallWellnessScore }), " / 100"] }), _jsx("div", { className: "report-wellness-items", children: wellnessSnapshot.items.map((item) => (_jsxs("div", { className: "report-wellness-item", children: [_jsx("span", { children: item.label }), _jsx("span", { className: `risk-badge ${item.level}`, children: item.level })] }, item.key))) }), wellnessSnapshot.disclaimer && (_jsx("p", { className: "report-empty-note", children: wellnessSnapshot.disclaimer }))] })) : (_jsx("p", { className: "report-empty-note", children: "Not enough profile data was available to calculate a wellness indicator at generation time." }))] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(Pill, { size: 16, className: "analysis-header-icon" }), "Medications"] }), _jsx("p", { children: medicationsSummary.length === 0
                                        ? "No current medications on record"
                                        : `${medicationsSummary.length} current medication(s)` })] }) }), medicationsSummary.length > 0 ? (_jsx("div", { className: "report-profile-grid", children: medicationsSummary.map((med) => (_jsxs("div", { className: "report-profile-item full-width", children: [_jsx("span", { children: med.name }), _jsxs("strong", { children: [med.dosage, med.instructions ? ` — ${med.instructions}` : ""] })] }, med.id))) })) : (_jsx("p", { className: "report-empty-note", children: "Not available." }))] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(ClipboardCheck, { size: 16, className: "analysis-header-icon" }), "Medical documents / test reports"] }), _jsx("p", { children: documentsSummary.length === 0
                                        ? "No documents were attached to this report"
                                        : `${documentsSummary.length} document(s) attached` })] }) }), documentsSummary.length > 0 ? (_jsx("div", { className: "report-profile-grid", children: documentsSummary.map((doc) => (_jsxs("div", { className: "report-profile-item", children: [_jsx("span", { children: formatDate(doc.createdAt) }), _jsx("strong", { children: doc.name })] }, doc.id))) })) : (_jsx("p", { className: "report-empty-note", children: "Not available." }))] }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(ClipboardCheck, { size: 16, className: "analysis-header-icon" }), "Health analyses in this period"] }), _jsx("p", { children: analysesSummary.length === 0
                                        ? "No health analyses were recorded in this period"
                                        : `${analysesSummary.length} analysis/analyses in this period` })] }) }), analysesSummary.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "activity-list no-print", children: analysesSummary.map((entry) => (_jsxs(Link, { to: `/analysis?id=${entry.id}`, className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(ClipboardCheck, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: entry.concern }), _jsx("span", { children: formatDate(entry.createdAt) })] }), _jsx("span", { className: `risk-badge ${URGENCY_CLASS[entry.urgencyLevel]}`, children: entry.urgencyLevel })] }, entry.id))) }), _jsx("div", { className: "report-print-only", children: analysesSummary.map((entry) => (_jsxs("div", { className: "report-print-analysis-item", children: [_jsx("strong", { children: entry.concern }), _jsxs("span", { children: [formatDate(entry.createdAt), " \u00B7 ", entry.severity, " severity \u00B7", " ", entry.urgencyLevel] }), _jsx("p", { children: entry.summary })] }, entry.id))) })] }))] }), _jsx(AskHealthAI, { report: report }), _jsxs("div", { className: "analysis-disclaimer analysis-disclaimer-standalone", children: [_jsx(ShieldCheck, { size: 14 }), _jsx("span", { children: reportContent.disclaimer })] })] }));
};
const STEP_ORDER = [
    { key: "range", label: "Period" },
    { key: "followup", label: "Follow-up" },
    { key: "documents", label: "Documents" },
    { key: "review", label: "Generate" },
];
const GenerateWizard = ({ onGenerated, }) => {
    const [step, setStep] = useState("range");
    const [selectedRange, setSelectedRange] = useState("30d");
    const [questions, setQuestions] = useState([]);
    const [questionsLoaded, setQuestionsLoaded] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [documents, setDocuments] = useState([]);
    const [documentsLoaded, setDocumentsLoaded] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [selectedDocIds, setSelectedDocIds] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef(null);
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState("");
    const loadQuestions = async () => {
        if (questionsLoaded)
            return;
        try {
            setQuestionsLoading(true);
            const result = await getFollowUpQuestions();
            setQuestions(result);
            setQuestionsLoaded(true);
        }
        catch (error) {
            console.error("Failed to load follow-up questions:", error);
            setQuestionsLoaded(true);
        }
        finally {
            setQuestionsLoading(false);
        }
    };
    const loadDocuments = async () => {
        if (documentsLoaded)
            return;
        try {
            setDocumentsLoading(true);
            const result = await getDocuments();
            setDocuments(result);
            setDocumentsLoaded(true);
        }
        catch (error) {
            console.error("Failed to load medical vault documents:", error);
            setDocumentsLoaded(true);
        }
        finally {
            setDocumentsLoading(false);
        }
    };
    const goToStep = (next) => {
        if (next === "followup")
            loadQuestions();
        if (next === "documents")
            loadDocuments();
        setStep(next);
    };
    const selectAnswer = (question, value) => {
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
    const toggleDocument = (id) => {
        setSelectedDocIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file)
            return;
        try {
            setUploading(true);
            setUploadError("");
            const result = await uploadDocument(file);
            const uploaded = result.data;
            setDocuments((prev) => [uploaded, ...prev]);
            setSelectedDocIds((prev) => [...prev, uploaded.id]);
        }
        catch (error) {
            console.error("Failed to upload document:", error);
            setUploadError(error?.response?.data?.message ||
                "Unable to upload this document. Please try again.");
        }
        finally {
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
        }
        catch (error) {
            console.error("Failed to generate health report:", error);
            if (error?.response?.status === 503) {
                setGenerateError(error?.response?.data?.message ||
                    "The AI service is temporarily unavailable. Please try again in a moment.");
            }
            else {
                setGenerateError(error?.response?.data?.message ||
                    "Unable to generate a report right now. Please try again.");
            }
        }
        finally {
            setGenerating(false);
        }
    };
    const stepIndex = STEP_ORDER.findIndex((item) => item.key === step);
    const answeredCount = Object.keys(answers).length;
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(FileText, { size: 16, className: "analysis-header-icon" }), "Generate a comprehensive health report"] }), _jsx("p", { children: "Combines your profile, vitals, medications, analysis history and documents into one AI-generated educational report." })] }) }), _jsx("div", { className: "report-steps", children: STEP_ORDER.map((item, index) => (_jsxs("span", { className: `report-step-pill ${index === stepIndex
                        ? "active"
                        : index < stepIndex
                            ? "done"
                            : ""}`, children: [_jsx("span", { className: "report-step-index", children: index < stepIndex ? _jsx(Check, { size: 10 }) : index + 1 }), item.label] }, item.key))) }), step === "range" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "report-range-picker", children: REPORT_RANGE_OPTIONS.map((option) => (_jsx("button", { type: "button", className: `report-range-button ${selectedRange === option.value ? "active" : ""}`, onClick: () => setSelectedRange(option.value), children: option.label }, option.value))) }), _jsxs("div", { className: "report-wizard-nav", children: [_jsx("span", {}), _jsx("button", { type: "button", className: "profile-save-button", onClick: () => goToStep("followup"), children: "Next: Follow-up questions" })] })] })), step === "followup" && (_jsxs(_Fragment, { children: [questionsLoading ? (_jsx("p", { className: "report-empty-note", children: "Checking your medications and recent concerns..." })) : questions.length === 0 ? (_jsx("p", { className: "report-empty-note", children: "Nothing needs a follow-up check right now \u2014 you can continue." })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "report-empty-note", children: "These are optional \u2014 answer any that apply." }), questions.map((question) => {
                                const selected = answers[question.questionId]?.status;
                                return (_jsxs("div", { className: "followup-question-card", children: [_jsx("span", { className: "followup-question-tag", children: question.type === "medication" ? "Medication" : "Concern" }), _jsx("strong", { children: question.prompt }), _jsx("div", { className: "followup-question-options", children: question.options.map((option) => (_jsx("button", { type: "button", className: `followup-option-button ${selected === option.value ? "selected" : ""}`, onClick: () => selectAnswer(question, option.value), children: option.label }, option.value))) })] }, question.questionId));
                            })] })), _jsxs("div", { className: "report-wizard-nav", children: [_jsx("button", { type: "button", className: "profile-edit-button", onClick: () => goToStep("range"), children: "Back" }), _jsx("button", { type: "button", className: "profile-save-button", onClick: () => goToStep("documents"), children: "Next: Documents" })] })] })), step === "documents" && (_jsxs(_Fragment, { children: [_jsx("p", { className: "report-empty-note", children: "Optionally attach medical/test reports from your Medical Vault \u2014 reuses the same upload and OCR pipeline as your dashboard vault." }), documentsLoading ? (_jsx("p", { className: "report-empty-note", children: "Loading your Medical Vault..." })) : (_jsx("div", { className: "report-document-list", children: documents.map((doc) => (_jsxs("label", { className: "report-document-item", children: [_jsx("input", { type: "checkbox", checked: selectedDocIds.includes(doc.id), onChange: () => toggleDocument(doc.id) }), _jsxs("div", { className: "report-document-item-meta", children: [_jsx("strong", { children: doc.originalName }), _jsx("span", { children: doc.extractedText
                                                ? "Text extracted"
                                                : "No text extracted" })] })] }, doc.id))) })), uploadError && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), uploadError] })), _jsxs("button", { type: "button", className: "report-upload-button", onClick: () => fileInputRef.current?.click(), disabled: uploading, children: [_jsx(Upload, { size: 14 }), uploading ? "Uploading..." : "Add medical report"] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/png,image/jpg", onChange: handleUpload, hidden: true }), _jsxs("div", { className: "report-wizard-nav", children: [_jsx("button", { type: "button", className: "profile-edit-button", onClick: () => goToStep("followup"), children: "Back" }), _jsx("button", { type: "button", className: "profile-save-button", onClick: () => goToStep("review"), children: "Next: Review" })] })] })), step === "review" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "report-document-list", children: [_jsxs("div", { className: "report-document-item", children: [_jsx(ListChecks, { size: 16 }), _jsxs("div", { className: "report-document-item-meta", children: [_jsx("strong", { children: "Period" }), _jsx("span", { children: RANGE_LABEL[selectedRange] })] })] }), _jsxs("div", { className: "report-document-item", children: [_jsx(ListChecks, { size: 16 }), _jsxs("div", { className: "report-document-item-meta", children: [_jsx("strong", { children: "Follow-up answers" }), _jsxs("span", { children: [answeredCount, " answered"] })] })] }), _jsxs("div", { className: "report-document-item", children: [_jsx(ListChecks, { size: 16 }), _jsxs("div", { className: "report-document-item-meta", children: [_jsx("strong", { children: "Attached documents" }), _jsxs("span", { children: [selectedDocIds.length, " attached"] })] })] })] }), generateError && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), generateError] })), _jsxs("div", { className: "report-wizard-nav", children: [_jsx("button", { type: "button", className: "profile-edit-button", onClick: () => goToStep("documents"), disabled: generating, children: "Back" }), _jsxs("button", { type: "button", className: "profile-save-button", disabled: generating, onClick: handleGenerate, children: [_jsx(FileText, { size: 14 }), generating ? "Generating your report..." : "Generate report"] })] })] }))] }));
};
/* ============================================================
   PAGE
============================================================ */
const Reports = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportId = searchParams.get("id");
    const [reports, setReports] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [report, setReport] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    useEffect(() => {
        const loadReports = async () => {
            try {
                const result = await getHealthReports();
                setReports(result);
            }
            catch (error) {
                console.error("Failed to load health reports:", error);
                setListError("Unable to load your past reports right now.");
            }
            finally {
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
            }
            catch (error) {
                console.error("Failed to load health report:", error);
                setDetailError("This report could not be found. It may have been removed.");
            }
            finally {
                setDetailLoading(false);
            }
        };
        loadReport();
    }, [reportId]);
    const handleGenerated = (result) => {
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
            return (_jsx("div", { className: "profile-page", children: _jsx("div", { className: "glass-card profile-loading", children: "Loading your report..." }) }));
        }
        if (detailError || !report) {
            return (_jsxs("div", { className: "profile-page", children: [_jsxs("div", { className: "glass-card profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), detailError] }), _jsx("button", { type: "button", className: "profile-edit-button analysis-inline-button", onClick: () => navigate("/reports"), children: "Back to reports" })] }));
        }
        return (_jsxs("div", { className: "profile-page", children: [_jsx(Link, { to: "/reports", className: "report-back-link no-print", children: "\u2190 Back to reports" }), _jsx(ReportDetail, { report: report })] }));
    }
    return (_jsxs("div", { className: "profile-page", children: [_jsx(GenerateWizard, { onGenerated: handleGenerated }), _jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Your reports" }), _jsx("p", { children: "Previously generated reports" })] }) }), listLoading ? (_jsx("p", { className: "report-empty-note", children: "Loading your reports..." })) : listError ? (_jsx("p", { className: "report-empty-note", children: listError })) : reports.length === 0 ? (_jsx("p", { className: "report-empty-note", children: "You haven't generated any reports yet. Use the steps above to generate your first one." })) : (_jsx("div", { className: "activity-list", children: reports.map((entry) => (_jsxs(Link, { to: `/reports?id=${entry.id}`, className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(FileText, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: RANGE_LABEL[entry.rangeKey] }), _jsx("span", { children: formatDateTime(entry.createdAt) })] })] }, entry.id))) }))] }), _jsxs("div", { className: "report-empty-note", children: [_jsx(Info, { size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }), "Reports are educational summaries of information already in your account. They do not replace professional medical advice."] })] }));
};
export default Reports;
