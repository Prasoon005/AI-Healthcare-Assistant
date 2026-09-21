import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
const LandingFooter = () => {
    return (_jsxs("footer", { className: "landing-footer", children: [_jsxs("div", { className: "landing-footer-brand", children: [_jsx("div", { className: "landing-logo-mark", children: _jsx(HeartPulse, { size: 16 }) }), _jsxs("span", { children: ["Health", _jsx("span", { className: "landing-logo-accent", children: "AI" })] })] }), _jsx("p", { className: "landing-footer-note", children: "Educational health information, not a substitute for professional medical advice." }), _jsxs("div", { className: "landing-footer-links", children: [_jsx(Link, { to: "/login", children: "Log in" }), _jsx(Link, { to: "/register", children: "Sign up" })] })] }));
};
export default LandingFooter;
