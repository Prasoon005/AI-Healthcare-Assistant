import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BellRing,
  Camera,
  ClipboardCheck,
  ImageIcon,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

import {
  createHealthAnalysis,
  getAnalysisHistory,
  getHealthAnalysis,
  submitAnalysisFeedback,
  type AIAnalysisResult,
  type AnalysisDuration,
  type AnalysisSeverity,
  type HealthAnalysis as HealthAnalysisData,
  type UrgencyLevel,
} from "../../api/analysis";

import {
  getHealthProfile,
  type HealthProfile,
} from "../../api/profile";

const DURATION_OPTIONS: { value: AnalysisDuration; label: string }[] = [
  { value: "less_than_a_day", label: "Less than a day" },
  { value: "a_few_days", label: "A few days" },
  { value: "about_a_week", label: "About a week" },
  { value: "several_weeks", label: "Several weeks" },
  { value: "a_month_or_more", label: "A month or more" },
];

const SEVERITY_OPTIONS: { value: AnalysisSeverity; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const URGENCY_CLASS: Record<UrgencyLevel, "low" | "moderate" | "high"> = {
  routine: "low",
  soon: "moderate",
  urgent: "high",
};

const URGENCY_COPY: Record<UrgencyLevel, { title: string; body: string }> = {
  routine: {
    title: "No urgent signs identified",
    body: "Based on what you shared, this looks like something you can keep an eye on and discuss at a routine visit if it continues.",
  },
  soon: {
    title: "Worth addressing soon",
    body: "Consider checking in with a healthcare professional in the near future about this.",
  },
  urgent: {
    title: "May need prompt care",
    body: "Please consider contacting a healthcare professional or emergency services promptly rather than waiting.",
  },
};

const formatEntryDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
};

const findNearbyHospitals = () => {
  const fallback = () =>
    window.open(
      "https://www.google.com/maps/search/hospitals+near+me",
      "_blank"
    );

  if (!navigator.geolocation) {
    fallback();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      window.open(
        `https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},14z`,
        "_blank"
      );
    },
    () => fallback(),
    { timeout: 8000 }
  );
};

interface FormState {
  concern: string;
  duration: AnalysisDuration | "";
  severity: AnalysisSeverity | "";
  additionalContext: string;
}

const emptyForm: FormState = {
  concern: "",
  duration: "",
  severity: "",
  additionalContext: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const profileHighlights = (profile: HealthProfile | null): string[] => {
  if (!profile) return [];

  const parts: string[] = [];

  if (profile.age !== null) parts.push(`${profile.age} yrs`);
  if (profile.gender) parts.push(profile.gender.toLowerCase().replace(/_/g, " "));
  if (profile.smoking !== null)
    parts.push(profile.smoking ? "smoker" : "non-smoker");
  if (profile.exerciseDays !== null)
    parts.push(`${profile.exerciseDays} exercise days/wk`);
  if (profile.sleepHours !== null) parts.push(`${profile.sleepHours}h sleep`);
  if (profile.medicalConditions) parts.push("existing conditions on file");
  if (profile.medications) parts.push("current medications on file");

  return parts;
};

const AnalysisList = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => {
  if (items.length === 0) return null;

  return (
    <div className="analysis-block">
      <h4>{title}</h4>
      <ul className="analysis-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const AnalysisResultView = ({
  analysis,
  onNewAnalysis,
}: {
  analysis: HealthAnalysisData;
  onNewAnalysis: () => void;
}) => {
  const result: AIAnalysisResult = analysis.aiResult;
  const levelClass = URGENCY_CLASS[analysis.urgencyLevel];
  const copy = URGENCY_COPY[analysis.urgencyLevel];

  const [helpful, setHelpful] = useState(analysis.helpful);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  useEffect(() => {
    setHelpful(analysis.helpful);
  }, [analysis.id, analysis.helpful]);

  const handleFeedback = async (value: boolean) => {
    if (feedbackSaving || helpful === value) return;

    try {
      setFeedbackSaving(true);
      await submitAnalysisFeedback(analysis.id, value);
      setHelpful(value);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setFeedbackSaving(false);
    }
  };

  return (
    <div className="glass-card analysis-result-card">
      <div className={`analysis-urgency-banner ${levelClass}`}>
        <AlertTriangle size={18} />
        <div>
          <strong>{copy.title}</strong>
          <p>{copy.body}</p>
        </div>
      </div>

      {(analysis.urgencyLevel === "soon" ||
        analysis.urgencyLevel === "urgent") && (
        <div className="analysis-followup-actions">
          <button
            type="button"
            className="analysis-hospital-button"
            onClick={findNearbyHospitals}
          >
            <MapPin size={14} />
            Find hospitals near me
          </button>

          <div className="analysis-reminder-note">
            <BellRing size={13} />
            <span>
              A follow-up reminder was added to your dashboard.
            </span>
          </div>
        </div>
      )}

      <div className="profile-section-header">
        <div>
          <h3>Your health analysis</h3>
          <p>
            {new Date(analysis.createdAt).toLocaleString()} ·{" "}
            {analysis.severity} severity
          </p>
        </div>

        <button
          type="button"
          className="profile-edit-button"
          onClick={onNewAnalysis}
        >
          New analysis
        </button>
      </div>

      <div className="analysis-block">
        <h4>Summary</h4>
        <p>{result.summary}</p>
      </div>

      {analysis.hasPhoto && (
        <div className="analysis-photo-note">
          <ImageIcon size={13} />
          <span>A photo was included and considered in this analysis.</span>
        </div>
      )}

      <AnalysisList title="Things to consider" items={result.considerations} />
      <AnalysisList title="General guidance" items={result.generalGuidance} />

      {result.selfCareMeasures.length > 0 && (
        <div className="analysis-block">
          <h4>Self-care measures</h4>
          <ul className="analysis-list">
            {result.selfCareMeasures.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="analysis-selfcare-caveat">
            General ideas only, not a prescription — check with a pharmacist
            or doctor before starting anything new, especially alongside
            existing conditions or medications.
          </p>
        </div>
      )}

      <AnalysisList title="Things to monitor" items={result.thingsToMonitor} />
      <AnalysisList title="When to seek care" items={result.whenToSeekCare} />
      <AnalysisList
        title="Questions for your doctor"
        items={result.questionsForDoctor}
      />

      <div className="analysis-feedback">
        <span>Was this analysis helpful?</span>

        <div className="analysis-feedback-buttons">
          <button
            type="button"
            className={`analysis-feedback-button ${
              helpful === true ? "active" : ""
            }`}
            disabled={feedbackSaving}
            onClick={() => handleFeedback(true)}
          >
            <ThumbsUp size={14} />
            Yes
          </button>

          <button
            type="button"
            className={`analysis-feedback-button ${
              helpful === false ? "active" : ""
            }`}
            disabled={feedbackSaving}
            onClick={() => handleFeedback(false)}
          >
            <ThumbsDown size={14} />
            No
          </button>
        </div>

        {helpful !== null && (
          <span className="analysis-feedback-thanks">
            Thanks — this helps refine your future analyses.
          </span>
        )}
      </div>

      <div className="analysis-disclaimer">
        <ShieldCheck size={14} />
        <span>{result.disclaimer}</span>
      </div>
    </div>
  );
};

const HealthAnalysis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const analysisId = searchParams.get("id");

  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [mode, setMode] = useState<"form" | "loading" | "load-error" | "result">(
    analysisId ? "loading" : "form"
  );
  const [loadError, setLoadError] = useState("");
  const [analysis, setAnalysis] = useState<HealthAnalysisData | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HealthAnalysisData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await getAnalysisHistory();
        setHistory(result);
      } catch (error) {
        console.error("Failed to load analysis history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const result = await getHealthProfile();
        setProfile(result.profile);
      } catch (error) {
        console.error("Failed to load health profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!analysisId) {
      setMode("form");
      setAnalysis(null);
      return;
    }

    const loadAnalysis = async () => {
      try {
        setMode("loading");
        setLoadError("");

        const result = await getHealthAnalysis(analysisId);

        setAnalysis(result);
        setMode("result");
      } catch (error) {
        console.error("Failed to load health analysis:", error);
        setLoadError(
          "This analysis could not be found. It may have been removed."
        );
        setMode("load-error");
      }
    };

    loadAnalysis();
  }, [analysisId]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    setPhotoError("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Photo must be 5MB or smaller.");
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError("");
  };

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (form.concern.trim().length < 3) {
      nextErrors.concern =
        "Describe your concern in a few more words.";
    }

    if (!form.duration) {
      nextErrors.duration = "Select how long this has been going on.";
    }

    if (!form.severity) {
      nextErrors.severity = "Select how severe it feels.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setSubmitting(true);
      setSubmitError("");
      setAiUnavailable(false);

      const result = await createHealthAnalysis({
        concern: form.concern.trim(),
        duration: form.duration as AnalysisDuration,
        severity: form.severity as AnalysisSeverity,
        additionalContext: form.additionalContext.trim() || undefined,
        photo: photo ?? undefined,
      });

      setAnalysis(result);
      setMode("result");
      setHistory((prev) => [result, ...prev]);
      navigate(`/analysis?id=${result.id}`, { replace: true });
    } catch (error: any) {
      console.error("Failed to create health analysis:", error);

      if (error?.response?.status === 503) {
        setAiUnavailable(true);
        setSubmitError(
          error?.response?.data?.message ||
            "The AI service is temporarily unavailable. Please try again in a moment."
        );
      } else {
        setSubmitError(
          error?.response?.data?.message ||
            "Unable to generate your analysis. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startNewAnalysis = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitError("");
    setAiUnavailable(false);
    removePhoto();
    navigate("/analysis");
  };

  if (mode === "loading") {
    return (
      <div className="profile-page">
        <div className="glass-card profile-loading">
          Loading your analysis...
        </div>
      </div>
    );
  }

  if (mode === "load-error") {
    return (
      <div className="profile-page">
        <div className="glass-card profile-error-banner">
          <AlertTriangle size={16} />
          {loadError}
        </div>

        <button
          type="button"
          className="profile-edit-button analysis-inline-button"
          onClick={startNewAnalysis}
        >
          Start a new analysis
        </button>
      </div>
    );
  }

  if (mode === "result" && analysis) {
    return (
      <div className="profile-page">
        <AnalysisResultView
          analysis={analysis}
          onNewAnalysis={startNewAnalysis}
        />
      </div>
    );
  }

  const highlights = profileHighlights(profile);

  return (
    <div className="profile-page">
      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <ClipboardCheck size={16} className="analysis-header-icon" />
              Health analysis
            </h3>
            <p>
              Answer a few questions for an educational overview of your
              concern.
            </p>
          </div>
        </div>

        <div className="analysis-profile-note">
          <Sparkles size={14} />
          {profileLoading ? (
            <span>Loading your health profile...</span>
          ) : highlights.length > 0 ? (
            <span>
              Personalizing with your profile: {highlights.join(", ")}.{" "}
              <Link to="/profile">Update profile</Link>
            </span>
          ) : (
            <span>
              No health profile details on file yet.{" "}
              <Link to="/profile">Add your profile</Link> for more
              personalized results (optional).
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-field full-width">
            <label htmlFor="concern">What's the concern?</label>
            <textarea
              id="concern"
              value={form.concern}
              onChange={(e) => updateField("concern", e.target.value)}
              placeholder="e.g. Dull headache behind my eyes for the past two days"
              maxLength={500}
              className={errors.concern ? "field-error" : ""}
            />
            {errors.concern && (
              <span className="profile-field-error">{errors.concern}</span>
            )}
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="duration">
                How long has this been going on?
              </label>
              <select
                id="duration"
                value={form.duration}
                onChange={(e) =>
                  updateField(
                    "duration",
                    e.target.value as AnalysisDuration
                  )
                }
                className={errors.duration ? "field-error" : ""}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duration && (
                <span className="profile-field-error">
                  {errors.duration}
                </span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="severity">How severe does it feel?</label>
              <select
                id="severity"
                value={form.severity}
                onChange={(e) =>
                  updateField(
                    "severity",
                    e.target.value as AnalysisSeverity
                  )
                }
                className={errors.severity ? "field-error" : ""}
              >
                <option value="">Select severity</option>
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.severity && (
                <span className="profile-field-error">
                  {errors.severity}
                </span>
              )}
            </div>
          </div>

          <div className="profile-field full-width">
            <label htmlFor="additionalContext">
              Anything else relevant?{" "}
              <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="additionalContext"
              value={form.additionalContext}
              onChange={(e) =>
                updateField("additionalContext", e.target.value)
              }
              placeholder="e.g. Associated symptoms, what makes it better or worse"
              maxLength={500}
            />
          </div>

          <div className="profile-field full-width">
            <label>
              Add a photo <span className="optional-tag">(optional)</span>
            </label>

            {photoPreview ? (
              <div className="analysis-photo-preview">
                <img src={photoPreview} alt="Selected concern" />
                <button
                  type="button"
                  className="analysis-photo-remove"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="analysis-photo-picker"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
                Attach a photo (e.g. a rash, swelling, or injury)
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              hidden
            />

            {photoError && (
              <span className="profile-field-error">{photoError}</span>
            )}
          </div>

          {submitError && (
            <div
              className={
                aiUnavailable
                  ? "analysis-ai-unavailable"
                  : "profile-error-banner"
              }
            >
              {aiUnavailable ? <Info size={16} /> : <AlertTriangle size={16} />}
              {submitError}
            </div>
          )}

          <div className="profile-actions-bar">
            <button
              type="submit"
              className="profile-save-button"
              disabled={submitting}
            >
              <Stethoscope size={14} />
              {submitting ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </form>
      </div>

      {!historyLoading && history.length > 0 && (
        <div className="glass-card profile-section">
          <div className="profile-section-header">
            <div>
              <h3>Your recent analyses</h3>
              <p>Select one to view its full result</p>
            </div>
          </div>

          <div className="activity-list">
            {history.slice(0, 10).map((entry) => (
              <Link
                key={entry.id}
                to={`/analysis?id=${entry.id}`}
                className="activity-item"
              >
                <div className="activity-item-icon">
                  <ClipboardCheck size={17} />
                </div>

                <div className="activity-item-content">
                  <strong>
                    {entry.concern.length > 70
                      ? `${entry.concern.slice(0, 70)}…`
                      : entry.concern}
                  </strong>
                  <span>{formatEntryDate(entry.createdAt)}</span>
                </div>

                <span
                  className={`risk-badge ${
                    URGENCY_CLASS[entry.urgencyLevel]
                  }`}
                >
                  {entry.urgencyLevel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-disclaimer analysis-disclaimer-standalone">
        <ShieldCheck size={14} />
        <span>
          This tool provides educational health information only and does
          not replace professional medical advice, diagnosis, or treatment.
          If you think you may have a medical emergency, contact emergency
          services immediately.
        </span>
      </div>
    </div>
  );
};

export default HealthAnalysis;
