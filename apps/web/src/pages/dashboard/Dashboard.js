import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, CalendarDays, ClipboardCheck, Info, ShieldCheck, Sparkles, UserRound, Search, Droplets, } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHealthProfile } from "../../api/profile";
import { getRiskMatrix } from "../../api/risk";
import { getAnalysisHistory, runQuickSymptomCheck, } from "../../api/analysis";
import MedicationReminder from "./MedicationReminder";
import VitalsCard from "./VitalsCard";
import RiskMatrix from "./RiskMatrix";
import EmergencyCard from "./EmergencyCard";
import MedicalVault from "./MedicalVault";
import DailyPlanner from "./DailyPlanner";
import FollowUpReminders from "./FollowUpReminders";
const Dashboard = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(" ")[0] || "there";
    const [water, setWater] = useState(0);
    const [symptom, setSymptom] = useState("");
    const [profileCompletion, setProfileCompletion] = useState(null);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [analysisLoading, setAnalysisLoading] = useState(true);
    const latestAnalysis = analysisHistory[0] ?? null;
    const [wellnessScore, setWellnessScore] = useState(null);
    const [wellnessLoading, setWellnessLoading] = useState(true);
    const [quickCheckStatus, setQuickCheckStatus] = useState("idle");
    const [quickCheckResult, setQuickCheckResult] = useState(null);
    useEffect(() => {
        const loadProfileCompletion = async () => {
            try {
                const result = await getHealthProfile();
                setProfileCompletion(result.completion);
            }
            catch (error) {
                console.error("Failed to load profile completion:", error);
            }
        };
        const loadAnalysisHistory = async () => {
            try {
                const result = await getAnalysisHistory();
                setAnalysisHistory(result);
            }
            catch (error) {
                console.error("Failed to load analysis history:", error);
            }
            finally {
                setAnalysisLoading(false);
            }
        };
        const loadWellnessScore = async () => {
            try {
                const result = await getRiskMatrix();
                setWellnessScore(result.overallWellnessScore);
            }
            catch (error) {
                console.error("Failed to load wellness score:", error);
            }
            finally {
                setWellnessLoading(false);
            }
        };
        loadProfileCompletion();
        loadAnalysisHistory();
        loadWellnessScore();
    }, []);
    const formatRelativeDate = (isoDate) => {
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
    const URGENCY_STATUS_LABEL = {
        routine: "Routine",
        soon: "Check in soon",
        urgent: "Seek care promptly",
    };
    const hour = new Date().getHours();
    const timeOfDayGreeting = hour < 12
        ? "Good morning"
        : hour < 18
            ? "Good afternoon"
            : "Good evening";
    const greetingMessages = [
        { text: `Hello, ${firstName}`, emoji: "👋" },
        { text: timeOfDayGreeting, emoji: hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙" },
        { text: "How can we help you today?", emoji: "💬" },
    ];
    const [greetingIndex, setGreetingIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setGreetingIndex((prev) => (prev + 1) % greetingMessages.length);
        }, 3200);
        return () => clearInterval(interval);
    }, [greetingMessages.length]);
    const dailyTip = hour < 12
        ? "Start your day with enough water and a balanced breakfast."
        : hour < 18
            ? "Take a short movement break and stay hydrated."
            : "Wind down early and give your body enough time to rest.";
    const checkSymptom = async (e) => {
        e.preventDefault();
        const trimmed = symptom.trim();
        if (!trimmed || quickCheckStatus === "checking")
            return;
        try {
            setQuickCheckStatus("checking");
            setQuickCheckResult(null);
            const result = await runQuickSymptomCheck(trimmed);
            setQuickCheckResult(result);
            setQuickCheckStatus(result.needsFullAnalysis ? "needs-more" : "result");
        }
        catch (error) {
            console.error("Quick symptom check failed:", error);
            setQuickCheckStatus("error");
        }
    };
    const resetQuickCheck = () => {
        setSymptom("");
        setQuickCheckStatus("idle");
        setQuickCheckResult(null);
    };
    const QUICK_URGENCY_CLASS = {
        routine: "low",
        soon: "moderate",
        urgent: "high",
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "ai-tip glass-card", children: [_jsx("div", { className: "tip-icon", children: _jsx(Sparkles, { size: 17 }) }), _jsxs("div", { children: [_jsx("span", { children: "Daily AI insight" }), _jsx("p", { children: dailyTip })] })] }), _jsxs("section", { className: "welcome-section", children: [_jsx("p", { children: "Good to see you" }), _jsxs("h1", { className: "animated-greeting", children: [greetingMessages[greetingIndex].text, _jsx("span", { children: greetingMessages[greetingIndex].emoji })] }, greetingIndex), _jsxs("div", { className: "welcome-meta", children: [_jsxs("span", { children: [_jsx(ShieldCheck, { size: 15 }), "Your private health space"] }), _jsxs("span", { children: [_jsx(Activity, { size: 15 }), "Personalized insights"] })] })] }), _jsxs("section", { className: "analysis-hero glass-dark", children: [_jsx("div", { className: "hero-glow" }), _jsxs("div", { className: "hero-content", children: [_jsx("div", { className: "hero-icon", children: _jsx(ClipboardCheck, { size: 22 }) }), _jsx("p", { className: "hero-label", children: "PERSONAL HEALTH ANALYSIS" }), _jsx("h2", { children: "Understand your health better." }), _jsx("p", { className: "hero-description", children: "Answer a few questions about your lifestyle and wellbeing to build a personalized health overview." }), _jsxs("form", { onSubmit: checkSymptom, className: "symptom-search", children: [_jsx(Search, { size: 17 }), _jsx("input", { value: symptom, onChange: (e) => setSymptom(e.target.value), placeholder: "Quick symptom check...", maxLength: 100 }), _jsx("button", { type: "submit", disabled: quickCheckStatus === "checking", children: quickCheckStatus === "checking" ? "Checking..." : "Check" })] }), quickCheckStatus === "error" && (_jsxs("div", { className: "quick-check-result error", children: [_jsx(Info, { size: 14 }), _jsxs("div", { children: [_jsx("p", { children: "Quick check is temporarily unavailable. Please try again in a moment." }), _jsxs(Link, { to: "/analysis", className: "quick-check-cta", children: ["Start Health Analysis", _jsx(ArrowRight, { size: 13 })] })] })] })), quickCheckStatus === "needs-more" && quickCheckResult && (_jsxs("div", { className: "quick-check-result needs-more", children: [_jsx(AlertTriangle, { size: 14 }), _jsxs("div", { children: [_jsx("p", { children: quickCheckResult.summary }), quickCheckResult.whenToSeekCare.map((item, index) => (_jsx("p", { className: "quick-check-subtext", children: item }, index))), _jsxs(Link, { to: "/analysis", className: "quick-check-cta", children: ["Start Health Analysis", _jsx(ArrowRight, { size: 13 })] })] })] })), quickCheckStatus === "result" && quickCheckResult && (_jsx("div", { className: `quick-check-result ${QUICK_URGENCY_CLASS[quickCheckResult.urgencyLevel]}`, children: _jsxs("div", { className: "quick-check-body", children: [_jsx("p", { className: "quick-check-summary", children: quickCheckResult.summary }), quickCheckResult.considerations.length > 0 && (_jsx("ul", { className: "quick-check-list", children: quickCheckResult.considerations.map((item, index) => (_jsx("li", { children: item }, index))) })), quickCheckResult.generalGuidance.length > 0 && (_jsx("ul", { className: "quick-check-list", children: quickCheckResult.generalGuidance.map((item, index) => (_jsx("li", { children: item }, index))) })), quickCheckResult.whenToSeekCare.length > 0 && (_jsx("p", { className: "quick-check-subtext", children: quickCheckResult.whenToSeekCare[0] })), _jsx("p", { className: "quick-check-disclaimer", children: quickCheckResult.disclaimer }), _jsxs("div", { className: "quick-check-actions", children: [_jsxs(Link, { to: "/analysis", className: "quick-check-cta", children: ["Get a full analysis", _jsx(ArrowRight, { size: 13 })] }), _jsx("button", { type: "button", className: "quick-check-reset", onClick: resetQuickCheck, children: "Check another symptom" })] })] }) }))] }), _jsxs(Link, { to: "/analysis", className: "hero-button", children: ["Start analysis", _jsx(ArrowRight, { size: 17 })] })] }), _jsxs("section", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card glass-card", children: [_jsxs("div", { className: "stat-top", children: [_jsx("div", { className: "stat-icon teal", children: _jsx(ShieldCheck, { size: 19 }) }), _jsx("span", { children: wellnessLoading
                                            ? "Loading..."
                                            : wellnessScore === null
                                                ? "Not assessed"
                                                : wellnessScore >= 70
                                                    ? "Good"
                                                    : wellnessScore >= 40
                                                        ? "Fair"
                                                        : "Needs attention" })] }), _jsx("p", { children: "Wellness indicator" }), _jsx("h3", { children: wellnessLoading
                                    ? "—"
                                    : wellnessScore === null
                                        ? "—"
                                        : wellnessScore }), _jsx("small", { children: wellnessScore === null
                                    ? "Complete your health profile to generate a wellness indicator."
                                    : "A lifestyle indicator from your Preventive Wellness data, not a medical score." })] }), _jsxs("div", { className: "stat-card glass-card", children: [_jsxs("div", { className: "stat-top", children: [_jsx("div", { className: "stat-icon blue", children: _jsx(UserRound, { size: 19 }) }), _jsx("span", { children: "Profile" })] }), _jsx("p", { children: "Health profile" }), _jsx("h3", { children: profileCompletion === null
                                    ? "—"
                                    : `${profileCompletion}%` }), _jsx("small", { children: profileCompletion === null
                                    ? "Loading your profile completion..."
                                    : profileCompletion === 100
                                        ? "Your health profile is fully complete."
                                        : profileCompletion > 0
                                            ? "Add more details for fuller personalization."
                                            : "Add your health information for personalized insights." })] }), _jsxs(Link, { to: latestAnalysis
                            ? `/analysis?id=${latestAnalysis.id}`
                            : "/analysis", className: "stat-card glass-card", children: [_jsxs("div", { className: "stat-top", children: [_jsx("div", { className: "stat-icon purple", children: _jsx(CalendarDays, { size: 19 }) }), _jsx("span", { children: "History" })] }), _jsx("p", { children: "Last analysis" }), _jsx("h3", { children: analysisLoading
                                    ? "—"
                                    : latestAnalysis
                                        ? formatRelativeDate(latestAnalysis.createdAt)
                                        : "—" }), _jsx("small", { children: analysisLoading
                                    ? "Loading your analysis history..."
                                    : latestAnalysis
                                        ? latestAnalysis.concern.length > 60
                                            ? `${latestAnalysis.concern.slice(0, 60)}…`
                                            : latestAnalysis.concern
                                        : "Your health analysis history will appear here." })] })] }), _jsxs("section", { className: "widget-grid", children: [_jsxs("div", { className: "widget-card glass-card", children: [_jsxs("div", { className: "widget-header", children: [_jsxs("div", { className: "widget-title", children: [_jsx("div", { className: "widget-icon cyan", children: _jsx(Droplets, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Hydration" }), _jsx("p", { children: "Today's water intake" })] })] }), _jsxs("strong", { children: [water, "/8"] })] }), _jsx("div", { className: "water-track", children: _jsx("div", { className: "water-progress", style: { width: `${(water / 8) * 100}%` } }) }), _jsx("div", { className: "water-glasses", children: Array.from({ length: 8 }).map((_, index) => (_jsx("button", { onClick: () => setWater(index + 1), className: index < water ? "filled" : "", "aria-label": `Set ${index + 1} glasses`, children: _jsx(Droplets, { size: 14 }) }, index))) }), _jsxs("div", { className: "widget-footer", children: [_jsx("span", { children: water === 8
                                            ? "Daily goal completed 🎉"
                                            : `${8 - water} glasses remaining` }), _jsx("button", { onClick: () => setWater(0), children: "Reset" })] })] }), _jsxs("div", { className: "widget-card glass-card health-snapshot", children: [_jsx("div", { className: "widget-header", children: _jsxs("div", { className: "widget-title", children: [_jsx("div", { className: "widget-icon purple", children: _jsx(Sparkles, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "AI health snapshot" }), _jsx("p", { children: "Your current overview" })] })] }) }), _jsxs("div", { className: "snapshot-list", children: [_jsxs("div", { children: [_jsx("span", { children: "Overall status" }), _jsx("strong", { children: analysisLoading
                                                    ? "Loading..."
                                                    : latestAnalysis
                                                        ? URGENCY_STATUS_LABEL[latestAnalysis.urgencyLevel] ??
                                                            "Assessed"
                                                        : "Not assessed" })] }), _jsxs("div", { children: [_jsx("span", { children: "Health profile" }), _jsx("strong", { children: profileCompletion === null
                                                    ? "Loading..."
                                                    : profileCompletion === 100
                                                        ? "Complete"
                                                        : profileCompletion > 0
                                                            ? `${profileCompletion}% complete`
                                                            : "Incomplete" })] }), _jsxs("div", { children: [_jsx("span", { children: "Last assessment" }), _jsx("strong", { children: analysisLoading
                                                    ? "Loading..."
                                                    : latestAnalysis
                                                        ? formatRelativeDate(latestAnalysis.createdAt)
                                                        : "No data" })] })] }), _jsxs(Link, { to: latestAnalysis ? `/analysis?id=${latestAnalysis.id}` : "/profile", className: "secondary-action", children: [latestAnalysis ? "View last analysis" : "Complete profile", _jsx(ArrowRight, { size: 15 })] })] })] }), _jsx(MedicationReminder, {}), _jsx(FollowUpReminders, {}), _jsx(VitalsCard, {}), _jsx(RiskMatrix, {}), _jsx(EmergencyCard, {}), _jsx(MedicalVault, {}), _jsx(DailyPlanner, {}), _jsxs("section", { className: "bottom-grid", children: [_jsxs("div", { className: "activity-card glass-card", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("h3", { children: "Recent activity" }), _jsx("p", { children: "Your latest HealthAI activity" })] }), _jsx(Activity, { size: 18 })] }), analysisLoading ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Loading your recent activity..." }) })) : analysisHistory.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "activity-list", children: analysisHistory.slice(0, 5).map((entry) => (_jsxs(Link, { to: `/analysis?id=${entry.id}`, className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(ClipboardCheck, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: entry.concern.length > 70
                                                                ? `${entry.concern.slice(0, 70)}…`
                                                                : entry.concern }), _jsxs("span", { children: ["Health analysis \u00B7", " ", formatRelativeDate(entry.createdAt)] })] }), _jsx("span", { className: `risk-badge ${entry.urgencyLevel === "routine"
                                                        ? "low"
                                                        : entry.urgencyLevel === "soon"
                                                            ? "moderate"
                                                            : "high"}`, children: URGENCY_STATUS_LABEL[entry.urgencyLevel] })] }, entry.id))) }), analysisHistory.length > 5 && (_jsxs(Link, { to: "/analysis", className: "secondary-action", children: ["View all analyses", _jsx(ArrowRight, { size: 15 })] }))] })) : (_jsxs("div", { className: "empty-state", children: [_jsx("div", { children: _jsx(Activity, { size: 21 }) }), _jsx("strong", { children: "No activity yet" }), _jsx("p", { children: "Complete an analysis to start building your health history." })] }))] }), _jsxs("div", { className: "privacy-card glass-card", children: [_jsx("div", { className: "privacy-icon", children: _jsx(ShieldCheck, { size: 21 }) }), _jsx("h3", { children: "Your health, your control." }), _jsx("p", { children: "HealthAI keeps your health experience private and personalized." }), _jsxs("span", { children: ["Secure health workspace", _jsx("span", { className: "status-dot" })] })] })] })] }));
};
export default Dashboard;
