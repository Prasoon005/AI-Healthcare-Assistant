import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  HeartPulse,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Search,
  Droplets,
} from "lucide-react";
import { Link } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";
import { useAuth } from "../../context/AuthContext";
import MedicationReminder from "./MedicationReminder";
import VitalsCard from "./VitalsCard";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [water, setWater] = useState(0);
  const [symptom, setSymptom] = useState("");
  const [symptomResult, setSymptomResult] = useState("");

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const hour = new Date().getHours();

  const dailyTip =
    hour < 12
      ? "Start your day with enough water and a balanced breakfast."
      : hour < 18
      ? "Take a short movement break and stay hydrated."
      : "Wind down early and give your body enough time to rest.";

  const checkSymptom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptom.trim()) return;

    setSymptomResult(
      "This is an educational quick check. For a detailed assessment, use Health Analysis."
    );
  };

  return (
    <div
      className="dashboard-shell"
      style={{
        "--mouse-x": `${mouse.x}px`,
        "--mouse-y": `${mouse.y}px`,
        backgroundImage: `url(${bgArtwork})`,
      } as React.CSSProperties}
    >
      {/* Ambient effects */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="cursor-glow" />

      {/* Sidebar */}
      <aside className="dashboard-sidebar glass-panel">
        <div className="sidebar-brand">
          <Link to="/dashboard" className="brand-link">
            <div className="brand-icon">
              <HeartPulse size={19} />
            </div>

            <span>
              Health<span className="brand-accent">AI</span>
            </span>
          </Link>
        </div>

        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item active">
            <Activity size={18} />
            <span>Overview</span>
          </Link>

          <Link to="/profile" className="nav-item">
            <UserRound size={18} />
            <span>Health Profile</span>
          </Link>

          <Link to="/analysis" className="nav-item">
            <ClipboardCheck size={18} />
            <span>Health Analysis</span>
          </Link>

          <Link to="/reports" className="nav-item">
            <FileText size={18} />
            <span>Reports</span>
          </Link>

          <Link to="/settings" className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header glass-panel">
          <div>
            <p className="header-eyebrow">Health overview</p>
            <h2>Personal dashboard</h2>
          </div>

          <div className="profile-area">
            <div className="profile-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>

            <div className="avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
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

            <h1>
              Hello, {firstName}
              <span>👋</span>
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
                />

                <button type="submit">Check</button>
              </form>

              {symptomResult && (
                <p className="symptom-result">{symptomResult}</p>
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

                <span>Not assessed</span>
              </div>

              <p>Health score</p>
              <h3>—</h3>

              <small>
                Complete your first analysis to generate your health score.
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
              <h3>0%</h3>

              <small>
                Add your health information for personalized insights.
              </small>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-top">
                <div className="stat-icon purple">
                  <CalendarDays size={19} />
                </div>

                <span>History</span>
              </div>

              <p>Last analysis</p>
              <h3>—</h3>

              <small>Your health analysis history will appear here.</small>
            </div>
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
                  <strong>Not assessed</strong>
                </div>

                <div>
                  <span>Health profile</span>
                  <strong>Incomplete</strong>
                </div>

                <div>
                  <span>Last assessment</span>
                  <strong>No data</strong>
                </div>
              </div>

              <Link to="/profile" className="secondary-action">
                Complete profile
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* Medication Reminder Widget */}
          <MedicationReminder />

          <VitalsCard />

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

              <div className="empty-state">
                <div>
                  <Activity size={21} />
                </div>

                <strong>No activity yet</strong>

                <p>
                  Complete an analysis to start building your health history.
                </p>
              </div>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;