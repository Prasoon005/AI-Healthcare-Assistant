import { useEffect, useState } from "react";
import {
  Activity,
  ClipboardCheck,
  FileText,
  HeartPulse,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import bgArtwork from "../assets/bg-artwork.png";
import { useAuth } from "../context/AuthContext";

const PAGE_META: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Health overview", title: "Personal dashboard" },
  "/profile": { eyebrow: "Personalization", title: "Health profile" },
  "/analysis": { eyebrow: "Assessment", title: "Health analysis" },
  "/reports": { eyebrow: "Insights", title: "Health reports" },
  "/settings": { eyebrow: "Account", title: "Settings" },
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const firstName = user?.name?.split(" ")[0] || "there";

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const meta =
    PAGE_META[location.pathname] ?? PAGE_META["/dashboard"];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-item active" : "nav-item";

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
          <NavLink to="/dashboard" end className={navLinkClass}>
            <Activity size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkClass}>
            <UserRound size={18} />
            <span>Health Profile</span>
          </NavLink>

          <NavLink to="/analysis" className={navLinkClass}>
            <ClipboardCheck size={18} />
            <span>Health Analysis</span>
          </NavLink>

          <NavLink to="/reports" className={navLinkClass}>
            <FileText size={18} />
            <span>Reports</span>
          </NavLink>

          <NavLink to="/settings" className={navLinkClass}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
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
            <p className="header-eyebrow">{meta.eyebrow}</p>
            <h2>{meta.title}</h2>
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
