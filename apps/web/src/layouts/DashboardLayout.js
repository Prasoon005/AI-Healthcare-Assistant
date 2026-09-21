import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Activity, ClipboardCheck, FileText, HeartPulse, History, LogOut, Settings, UserRound, } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import bgArtwork from "../assets/bg-artwork.png";
import { useAuth } from "../context/AuthContext";
const PAGE_META = {
    "/dashboard": { eyebrow: "Health overview", title: "Personal dashboard" },
    "/profile": { eyebrow: "Personalization", title: "Health profile" },
    "/analysis": { eyebrow: "Assessment", title: "Health analysis" },
    "/reports": { eyebrow: "Insights", title: "Health reports" },
    "/history": { eyebrow: "Timeline", title: "Health history" },
    "/settings": { eyebrow: "Account", title: "Settings" },
};
const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const firstName = user?.name?.split(" ")[0] || "there";
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const move = (e) => {
            setMouse({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);
    const meta = PAGE_META[location.pathname] ?? PAGE_META["/dashboard"];
    const navLinkClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";
    return (_jsxs("div", { className: "dashboard-shell", style: {
            "--mouse-x": `${mouse.x}px`,
            "--mouse-y": `${mouse.y}px`,
            backgroundImage: `url(${bgArtwork})`,
        }, children: [_jsx("div", { className: "ambient ambient-one" }), _jsx("div", { className: "ambient ambient-two" }), _jsx("div", { className: "ambient ambient-three" }), _jsx("div", { className: "cursor-glow" }), _jsxs("aside", { className: "dashboard-sidebar glass-panel", children: [_jsx("div", { className: "sidebar-brand", children: _jsxs(Link, { to: "/dashboard", className: "brand-link", children: [_jsx("div", { className: "brand-icon", children: _jsx(HeartPulse, { size: 19 }) }), _jsxs("span", { children: ["Health", _jsx("span", { className: "brand-accent", children: "AI" })] })] }) }), _jsxs("nav", { className: "dashboard-nav", children: [_jsxs(NavLink, { to: "/dashboard", end: true, className: navLinkClass, children: [_jsx(Activity, { size: 18 }), _jsx("span", { children: "Overview" })] }), _jsxs(NavLink, { to: "/profile", className: navLinkClass, children: [_jsx(UserRound, { size: 18 }), _jsx("span", { children: "Health Profile" })] }), _jsxs(NavLink, { to: "/analysis", className: navLinkClass, children: [_jsx(ClipboardCheck, { size: 18 }), _jsx("span", { children: "Health Analysis" })] }), _jsxs(NavLink, { to: "/reports", className: navLinkClass, children: [_jsx(FileText, { size: 18 }), _jsx("span", { children: "Reports" })] }), _jsxs(NavLink, { to: "/history", className: navLinkClass, children: [_jsx(History, { size: 18 }), _jsx("span", { children: "History" })] }), _jsxs(NavLink, { to: "/settings", className: navLinkClass, children: [_jsx(Settings, { size: 18 }), _jsx("span", { children: "Settings" })] })] }), _jsxs("button", { className: "logout-button", onClick: logout, children: [_jsx(LogOut, { size: 18 }), "Logout"] })] }), _jsxs("main", { className: "dashboard-main", children: [_jsxs("header", { className: "dashboard-header glass-panel", children: [_jsxs("div", { children: [_jsx("p", { className: "header-eyebrow", children: meta.eyebrow }), _jsx("h2", { children: meta.title })] }), _jsxs("div", { className: "profile-area", children: [_jsxs("div", { className: "profile-info", children: [_jsx("strong", { children: user?.name }), _jsx("span", { children: user?.email })] }), _jsx("div", { className: "avatar", children: firstName.charAt(0).toUpperCase() })] })] }), _jsx("div", { className: "dashboard-content", children: _jsx(Outlet, {}) })] })] }));
};
export default DashboardLayout;
