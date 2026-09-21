import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { AlertTriangle, ClipboardCheck, FileText, HeartPulse, History as HistoryIcon, Info, Pill, RefreshCw, Search, Sparkles, UserRound, X, } from "lucide-react";
import { getAnalytics, getHistory, HISTORY_RANGE_OPTIONS, HISTORY_TYPE_OPTIONS, } from "../../api/history";
import { getDocument } from "../../api/documents";
const TYPE_ICON = {
    profile: UserRound,
    analysis: ClipboardCheck,
    report: FileText,
    vital: HeartPulse,
    medication: Pill,
    document: FileText,
    followup: RefreshCw,
};
const formatDay = (iso) => new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
});
const formatMonthLabel = (iso) => new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
});
const groupByMonth = (events) => {
    const groups = [];
    const indexByLabel = new Map();
    for (const event of events) {
        const label = formatMonthLabel(event.occurredAt);
        const existingIndex = indexByLabel.get(label);
        if (existingIndex === undefined) {
            indexByLabel.set(label, groups.length);
            groups.push({ label, items: [event] });
        }
        else {
            groups[existingIndex].items.push(event);
        }
    }
    return groups;
};
/* ============================================================
   VITAL TREND CHART
============================================================ */
const VITAL_CHART_COLOR = {
    heartRate: "#2a78d6",
    systolic: "#eb6834",
    diastolic: "#1baf7a",
    spo2: "#eda100",
};
const VitalTrendChart = ({ label, unit, points, colorKey, }) => {
    const color = VITAL_CHART_COLOR[colorKey];
    return (_jsxs("div", { className: "history-chart-card", children: [_jsxs("div", { className: "history-chart-header", children: [_jsx("span", { children: label }), points.length > 0 && (_jsxs("strong", { style: { color }, children: [points[points.length - 1].value, unit] }))] }), points.length === 0 ? (_jsx("div", { className: "history-chart-empty", children: "Not enough data for a trend." })) : (_jsx(ResponsiveContainer, { width: "100%", height: 140, children: _jsxs(LineChart, { data: points.map((point) => ({
                        ...point,
                        label: formatDay(point.date),
                    })), margin: { top: 8, right: 8, bottom: 0, left: -20 }, children: [_jsx(XAxis, { dataKey: "label", tick: { fontSize: 9, fill: "#94a3b8" }, axisLine: { stroke: "rgba(15,23,42,0.1)" }, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 9, fill: "#94a3b8" }, axisLine: false, tickLine: false, width: 30 }), _jsx(Tooltip, { formatter: (value) => [`${value}${unit}`, label], labelStyle: { fontSize: 11, color: "#334155" }, contentStyle: {
                                fontSize: 11,
                                borderRadius: 10,
                                border: "1px solid rgba(15,23,42,0.1)",
                            } }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: color, strokeWidth: 2, dot: { r: 3, stroke: "#ffffff", strokeWidth: 2, fill: color }, activeDot: { r: 5 } })] }) }))] }));
};
/* ============================================================
   ANALYTICS PANEL
============================================================ */
const CONCERN_STATUS_LABELS = [
    { key: "resolved", label: "Resolved", badge: "low" },
    { key: "improved", label: "Improved", badge: "low" },
    { key: "persistent", label: "Still present", badge: "moderate" },
    { key: "worsening", label: "Worse", badge: "high" },
    { key: "unknown", label: "Unknown / not updated", badge: "moderate" },
];
const AnalyticsPanel = () => {
    const [range, setRange] = useState("30d");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const result = await getAnalytics(range);
                setAnalytics(result);
            }
            catch (err) {
                console.error("Failed to load analytics:", err);
                setError("Unable to load analytics right now.");
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [range]);
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(Sparkles, { size: 16, className: "analysis-header-icon" }), "Longitudinal analytics"] }), _jsx("p", { children: "Trends and tracking built only from your real recorded data" })] }) }), _jsx("div", { className: "report-range-picker", children: HISTORY_RANGE_OPTIONS.map((option) => (_jsx("button", { type: "button", className: `report-range-button ${range === option.value ? "active" : ""}`, onClick: () => setRange(option.value), children: option.label }, option.value))) }), loading ? (_jsx("p", { className: "report-empty-note", children: "Loading analytics..." })) : error ? (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })) : analytics ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "report-metric-grid", children: [_jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Analyses" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.analyses })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Reports" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.reports })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Vitals logged" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.vitals })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Documents" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.documents })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Medications added" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.medications })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Follow-ups" }), _jsx("span", { className: "report-metric-value", children: analytics.activityVolume.followups })] })] }), _jsxs("div", { className: "history-progress-card", children: [_jsxs("div", { className: "history-progress-header", children: [_jsx("span", { children: analytics.healthTrackingProgress.label }), _jsxs("strong", { children: [analytics.healthTrackingProgress.score, "/100"] })] }), _jsx("div", { className: "profile-completion-track", children: _jsx("div", { className: "profile-completion-fill", style: { width: `${analytics.healthTrackingProgress.score}%` } }) }), _jsx("p", { className: "report-empty-note", children: analytics.healthTrackingProgress.disclaimer })] }), _jsx("h4", { className: "history-subheading", children: "Vital trends" }), _jsxs("div", { className: "history-chart-grid", children: [_jsx(VitalTrendChart, { label: "Heart rate", unit: " bpm", points: analytics.vitalTrends.heartRate, colorKey: "heartRate" }), _jsx(VitalTrendChart, { label: "Systolic BP", unit: " mmHg", points: analytics.vitalTrends.systolic, colorKey: "systolic" }), _jsx(VitalTrendChart, { label: "Diastolic BP", unit: " mmHg", points: analytics.vitalTrends.diastolic, colorKey: "diastolic" }), _jsx(VitalTrendChart, { label: "SpO2", unit: "%", points: analytics.vitalTrends.spo2, colorKey: "spo2" })] }), _jsx("h4", { className: "history-subheading", children: "Medication tracking" }), _jsxs("div", { className: "report-metric-grid", children: [_jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Active medications" }), _jsx("span", { className: "report-metric-value", children: analytics.medicationTracking.activeMedications })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Doses scheduled" }), _jsx("span", { className: "report-metric-value", children: analytics.medicationTracking.dosesScheduled })] }), _jsxs("div", { className: "report-metric-tile", children: [_jsx("span", { className: "report-metric-label", children: "Doses taken" }), _jsx("span", { className: "report-metric-value", children: analytics.medicationTracking.dosesTaken })] })] }), _jsx("h4", { className: "history-subheading", children: "Concern status" }), _jsx("div", { className: "report-wellness-items", children: CONCERN_STATUS_LABELS.map((item) => (_jsxs("div", { className: "report-wellness-item", children: [_jsx("span", { children: item.label }), _jsx("span", { className: `risk-badge ${item.badge}`, children: analytics.concernStatus[item.key] })] }, item.key))) }), _jsx("h4", { className: "history-subheading", children: "AI insight" }), analytics.aiInsight.available && analytics.aiInsight.text ? (_jsxs("div", { className: "history-ai-insight", children: [_jsx(Sparkles, { size: 14 }), _jsx("p", { children: analytics.aiInsight.text })] })) : (_jsx("p", { className: "report-empty-note", children: "Not enough recorded activity in this period for an insight yet." }))] })) : null] }));
};
/* ============================================================
   PAGE
============================================================ */
const PAGE_SIZE = 20;
const History = () => {
    const navigate = useNavigate();
    const [type, setType] = useState("all");
    const [range, setRange] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [events, setEvents] = useState([]);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentLoading, setDocumentLoading] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);
    useEffect(() => {
        setPage(1);
    }, [type, range, debouncedSearch]);
    useEffect(() => {
        const load = async () => {
            try {
                if (page === 1)
                    setLoading(true);
                else
                    setLoadingMore(true);
                setError("");
                const result = await getHistory({
                    type,
                    range,
                    search: debouncedSearch || undefined,
                    page,
                    pageSize: PAGE_SIZE,
                });
                setEvents((prev) => page === 1 ? result.events : [...prev, ...result.events]);
                setTotal(result.total);
                setHasMore(result.hasMore);
            }
            catch (err) {
                console.error("Failed to load health history:", err);
                setError("Unable to load your health history right now.");
            }
            finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };
        load();
    }, [type, range, debouncedSearch, page]);
    const groups = useMemo(() => groupByMonth(events), [events]);
    const openDocument = async (id) => {
        try {
            setDocumentLoading(true);
            const doc = await getDocument(id);
            setSelectedDocument(doc);
        }
        catch (err) {
            console.error("Failed to load document:", err);
        }
        finally {
            setDocumentLoading(false);
        }
    };
    const handleEventClick = (event) => {
        if (!event.link)
            return;
        if (event.link.type === "analysis") {
            navigate(`/analysis?id=${event.link.id}`);
        }
        else if (event.link.type === "report") {
            navigate(`/reports?id=${event.link.id}`);
        }
        else if (event.link.type === "document") {
            openDocument(event.link.id);
        }
    };
    const isFiltering = type !== "all" || range !== "all" || !!debouncedSearch;
    return (_jsxs("div", { className: "profile-page", children: [_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(HistoryIcon, { size: 16, className: "analysis-header-icon" }), "Health History"] }), _jsx("p", { children: "Your complete chronological health record" })] }) }), _jsxs("div", { className: "history-search", children: [_jsx(Search, { size: 15 }), _jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search your history, e.g. headache", maxLength: 200 }), search && (_jsx("button", { type: "button", className: "history-search-clear", onClick: () => setSearch(""), "aria-label": "Clear search", children: _jsx(X, { size: 14 }) }))] }), _jsx("div", { className: "report-range-picker", children: HISTORY_RANGE_OPTIONS.map((option) => (_jsx("button", { type: "button", className: `report-range-button ${range === option.value ? "active" : ""}`, onClick: () => setRange(option.value), children: option.label }, option.value))) }), _jsx("div", { className: "history-type-filters", children: HISTORY_TYPE_OPTIONS.map((option) => (_jsx("button", { type: "button", className: `report-range-button ${type === option.value ? "active" : ""}`, onClick: () => setType(option.value), children: option.label }, option.value))) })] }), _jsx("div", { className: "glass-card profile-section", children: loading ? (_jsx("p", { className: "report-empty-note", children: "Loading your health history..." })) : error ? (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })) : events.length === 0 ? (_jsx("p", { className: "report-empty-note", children: isFiltering
                        ? "No matching history records for this filter."
                        : "No health history available yet. As you use HealthAI, your activity will appear here." })) : (_jsxs(_Fragment, { children: [_jsxs("p", { className: "report-empty-note", children: [total, " record", total === 1 ? "" : "s"] }), groups.map((group) => (_jsxs("div", { className: "history-group", children: [_jsx("h4", { className: "history-month-heading", children: group.label }), _jsx("div", { className: "activity-list", children: group.items.map((event) => {
                                        const Icon = TYPE_ICON[event.type];
                                        return (_jsxs("div", { className: `activity-item history-event-item ${event.link ? "clickable" : ""}`, onClick: event.link ? () => handleEventClick(event) : undefined, role: event.link ? "button" : undefined, tabIndex: event.link ? 0 : undefined, children: [_jsx("div", { className: "activity-item-icon", children: _jsx(Icon, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: event.title }), _jsxs("span", { children: [formatDay(event.occurredAt), " \u00B7 ", event.description] })] })] }, event.id));
                                    }) })] }, group.label))), hasMore && (_jsx("div", { className: "profile-actions-bar", children: _jsx("button", { type: "button", className: "profile-edit-button", disabled: loadingMore, onClick: () => setPage((prev) => prev + 1), children: loadingMore ? "Loading..." : "Load more" }) }))] })) }), _jsx(AnalyticsPanel, {}), documentLoading && (_jsx("div", { className: "document-modal-backdrop", children: _jsx("div", { className: "document-modal", children: _jsx("div", { className: "document-text", children: "Loading document..." }) }) })), selectedDocument && (_jsx("div", { className: "document-modal-backdrop", onMouseDown: (e) => {
                    if (e.target === e.currentTarget)
                        setSelectedDocument(null);
                }, children: _jsxs("div", { className: "document-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "document-modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Extracted text" }), _jsx("h3", { children: selectedDocument.name })] }), _jsx("button", { type: "button", onClick: () => setSelectedDocument(null), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "document-text", children: selectedDocument.extractedText ||
                                "No text could be extracted from this document." })] }) })), _jsxs("div", { className: "report-empty-note", children: [_jsx(Info, { size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }), "History reflects information already recorded in your account and does not replace professional medical advice."] })] }));
};
export default History;
