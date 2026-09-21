import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReveal } from "../../hooks/useReveal";
const INPUTS = [
    "Profile",
    "Vitals",
    "Medications",
    "Medical Reports",
    "AI Analysis",
    "Health History",
];
const OneHealthStory = () => {
    const { ref, visible } = useReveal();
    return (_jsx("section", { className: "landing-section landing-story-section", id: "landing-story", children: _jsxs("div", { ref: ref, className: `landing-section-inner ${visible ? "is-visible" : ""}`, children: [_jsx("p", { className: "landing-section-kicker", children: "Not scattered information" }), _jsx("h2", { className: "landing-section-heading landing-story-heading", children: "One health story." }), _jsxs("div", { className: "landing-story", children: [_jsx("div", { className: "landing-story-inputs", children: INPUTS.map((input) => (_jsx("span", { className: "landing-story-input", children: input }, input))) }), _jsx("span", { className: "landing-story-connector", "aria-hidden": "true" }), _jsx("div", { className: "landing-story-output", children: "HealthAI" })] })] }) }));
};
export default OneHealthStory;
