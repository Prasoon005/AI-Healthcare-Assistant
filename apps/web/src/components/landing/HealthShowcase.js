import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, FolderHeart, Sparkles } from "lucide-react";
const INSIGHT_MESSAGES = [
    "Your health story, organized in one place.",
    "Keep your profile, vitals, medications and reports together.",
    "Understand your health information with context from your history.",
    "Small, consistent habits can make everyday wellness easier to manage.",
    "Track. Understand. Stay informed.",
    "Your health information, organized for better understanding.",
];
const ROTATE_INTERVAL_MS = 6500;
const usePrefersReducedMotion = () => {
    const [reduced, setReduced] = useState(() => {
        if (typeof window === "undefined")
            return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = () => setReduced(media.matches);
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, []);
    return reduced;
};
const HealthShowcase = () => {
    const reducedMotion = usePrefersReducedMotion();
    const [insightIndex, setInsightIndex] = useState(0);
    useEffect(() => {
        if (reducedMotion)
            return;
        const interval = setInterval(() => {
            setInsightIndex((prev) => (prev + 1) % INSIGHT_MESSAGES.length);
        }, ROTATE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [reducedMotion]);
    return (_jsxs("div", { className: "landing-showcase", "aria-hidden": "true", children: [_jsx("div", { className: "landing-showcase-glow" }), _jsxs("div", { className: "landing-showcase-grid", children: [_jsxs("div", { className: "landing-showcase-card landing-showcase-primary", children: [_jsxs("span", { className: "landing-showcase-label", children: [_jsx(Sparkles, { size: 13 }), "HealthAI Insight"] }), _jsx("p", { className: "landing-showcase-insight", children: INSIGHT_MESSAGES[insightIndex] }, insightIndex), _jsx("div", { className: "landing-showcase-dots", children: INSIGHT_MESSAGES.map((_, index) => (_jsx("span", { className: index === insightIndex ? "active" : "" }, index))) })] }), _jsxs("div", { className: "landing-showcase-row", children: [_jsxs("div", { className: "landing-showcase-card landing-showcase-tile", children: [_jsx("div", { className: "landing-showcase-icon", children: _jsx(FolderHeart, { size: 16 }) }), _jsx("strong", { children: "Health Records" }), _jsx("span", { children: "Profile \u00B7 Vitals \u00B7 Reports" })] }), _jsxs("div", { className: "landing-showcase-card landing-showcase-tile", children: [_jsx("div", { className: "landing-showcase-icon", children: _jsx(ClipboardCheck, { size: 16 }) }), _jsx("strong", { children: "AI Analysis" }), _jsx("span", { children: "Understand your health information" })] }), _jsxs("div", { className: "landing-showcase-card landing-showcase-tile", children: [_jsx("div", { className: "landing-showcase-icon", children: _jsx(FileText, { size: 16 }) }), _jsx("strong", { children: "Medical Vault" }), _jsx("span", { children: "Keep important reports organized" })] })] })] })] }));
};
export default HealthShowcase;
