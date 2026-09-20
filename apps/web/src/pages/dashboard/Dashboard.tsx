import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Info,
  ShieldCheck,
  Sparkles,
  UserRound,
  Search,
  Droplets,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHealthProfile } from "../../api/profile";
import { getRiskMatrix } from "../../api/risk";
import {
  getAnalysisHistory,
  runQuickSymptomCheck,
  type HealthAnalysis,
  type QuickCheckResult,
} from "../../api/analysis";
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
  const [profileCompletion, setProfileCompletion] =
    useState<number | null>(null);

  const [analysisHistory, setAnalysisHistory] = useState<HealthAnalysis[]>(
    []
  );
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const latestAnalysis = analysisHistory[0] ?? null;

  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [wellnessLoading, setWellnessLoading] = useState(true);

  const [quickCheckStatus, setQuickCheckStatus] = useState<
    "idle" | "checking" | "result" | "needs-more" | "error"
  >("idle");
  const [quickCheckResult, setQuickCheckResult] =
    useState<QuickCheckResult | null>(null);

  useEffect(() => {
    const loadProfileCompletion = async () => {
      try {
        const result = await getHealthProfile();
        setProfileCompletion(result.completion);
      } catch (error) {
        console.error(
          "Failed to load profile completion:",
          error
        );
      }
    };

    const loadAnalysisHistory = async () => {
      try {
        const result = await getAnalysisHistory();
        setAnalysisHistory(result);
      } catch (error) {
        console.error(
          "Failed to load analysis history:",
          error
        );
      } finally {
        setAnalysisLoading(false);
      }
    };

    const loadWellnessScore = async () => {
      try {
        const result = await getRiskMatrix();
        setWellnessScore(result.overallWellnessScore);
      } catch (error) {
        console.error("Failed to load wellness score:", error);
      } finally {
        setWellnessLoading(false);
      }
    };

    loadProfileCompletion();
    loadAnalysisHistory();
    loadWellnessScore();
  }, []);

  const formatRelativeDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const days = Math.floor(
      (Date.now() - date.getTime()) / 86400000
    );

    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
  };

  const URGENCY_STATUS_LABEL: Record<string, string> = {
    routine: "Routine",
    soon: "Check in soon",
    urgent: "Seek care promptly",
  };

  const hour = new Date().getHours();

  const timeOfDayGreeting =
    hour < 12
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

  const dailyTip =
    hour < 12
      ? "Start your day with enough water and a balanced breakfast."
      : hour < 18
      ? "Take a short movement break and stay hydrated."
      : "Wind down early and give your body enough time to rest.";

  const checkSymptom = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = symptom.trim();
    if (!trimmed || quickCheckStatus === "checking") return;

    try {
      setQuickCheckStatus("checking");
      setQuickCheckResult(null);

      const result = await runQuickSymptomCheck(trimmed);

      setQuickCheckResult(result);
      setQuickCheckStatus(
        result.needsFullAnalysis ? "needs-more" : "result"
      );
    } catch (error) {
      console.error("Quick symptom check failed:", error);
      setQuickCheckStatus("error");
    }
  };

  const resetQuickCheck = () => {
    setSymptom("");
    setQuickCheckStatus("idle");
    setQuickCheckResult(null);
  };

  const QUICK_URGENCY_CLASS: Record<string, "low" | "moderate" | "high"> = {
    routine: "low",
    soon: "moderate",
    urgent: "high",
  };

  return (
    <>
      {/* AI Tip */}
      <div className="ai-tip glass-card">
        <div className="tip-icon">
          <Sparkles size={17} />
        </div>

        <div>
          <span>Daily AI insight</span>
          <p>{dailyTip}</p>
        </div>
      </div>

      {/* Welcome */}
      <section className="welcome-section">
        <p>Good to see you</p>

        <h1 key={greetingIndex} className="animated-greeting">
          {greetingMessages[greetingIndex].text}
          <span>{greetingMessages[greetingIndex].emoji}</span>
        </h1>

        <div className="welcome-meta">
          <span>
            <ShieldCheck size={15} />
            Your private health space
          </span>

          <span>
            <Activity size={15} />
            Personalized insights
          </span>
        </div>
      </section>

      {/* Hero */}
      <section className="analysis-hero glass-dark">
        <div className="hero-glow" />

        <div className="hero-content">
          <div className="hero-icon">
            <ClipboardCheck size={22} />
          </div>

          <p className="hero-label">PERSONAL HEALTH ANALYSIS</p>

          <h2>Understand your health better.</h2>

          <p className="hero-description">
            Answer a few questions about your lifestyle and wellbeing to
            build a personalized health overview.
          </p>

          <form onSubmit={checkSymptom} className="symptom-search">
            <Search size={17} />

            <input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Quick symptom check..."
              maxLength={100}
            />

            <button
              type="submit"
              disabled={quickCheckStatus === "checking"}
            >
              {quickCheckStatus === "checking" ? "Checking..." : "Check"}
            </button>
          </form>

          {quickCheckStatus === "error" && (
            <div className="quick-check-result error">
              <Info size={14} />
              <div>
                <p>
                  Quick check is temporarily unavailable. Please try again
                  in a moment.
                </p>
                <Link to="/analysis" className="quick-check-cta">
                  Start Health Analysis
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {quickCheckStatus === "needs-more" && quickCheckResult && (
            <div className="quick-check-result needs-more">
              <AlertTriangle size={14} />
              <div>
                <p>{quickCheckResult.summary}</p>
                {quickCheckResult.whenToSeekCare.map((item, index) => (
                  <p key={index} className="quick-check-subtext">
                    {item}
                  </p>
                ))}
                <Link to="/analysis" className="quick-check-cta">
                  Start Health Analysis
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {quickCheckStatus === "result" && quickCheckResult && (
            <div
              className={`quick-check-result ${
                QUICK_URGENCY_CLASS[quickCheckResult.urgencyLevel]
              }`}
            >
              <div className="quick-check-body">
                <p className="quick-check-summary">
                  {quickCheckResult.summary}
                </p>

                {quickCheckResult.considerations.length > 0 && (
                  <ul className="quick-check-list">
                    {quickCheckResult.considerations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}

                {quickCheckResult.generalGuidance.length > 0 && (
                  <ul className="quick-check-list">
                    {quickCheckResult.generalGuidance.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}

                {quickCheckResult.whenToSeekCare.length > 0 && (
                  <p className="quick-check-subtext">
                    {quickCheckResult.whenToSeekCare[0]}
                  </p>
                )}

                <p className="quick-check-disclaimer">
                  {quickCheckResult.disclaimer}
                </p>

                <div className="quick-check-actions">
                  <Link to="/analysis" className="quick-check-cta">
                    Get a full analysis
                    <ArrowRight size={13} />
                  </Link>

                  <button
                    type="button"
                    className="quick-check-reset"
                    onClick={resetQuickCheck}
                  >
                    Check another symptom
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/analysis" className="hero-button">
          Start analysis
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-top">
            <div className="stat-icon teal">
              <ShieldCheck size={19} />
            </div>

            <span>
              {wellnessLoading
                ? "Loading..."
                : wellnessScore === null
                ? "Not assessed"
                : wellnessScore >= 70
                ? "Good"
                : wellnessScore >= 40
                ? "Fair"
                : "Needs attention"}
            </span>
          </div>

          <p>Wellness indicator</p>
          <h3>
            {wellnessLoading
              ? "—"
              : wellnessScore === null
              ? "—"
              : wellnessScore}
          </h3>

          <small>
            {wellnessScore === null
              ? "Complete your health profile to generate a wellness indicator."
              : "A lifestyle indicator from your Preventive Wellness data, not a medical score."}
          </small>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-top">
            <div className="stat-icon blue">
              <UserRound size={19} />
            </div>

            <span>Profile</span>
          </div>

          <p>Health profile</p>
          <h3>
            {profileCompletion === null
              ? "—"
              : `${profileCompletion}%`}
          </h3>

          <small>
            {profileCompletion === null
              ? "Loading your profile completion..."
              : profileCompletion === 100
              ? "Your health profile is fully complete."
              : profileCompletion > 0
              ? "Add more details for fuller personalization."
              : "Add your health information for personalized insights."}
          </small>
        </div>

        <Link
          to={
            latestAnalysis
              ? `/analysis?id=${latestAnalysis.id}`
              : "/analysis"
          }
          className="stat-card glass-card"
        >
          <div className="stat-top">
            <div className="stat-icon purple">
              <CalendarDays size={19} />
            </div>

            <span>History</span>
          </div>

          <p>Last analysis</p>
          <h3>
            {analysisLoading
              ? "—"
              : latestAnalysis
              ? formatRelativeDate(latestAnalysis.createdAt)
              : "—"}
          </h3>

          <small>
            {analysisLoading
              ? "Loading your analysis history..."
              : latestAnalysis
              ? latestAnalysis.concern.length > 60
                ? `${latestAnalysis.concern.slice(0, 60)}…`
                : latestAnalysis.concern
              : "Your health analysis history will appear here."}
          </small>
        </Link>
      </section>

      {/* Widgets */}
      <section className="widget-grid">
        {/* Hydration */}
        <div className="widget-card glass-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-icon cyan">
                <Droplets size={19} />
              </div>

              <div>
                <h3>Hydration</h3>
                <p>Today's water intake</p>
              </div>
            </div>

            <strong>{water}/8</strong>
          </div>

          <div className="water-track">
            <div
              className="water-progress"
              style={{ width: `${(water / 8) * 100}%` }}
            />
          </div>

          <div className="water-glasses">
            {Array.from({ length: 8 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setWater(index + 1)}
                className={index < water ? "filled" : ""}
                aria-label={`Set ${index + 1} glasses`}
              >
                <Droplets size={14} />
              </button>
            ))}
          </div>

          <div className="widget-footer">
            <span>
              {water === 8
                ? "Daily goal completed 🎉"
                : `${8 - water} glasses remaining`}
            </span>

            <button onClick={() => setWater(0)}>Reset</button>
          </div>
        </div>

        {/* AI Health Snapshot */}
        <div className="widget-card glass-card health-snapshot">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-icon purple">
                <Sparkles size={19} />
              </div>

              <div>
                <h3>AI health snapshot</h3>
                <p>Your current overview</p>
              </div>
            </div>
          </div>

          <div className="snapshot-list">
            <div>
              <span>Overall status</span>
              <strong>
                {analysisLoading
                  ? "Loading..."
                  : latestAnalysis
                  ? URGENCY_STATUS_LABEL[latestAnalysis.urgencyLevel] ??
                    "Assessed"
                  : "Not assessed"}
              </strong>
            </div>

            <div>
              <span>Health profile</span>
              <strong>
                {profileCompletion === null
                  ? "Loading..."
                  : profileCompletion === 100
                  ? "Complete"
                  : profileCompletion > 0
                  ? `${profileCompletion}% complete`
                  : "Incomplete"}
              </strong>
            </div>

            <div>
              <span>Last assessment</span>
              <strong>
                {analysisLoading
                  ? "Loading..."
                  : latestAnalysis
                  ? formatRelativeDate(latestAnalysis.createdAt)
                  : "No data"}
              </strong>
            </div>
          </div>

          <Link
            to={latestAnalysis ? `/analysis?id=${latestAnalysis.id}` : "/profile"}
            className="secondary-action"
          >
            {latestAnalysis ? "View last analysis" : "Complete profile"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Medication Reminder Widget */}
      <MedicationReminder />

      <FollowUpReminders />

      <VitalsCard />

      <RiskMatrix />

      <EmergencyCard />

      <MedicalVault />

      <DailyPlanner />

      {/* Bottom */}
      <section className="bottom-grid">
        <div className="activity-card glass-card">
          <div className="section-heading">
            <div>
              <h3>Recent activity</h3>
              <p>Your latest HealthAI activity</p>
            </div>

            <Activity size={18} />
          </div>

          {analysisLoading ? (
            <div className="empty-state">
              <p>Loading your recent activity...</p>
            </div>
          ) : analysisHistory.length > 0 ? (
            <>
              <div className="activity-list">
                {analysisHistory.slice(0, 5).map((entry) => (
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
                      <span>
                        Health analysis ·{" "}
                        {formatRelativeDate(entry.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`risk-badge ${
                        entry.urgencyLevel === "routine"
                          ? "low"
                          : entry.urgencyLevel === "soon"
                          ? "moderate"
                          : "high"
                      }`}
                    >
                      {URGENCY_STATUS_LABEL[entry.urgencyLevel]}
                    </span>
                  </Link>
                ))}
              </div>

              {analysisHistory.length > 5 && (
                <Link to="/analysis" className="secondary-action">
                  View all analyses
                  <ArrowRight size={15} />
                </Link>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div>
                <Activity size={21} />
              </div>

              <strong>No activity yet</strong>

              <p>
                Complete an analysis to start building your health history.
              </p>
            </div>
          )}
        </div>

        <div className="privacy-card glass-card">
          <div className="privacy-icon">
            <ShieldCheck size={21} />
          </div>

          <h3>Your health, your control.</h3>

          <p>
            HealthAI keeps your health experience private and personalized.
          </p>

          <span>
            Secure health workspace
            <span className="status-dot" />
          </span>
        </div>
      </section>
    </>
  );
};

export default Dashboard;