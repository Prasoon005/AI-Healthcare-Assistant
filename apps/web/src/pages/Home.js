import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, HeartPulse, Search } from "lucide-react";
import { Link } from "react-router-dom";
import bgArtwork from "../assets/bg-artwork.png";
import LanguageSelector from "../components/landing/LanguageSelector";
import ThemeToggle from "../components/common/ThemeToggle";
import HealthShowcase from "../components/landing/HealthShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import FeatureShowcase from "../components/landing/FeatureShowcase";
import OneHealthStory from "../components/landing/OneHealthStory";
import FinalCta from "../components/landing/FinalCta";
import LandingFooter from "../components/landing/LandingFooter";
import "./Home.css";
const TRUST_ITEMS = [
    "Private workspace",
    "AI-assisted insights",
    "Organized history",
    "Secure by design",
];
const Home = () => {
    return (_jsxs("div", { className: "landing-page", children: [_jsx("div", { className: "landing-bg", style: { backgroundImage: `url(${bgArtwork})` } }), _jsx("div", { className: "landing-bg-overlay" }), _jsxs("header", { className: "landing-navbar", children: [_jsxs("div", { className: "landing-logo", children: [_jsx("div", { className: "landing-logo-mark", children: _jsx(HeartPulse, { size: 18 }) }), _jsxs("span", { children: ["Health", _jsx("span", { className: "landing-logo-accent", children: "AI" })] })] }), _jsxs("div", { className: "landing-navbar-actions", children: [_jsxs("div", { className: "landing-search", children: [_jsx(Search, { size: 14 }), _jsx("input", { type: "text", placeholder: "Search" })] }), _jsx(LanguageSelector, {}), _jsx(ThemeToggle, {}), _jsx(Link, { to: "/login", className: "landing-login-button", children: "Log in" }), _jsx(Link, { to: "/register", className: "landing-signup-button", children: "Sign up" })] })] }), _jsxs("main", { className: "landing-hero", children: [_jsxs("div", { className: "landing-hero-panel", children: [_jsxs("h1", { children: ["Understand your ", _jsx("br", {}), "health. ", _jsx("br", {}), "Explore with us"] }), _jsx("p", { children: "HealthAI helps you track symptoms, organize health records, and discover personalized wellness insights \u2014 all in one secure platform." }), _jsxs("div", { className: "landing-signup-bar", children: [_jsx("input", { type: "email", placeholder: "Enter your email address" }), _jsx(Link, { to: "/register", children: "Sign up" })] })] }), _jsx(HealthShowcase, {}), _jsxs("a", { href: "#landing-trust", className: "landing-scroll-cue", children: ["Explore HealthAI", _jsx(ChevronDown, { size: 14 })] })] }), _jsxs("div", { id: "landing-trust", className: "landing-trust-line", children: [_jsx("span", { className: "landing-trust-dot" }), TRUST_ITEMS.map((item, index) => (_jsxs("span", { className: "landing-trust-line-item", children: [item, index < TRUST_ITEMS.length - 1 && (_jsx("span", { className: "landing-trust-sep", "aria-hidden": "true", children: "\u00B7" }))] }, item)))] }), _jsx(HowItWorks, {}), _jsx(FeatureShowcase, {}), _jsx(OneHealthStory, {}), _jsx(FinalCta, {}), _jsx(LandingFooter, {})] }));
};
export default Home;
