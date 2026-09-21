import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  HeartPulse,
  History as HistoryIcon,
  Info,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  getAnalytics,
  getHistory,
  HISTORY_RANGE_OPTIONS,
  HISTORY_TYPE_OPTIONS,
  type HistoryAnalytics,
  type HistoryEvent,
  type HistoryEventType,
  type HistoryRange,
  type VitalTrendPoint,
} from "../../api/history";
import { getDocument, type MedicalDocument } from "../../api/documents";

const TYPE_ICON: Record<Exclude<HistoryEventType, "all">, typeof FileText> = {
  profile: UserRound,
  analysis: ClipboardCheck,
  report: FileText,
  vital: HeartPulse,
  medication: Pill,
  document: FileText,
  followup: RefreshCw,
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

const formatMonthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

interface EventGroup {
  label: string;
  items: HistoryEvent[];
}

const groupByMonth = (events: HistoryEvent[]): EventGroup[] => {
  const groups: EventGroup[] = [];
  const indexByLabel = new Map<string, number>();

  for (const event of events) {
    const label = formatMonthLabel(event.occurredAt);
    const existingIndex = indexByLabel.get(label);

    if (existingIndex === undefined) {
      indexByLabel.set(label, groups.length);
      groups.push({ label, items: [event] });
    } else {
      groups[existingIndex].items.push(event);
    }
  }

  return groups;
};

/* ============================================================
   VITAL TREND CHART
============================================================ */

const VITAL_CHART_COLOR: Record<string, string> = {
  heartRate: "#2a78d6",
  systolic: "#eb6834",
  diastolic: "#1baf7a",
  spo2: "#eda100",
};

const VitalTrendChart = ({
  label,
  unit,
  points,
  colorKey,
}: {
  label: string;
  unit: string;
  points: VitalTrendPoint[];
  colorKey: keyof typeof VITAL_CHART_COLOR;
}) => {
  const color = VITAL_CHART_COLOR[colorKey];

  return (
    <div className="history-chart-card">
      <div className="history-chart-header">
        <span>{label}</span>
        {points.length > 0 && (
          <strong style={{ color }}>
            {points[points.length - 1].value}
            {unit}
          </strong>
        )}
      </div>

      {points.length === 0 ? (
        <div className="history-chart-empty">Not enough data for a trend.</div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={points.map((point) => ({
              ...point,
              label: formatDay(point.date),
            }))}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              formatter={(value) => [`${value}${unit}`, label]}
              labelStyle={{ fontSize: 11, color: "#334155" }}
              contentStyle={{
                fontSize: 11,
                borderRadius: 10,
                border: "1px solid rgba(15,23,42,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, stroke: "#ffffff", strokeWidth: 2, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

/* ============================================================
   ANALYTICS PANEL
============================================================ */

const CONCERN_STATUS_LABELS: { key: keyof HistoryAnalytics["concernStatus"]; label: string; badge: "low" | "moderate" | "high" }[] = [
  { key: "resolved", label: "Resolved", badge: "low" },
  { key: "improved", label: "Improved", badge: "low" },
  { key: "persistent", label: "Still present", badge: "moderate" },
  { key: "worsening", label: "Worse", badge: "high" },
  { key: "unknown", label: "Unknown / not updated", badge: "moderate" },
];

const AnalyticsPanel = () => {
  const [range, setRange] = useState<HistoryRange>("30d");
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getAnalytics(range);
        setAnalytics(result);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Unable to load analytics right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range]);

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <Sparkles size={16} className="analysis-header-icon" />
            Longitudinal analytics
          </h3>
          <p>Trends and tracking built only from your real recorded data</p>
        </div>
      </div>

      <div className="report-range-picker">
        {HISTORY_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`report-range-button ${
              range === option.value ? "active" : ""
            }`}
            onClick={() => setRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="report-empty-note">Loading analytics...</p>
      ) : error ? (
        <div className="profile-error-banner">
          <AlertTriangle size={16} />
          {error}
        </div>
      ) : analytics ? (
        <>
          <div className="report-metric-grid">
            <div className="report-metric-tile">
              <span className="report-metric-label">Analyses</span>
              <span className="report-metric-value">
                {analytics.activityVolume.analyses}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Reports</span>
              <span className="report-metric-value">
                {analytics.activityVolume.reports}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Vitals logged</span>
              <span className="report-metric-value">
                {analytics.activityVolume.vitals}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Documents</span>
              <span className="report-metric-value">
                {analytics.activityVolume.documents}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Medications added</span>
              <span className="report-metric-value">
                {analytics.activityVolume.medications}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Follow-ups</span>
              <span className="report-metric-value">
                {analytics.activityVolume.followups}
              </span>
            </div>
          </div>

          <div className="history-progress-card">
            <div className="history-progress-header">
              <span>{analytics.healthTrackingProgress.label}</span>
              <strong>{analytics.healthTrackingProgress.score}/100</strong>
            </div>
            <div className="profile-completion-track">
              <div
                className="profile-completion-fill"
                style={{ width: `${analytics.healthTrackingProgress.score}%` }}
              />
            </div>
            <p className="report-empty-note">
              {analytics.healthTrackingProgress.disclaimer}
            </p>
          </div>

          <h4 className="history-subheading">Vital trends</h4>
          <div className="history-chart-grid">
            <VitalTrendChart
              label="Heart rate"
              unit=" bpm"
              points={analytics.vitalTrends.heartRate}
              colorKey="heartRate"
            />
            <VitalTrendChart
              label="Systolic BP"
              unit=" mmHg"
              points={analytics.vitalTrends.systolic}
              colorKey="systolic"
            />
            <VitalTrendChart
              label="Diastolic BP"
              unit=" mmHg"
              points={analytics.vitalTrends.diastolic}
              colorKey="diastolic"
            />
            <VitalTrendChart
              label="SpO2"
              unit="%"
              points={analytics.vitalTrends.spo2}
              colorKey="spo2"
            />
          </div>

          <h4 className="history-subheading">Medication tracking</h4>
          <div className="report-metric-grid">
            <div className="report-metric-tile">
              <span className="report-metric-label">Active medications</span>
              <span className="report-metric-value">
                {analytics.medicationTracking.activeMedications}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Doses scheduled</span>
              <span className="report-metric-value">
                {analytics.medicationTracking.dosesScheduled}
              </span>
            </div>
            <div className="report-metric-tile">
              <span className="report-metric-label">Doses taken</span>
              <span className="report-metric-value">
                {analytics.medicationTracking.dosesTaken}
              </span>
            </div>
          </div>

          <h4 className="history-subheading">Concern status</h4>
          <div className="report-wellness-items">
            {CONCERN_STATUS_LABELS.map((item) => (
              <div key={item.key} className="report-wellness-item">
                <span>{item.label}</span>
                <span className={`risk-badge ${item.badge}`}>
                  {analytics.concernStatus[item.key]}
                </span>
              </div>
            ))}
          </div>

          <h4 className="history-subheading">AI insight</h4>
          {analytics.aiInsight.available && analytics.aiInsight.text ? (
            <div className="history-ai-insight">
              <Sparkles size={14} />
              <p>{analytics.aiInsight.text}</p>
            </div>
          ) : (
            <p className="report-empty-note">
              Not enough recorded activity in this period for an insight yet.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};

/* ============================================================
   PAGE
============================================================ */

const PAGE_SIZE = 20;

const History = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<HistoryEventType>("all");
  const [range, setRange] = useState<HistoryRange>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(null);
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
        if (page === 1) setLoading(true);
        else setLoadingMore(true);
        setError("");

        const result = await getHistory({
          type,
          range,
          search: debouncedSearch || undefined,
          page,
          pageSize: PAGE_SIZE,
        });

        setEvents((prev) =>
          page === 1 ? result.events : [...prev, ...result.events]
        );
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to load health history:", err);
        setError("Unable to load your health history right now.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    load();
  }, [type, range, debouncedSearch, page]);

  const groups = useMemo(() => groupByMonth(events), [events]);

  const openDocument = async (id: string) => {
    try {
      setDocumentLoading(true);
      const doc = await getDocument(id);
      setSelectedDocument(doc);
    } catch (err) {
      console.error("Failed to load document:", err);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleEventClick = (event: HistoryEvent) => {
    if (!event.link) return;

    if (event.link.type === "analysis") {
      navigate(`/analysis?id=${event.link.id}`);
    } else if (event.link.type === "report") {
      navigate(`/reports?id=${event.link.id}`);
    } else if (event.link.type === "document") {
      openDocument(event.link.id);
    }
  };

  const isFiltering = type !== "all" || range !== "all" || !!debouncedSearch;

  return (
    <div className="profile-page">
      <div className="glass-card profile-section">
        <div className="profile-section-header">
          <div>
            <h3>
              <HistoryIcon size={16} className="analysis-header-icon" />
              Health History
            </h3>
            <p>Your complete chronological health record</p>
          </div>
        </div>

        <div className="history-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your history, e.g. headache"
            maxLength={200}
          />
          {search && (
            <button
              type="button"
              className="history-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="report-range-picker">
          {HISTORY_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`report-range-button ${
                range === option.value ? "active" : ""
              }`}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="history-type-filters">
          {HISTORY_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`report-range-button ${
                type === option.value ? "active" : ""
              }`}
              onClick={() => setType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card profile-section">
        {loading ? (
          <p className="report-empty-note">Loading your health history...</p>
        ) : error ? (
          <div className="profile-error-banner">
            <AlertTriangle size={16} />
            {error}
          </div>
        ) : events.length === 0 ? (
          <p className="report-empty-note">
            {isFiltering
              ? "No matching history records for this filter."
              : "No health history available yet. As you use HealthAI, your activity will appear here."}
          </p>
        ) : (
          <>
            <p className="report-empty-note">
              {total} record{total === 1 ? "" : "s"}
            </p>

            {groups.map((group) => (
              <div key={group.label} className="history-group">
                <h4 className="history-month-heading">{group.label}</h4>

                <div className="activity-list">
                  {group.items.map((event) => {
                    const Icon = TYPE_ICON[event.type];

                    return (
                      <div
                        key={event.id}
                        className={`activity-item history-event-item ${
                          event.link ? "clickable" : ""
                        }`}
                        onClick={
                          event.link ? () => handleEventClick(event) : undefined
                        }
                        role={event.link ? "button" : undefined}
                        tabIndex={event.link ? 0 : undefined}
                      >
                        <div className="activity-item-icon">
                          <Icon size={17} />
                        </div>

                        <div className="activity-item-content">
                          <strong>{event.title}</strong>
                          <span>
                            {formatDay(event.occurredAt)} · {event.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="profile-actions-bar">
                <button
                  type="button"
                  className="profile-edit-button"
                  disabled={loadingMore}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnalyticsPanel />

      {documentLoading && (
        <div className="document-modal-backdrop">
          <div className="document-modal">
            <div className="document-text">Loading document...</div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div
          className="document-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedDocument(null);
          }}
        >
          <div
            className="document-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="document-modal-header">
              <div>
                <span>Extracted text</span>
                <h3>{selectedDocument.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="document-text">
              {selectedDocument.extractedText ||
                "No text could be extracted from this document."}
            </div>
          </div>
        </div>
      )}

      <div className="report-empty-note">
        <Info size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        History reflects information already recorded in your account and
        does not replace professional medical advice.
      </div>
    </div>
  );
};

export default History;
