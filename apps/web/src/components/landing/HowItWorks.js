import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReveal } from "../../hooks/useReveal";
const STEPS = [
    {
        index: "01",
        title: "Build your profile",
        body: "Tell HealthAI what matters about you.",
    },
    {
        index: "02",
        title: "Understand",
        body: "Analyze symptoms and health information.",
    },
    {
        index: "03",
        title: "Organize",
        body: "Keep reports, medications and vitals together.",
    },
    {
        index: "04",
        title: "See the bigger picture",
        body: "Understand your health history over time.",
    },
];
const HowItWorks = () => {
    const { ref, visible } = useReveal();
    return (_jsx("section", { className: "landing-section", id: "landing-how-it-works", children: _jsxs("div", { ref: ref, className: `landing-section-inner ${visible ? "is-visible" : ""}`, children: [_jsx("p", { className: "landing-section-kicker", children: "Your health, connected" }), _jsx("h2", { className: "landing-section-heading", children: "How HealthAI works" }), _jsx("div", { className: "landing-steps", children: STEPS.map((step, index) => (_jsxs("div", { className: "landing-step", children: [_jsxs("div", { className: "landing-step-marker", children: [_jsx("span", { className: "landing-step-index", children: step.index }), index < STEPS.length - 1 && (_jsx("span", { className: "landing-step-line" }))] }), _jsxs("div", { className: "landing-step-content", children: [_jsx("h3", { children: step.title }), _jsx("p", { children: step.body })] })] }, step.index))) })] }) }));
};
export default HowItWorks;
