import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ClipboardCheck, FolderHeart, History, BellRing, Sparkles, } from "lucide-react";
const INSIGHT_STATES = [
    {
        icon: Sparkles,
        label: "HealthAI Insight",
        message: "Understand your recorded health information over time.",
    },
    {
        icon: FolderHeart,
        label: "Health Records",
        message: "Keep your profile, vitals and reports organized.",
    },
    {
        icon: ClipboardCheck,
        label: "AI Analysis",
        message: "Explore educational insights from the information you provide.",
    },
    {
        icon: History,
        label: "Health History",
        message: "See your health information over time.",
    },
    {
        icon: BellRing,
        label: "Wellness Reminder",
        message: "Small, consistent habits can support everyday wellbeing.",
    },
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
/*
 * One cohesive "living health record" window rather than a cluster of
 * separate floating cards - the rotating insight is now a row inside a
 * single designed object, alongside illustrative (never invented)
 * product state: an empty-state-style profile row and placeholder vital
 * labels with no fabricated values.
 */
const HealthShowcase = () => {
    const reducedMotion = usePrefersReducedMotion();
    const [insightIndex, setInsightIndex] = useState(0);
    useEffect(() => {
        if (reducedMotion)
            return;
        const interval = setInterval(() => {
            setInsightIndex((prev) => (prev + 1) % INSIGHT_STATES.length);
        }, ROTATE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [reducedMotion]);
    const current = INSIGHT_STATES[insightIndex];
    const CurrentIcon = current.icon;
    return (_jsxs("div", { className: `landing-record ${reducedMotion ? "no-motion" : ""}`, "aria-hidden": "true", children: [_jsx("div", { className: "landing-record-glow" }), _jsxs("div", { className: "landing-record-window", children: [_jsxs("div", { className: "landing-record-header", children: [_jsx("span", { className: "landing-record-dot" }), _jsxs("div", { children: [_jsx("strong", { children: "HealthAI" }), _jsx("span", { children: "Your health timeline" })] })] }), _jsxs("div", { className: "landing-record-row", children: [_jsx("span", { className: "landing-record-row-label", children: "Profile" }), _jsx("span", { className: "landing-record-row-value landing-record-complete", children: "\u2713 Complete" })] }), _jsxs("div", { className: "landing-record-row landing-record-row-stacked", children: [_jsx("span", { className: "landing-record-row-label", children: "Vitals" }), _jsxs("div", { className: "landing-record-vitals", children: [_jsxs("div", { children: [_jsx("span", { children: "Heart rate" }), _jsx("strong", { children: "\u2014" })] }), _jsxs("div", { children: [_jsx("span", { children: "Blood pressure" }), _jsx("strong", { children: "\u2014" })] })] })] }), _jsxs("div", { className: "landing-record-row landing-record-row-stacked", children: [_jsx("span", { className: "landing-record-row-label", children: "Recent insight" }), _jsxs("div", { className: "landing-record-insight", children: [_jsxs("span", { className: "landing-record-insight-tag", children: [_jsx(CurrentIcon, { size: 12 }), current.label] }), _jsx("p", { children: current.message })] }, insightIndex)] }), _jsx("div", { className: "landing-record-footer", children: _jsx("span", { children: "03 recent updates" }) })] })] }));
};
export default HealthShowcase;
