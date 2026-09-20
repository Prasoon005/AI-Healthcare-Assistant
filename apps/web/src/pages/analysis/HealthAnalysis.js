import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, BellRing, Camera, ClipboardCheck, ImageIcon, Info, MapPin, ShieldCheck, Sparkles, Stethoscope, ThumbsDown, ThumbsUp, X, } from "lucide-react";
import { createHealthAnalysis, getAnalysisHistory, getHealthAnalysis, submitAnalysisFeedback, } from "../../api/analysis";
import { getHealthProfile, } from "../../api/profile";
const DURATION_OPTIONS = [
    { value: "less_than_a_day", label: "Less than a day" },
    { value: "a_few_days", label: "A few days" },
    { value: "about_a_week", label: "About a week" },
    { value: "several_weeks", label: "Several weeks" },
    { value: "a_month_or_more", label: "A month or more" },
];
const SEVERITY_OPTIONS = [
    { value: "mild", label: "Mild" },
    { value: "moderate", label: "Moderate" },
    { value: "severe", label: "Severe" },
];
const URGENCY_CLASS = {
    routine: "low",
    soon: "moderate",
    urgent: "high",
};
const URGENCY_COPY = {
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
const formatEntryDate = (isoDate) => {
    const date = new Date(isoDate);
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days <= 0)
        return "Today";
    if (days === 1)
        return "Yesterday";
    if (days < 7)
        return `${days} days ago`;
    return date.toLocaleDateString();
};
const findNearbyHospitals = () => {
    const fallback = () => window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    if (!navigator.geolocation) {
        fallback();
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},14z`, "_blank");
    }, () => fallback(), { timeout: 8000 });
};
const emptyForm = {
    concern: "",
    duration: "",
    severity: "",
    additionalContext: "",
};
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const profileHighlights = (profile) => {
    if (!profile)
        return [];
    const parts = [];
    if (profile.age !== null)
        parts.push(`${profile.age} yrs`);
    if (profile.gender)
        parts.push(profile.gender.toLowerCase().replace(/_/g, " "));
    if (profile.smoking !== null)
        parts.push(profile.smoking ? "smoker" : "non-smoker");
    if (profile.exerciseDays !== null)
        parts.push(`${profile.exerciseDays} exercise days/wk`);
    if (profile.sleepHours !== null)
        parts.push(`${profile.sleepHours}h sleep`);
    if (profile.medicalConditions)
        parts.push("existing conditions on file");
    if (profile.medications)
        parts.push("current medications on file");
    return parts;
};
const AnalysisList = ({ title, items, }) => {
    if (items.length === 0)
        return null;
    return (_jsxs("div", { className: "analysis-block", children: [_jsx("h4", { children: title }), _jsx("ul", { className: "analysis-list", children: items.map((item, index) => (_jsx("li", { children: item }, index))) })] }));
};
const AnalysisResultView = ({ analysis, onNewAnalysis, }) => {
    const result = analysis.aiResult;
    const levelClass = URGENCY_CLASS[analysis.urgencyLevel];
    const copy = URGENCY_COPY[analysis.urgencyLevel];
    const [helpful, setHelpful] = useState(analysis.helpful);
    const [feedbackSaving, setFeedbackSaving] = useState(false);
    useEffect(() => {
        setHelpful(analysis.helpful);
    }, [analysis.id, analysis.helpful]);
    const handleFeedback = async (value) => {
        if (feedbackSaving || helpful === value)
            return;
        try {
            setFeedbackSaving(true);
            await submitAnalysisFeedback(analysis.id, value);
            setHelpful(value);
        }
        catch (error) {
            console.error("Failed to submit feedback:", error);
        }
        finally {
            setFeedbackSaving(false);
        }
    };
    return (_jsxs("div", { className: "glass-card analysis-result-card", children: [_jsxs("div", { className: `analysis-urgency-banner ${levelClass}`, children: [_jsx(AlertTriangle, { size: 18 }), _jsxs("div", { children: [_jsx("strong", { children: copy.title }), _jsx("p", { children: copy.body })] })] }), (analysis.urgencyLevel === "soon" ||
                analysis.urgencyLevel === "urgent") && (_jsxs("div", { className: "analysis-followup-actions", children: [_jsxs("button", { type: "button", className: "analysis-hospital-button", onClick: findNearbyHospitals, children: [_jsx(MapPin, { size: 14 }), "Find hospitals near me"] }), _jsxs("div", { className: "analysis-reminder-note", children: [_jsx(BellRing, { size: 13 }), _jsx("span", { children: "A follow-up reminder was added to your dashboard." })] })] })), _jsxs("div", { className: "profile-section-header", children: [_jsxs("div", { children: [_jsx("h3", { children: "Your health analysis" }), _jsxs("p", { children: [new Date(analysis.createdAt).toLocaleString(), " \u00B7", " ", analysis.severity, " severity"] })] }), _jsx("button", { type: "button", className: "profile-edit-button", onClick: onNewAnalysis, children: "New analysis" })] }), _jsxs("div", { className: "analysis-block", children: [_jsx("h4", { children: "Summary" }), _jsx("p", { children: result.summary })] }), analysis.hasPhoto && (_jsxs("div", { className: "analysis-photo-note", children: [_jsx(ImageIcon, { size: 13 }), _jsx("span", { children: "A photo was included and considered in this analysis." })] })), _jsx(AnalysisList, { title: "Things to consider", items: result.considerations }), _jsx(AnalysisList, { title: "General guidance", items: result.generalGuidance }), result.selfCareMeasures.length > 0 && (_jsxs("div", { className: "analysis-block", children: [_jsx("h4", { children: "Self-care measures" }), _jsx("ul", { className: "analysis-list", children: result.selfCareMeasures.map((item, index) => (_jsx("li", { children: item }, index))) }), _jsx("p", { className: "analysis-selfcare-caveat", children: "General ideas only, not a prescription \u2014 check with a pharmacist or doctor before starting anything new, especially alongside existing conditions or medications." })] })), _jsx(AnalysisList, { title: "Things to monitor", items: result.thingsToMonitor }), _jsx(AnalysisList, { title: "When to seek care", items: result.whenToSeekCare }), _jsx(AnalysisList, { title: "Questions for your doctor", items: result.questionsForDoctor }), _jsxs("div", { className: "analysis-feedback", children: [_jsx("span", { children: "Was this analysis helpful?" }), _jsxs("div", { className: "analysis-feedback-buttons", children: [_jsxs("button", { type: "button", className: `analysis-feedback-button ${helpful === true ? "active" : ""}`, disabled: feedbackSaving, onClick: () => handleFeedback(true), children: [_jsx(ThumbsUp, { size: 14 }), "Yes"] }), _jsxs("button", { type: "button", className: `analysis-feedback-button ${helpful === false ? "active" : ""}`, disabled: feedbackSaving, onClick: () => handleFeedback(false), children: [_jsx(ThumbsDown, { size: 14 }), "No"] })] }), helpful !== null && (_jsx("span", { className: "analysis-feedback-thanks", children: "Thanks \u2014 this helps refine your future analyses." }))] }), _jsxs("div", { className: "analysis-disclaimer", children: [_jsx(ShieldCheck, { size: 14 }), _jsx("span", { children: result.disclaimer })] })] }));
};
const HealthAnalysis = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const analysisId = searchParams.get("id");
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [mode, setMode] = useState(analysisId ? "loading" : "form");
    const [loadError, setLoadError] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [aiUnavailable, setAiUnavailable] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoError, setPhotoError] = useState("");
    const fileInputRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    useEffect(() => {
        return () => {
            if (photoPreview)
                URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview]);
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const result = await getAnalysisHistory();
                setHistory(result);
            }
            catch (error) {
                console.error("Failed to load analysis history:", error);
            }
            finally {
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
            }
            catch (error) {
                console.error("Failed to load health profile:", error);
            }
            finally {
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
            }
            catch (error) {
                console.error("Failed to load health analysis:", error);
                setLoadError("This analysis could not be found. It may have been removed.");
                setMode("load-error");
            }
        };
        loadAnalysis();
    }, [analysisId]);
    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file)
            return;
        setPhotoError("");
        if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
            setPhotoError("Please choose a JPG, PNG or WEBP image.");
            return;
        }
        if (file.size > MAX_PHOTO_SIZE) {
            setPhotoError("Photo must be 5MB or smaller.");
            return;
        }
        if (photoPreview)
            URL.revokeObjectURL(photoPreview);
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };
    const removePhoto = () => {
        if (photoPreview)
            URL.revokeObjectURL(photoPreview);
        setPhoto(null);
        setPhotoPreview(null);
        setPhotoError("");
    };
    const validate = () => {
        const nextErrors = {};
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0)
            return;
        try {
            setSubmitting(true);
            setSubmitError("");
            setAiUnavailable(false);
            const result = await createHealthAnalysis({
                concern: form.concern.trim(),
                duration: form.duration,
                severity: form.severity,
                additionalContext: form.additionalContext.trim() || undefined,
                photo: photo ?? undefined,
            });
            setAnalysis(result);
            setMode("result");
            setHistory((prev) => [result, ...prev]);
            navigate(`/analysis?id=${result.id}`, { replace: true });
        }
        catch (error) {
            console.error("Failed to create health analysis:", error);
            if (error?.response?.status === 503) {
                setAiUnavailable(true);
                setSubmitError(error?.response?.data?.message ||
                    "The AI service is temporarily unavailable. Please try again in a moment.");
            }
            else {
                setSubmitError(error?.response?.data?.message ||
                    "Unable to generate your analysis. Please try again.");
            }
        }
        finally {
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
        return (_jsx("div", { className: "profile-page", children: _jsx("div", { className: "glass-card profile-loading", children: "Loading your analysis..." }) }));
    }
    if (mode === "load-error") {
        return (_jsxs("div", { className: "profile-page", children: [_jsxs("div", { className: "glass-card profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), loadError] }), _jsx("button", { type: "button", className: "profile-edit-button analysis-inline-button", onClick: startNewAnalysis, children: "Start a new analysis" })] }));
    }
    if (mode === "result" && analysis) {
        return (_jsx("div", { className: "profile-page", children: _jsx(AnalysisResultView, { analysis: analysis, onNewAnalysis: startNewAnalysis }) }));
    }
    const highlights = profileHighlights(profile);
    return (_jsxs("div", { className: "profile-page", children: [_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(ClipboardCheck, { size: 16, className: "analysis-header-icon" }), "Health analysis"] }), _jsx("p", { children: "Answer a few questions for an educational overview of your concern." })] }) }), _jsxs("div", { className: "analysis-profile-note", children: [_jsx(Sparkles, { size: 14 }), profileLoading ? (_jsx("span", { children: "Loading your health profile..." })) : highlights.length > 0 ? (_jsxs("span", { children: ["Personalizing with your profile: ", highlights.join(", "), ".", " ", _jsx(Link, { to: "/profile", children: "Update profile" })] })) : (_jsxs("span", { children: ["No health profile details on file yet.", " ", _jsx(Link, { to: "/profile", children: "Add your profile" }), " for more personalized results (optional)."] }))] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "concern", children: "What's the concern?" }), _jsx("textarea", { id: "concern", value: form.concern, onChange: (e) => updateField("concern", e.target.value), placeholder: "e.g. Dull headache behind my eyes for the past two days", maxLength: 500, className: errors.concern ? "field-error" : "" }), errors.concern && (_jsx("span", { className: "profile-field-error", children: errors.concern }))] }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "duration", children: "How long has this been going on?" }), _jsxs("select", { id: "duration", value: form.duration, onChange: (e) => updateField("duration", e.target.value), className: errors.duration ? "field-error" : "", children: [_jsx("option", { value: "", children: "Select duration" }), DURATION_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), errors.duration && (_jsx("span", { className: "profile-field-error", children: errors.duration }))] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "severity", children: "How severe does it feel?" }), _jsxs("select", { id: "severity", value: form.severity, onChange: (e) => updateField("severity", e.target.value), className: errors.severity ? "field-error" : "", children: [_jsx("option", { value: "", children: "Select severity" }), SEVERITY_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), errors.severity && (_jsx("span", { className: "profile-field-error", children: errors.severity }))] })] }), _jsxs("div", { className: "profile-field full-width", children: [_jsxs("label", { htmlFor: "additionalContext", children: ["Anything else relevant?", " ", _jsx("span", { className: "optional-tag", children: "(optional)" })] }), _jsx("textarea", { id: "additionalContext", value: form.additionalContext, onChange: (e) => updateField("additionalContext", e.target.value), placeholder: "e.g. Associated symptoms, what makes it better or worse", maxLength: 500 })] }), _jsxs("div", { className: "profile-field full-width", children: [_jsxs("label", { children: ["Add a photo ", _jsx("span", { className: "optional-tag", children: "(optional)" })] }), photoPreview ? (_jsxs("div", { className: "analysis-photo-preview", children: [_jsx("img", { src: photoPreview, alt: "Selected concern" }), _jsx("button", { type: "button", className: "analysis-photo-remove", onClick: removePhoto, "aria-label": "Remove photo", children: _jsx(X, { size: 14 }) })] })) : (_jsxs("button", { type: "button", className: "analysis-photo-picker", onClick: () => fileInputRef.current?.click(), children: [_jsx(Camera, { size: 16 }), "Attach a photo (e.g. a rash, swelling, or injury)"] })), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/png,image/webp", onChange: handlePhotoSelect, hidden: true }), photoError && (_jsx("span", { className: "profile-field-error", children: photoError }))] }), submitError && (_jsxs("div", { className: aiUnavailable
                                    ? "analysis-ai-unavailable"
                                    : "profile-error-banner", children: [aiUnavailable ? _jsx(Info, { size: 16 }) : _jsx(AlertTriangle, { size: 16 }), submitError] })), _jsx("div", { className: "profile-actions-bar", children: _jsxs("button", { type: "submit", className: "profile-save-button", disabled: submitting, children: [_jsx(Stethoscope, { size: 14 }), submitting ? "Analyzing..." : "Analyze"] }) })] })] }), !historyLoading && history.length > 0 && (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsx("h3", { children: "Your recent analyses" }), _jsx("p", { children: "Select one to view its full result" })] }) }), _jsx("div", { className: "activity-list", children: history.slice(0, 10).map((entry) => (_jsxs(Link, { to: `/analysis?id=${entry.id}`, className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(ClipboardCheck, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: entry.concern.length > 70
                                                ? `${entry.concern.slice(0, 70)}…`
                                                : entry.concern }), _jsx("span", { children: formatEntryDate(entry.createdAt) })] }), _jsx("span", { className: `risk-badge ${URGENCY_CLASS[entry.urgencyLevel]}`, children: entry.urgencyLevel })] }, entry.id))) })] })), _jsxs("div", { className: "analysis-disclaimer analysis-disclaimer-standalone", children: [_jsx(ShieldCheck, { size: 14 }), _jsx("span", { children: "This tool provides educational health information only and does not replace professional medical advice, diagnosis, or treatment. If you think you may have a medical emergency, contact emergency services immediately." })] })] }));
};
export default HealthAnalysis;
