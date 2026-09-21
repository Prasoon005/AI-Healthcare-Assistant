import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "../../hooks/useReveal";
const FinalCta = () => {
    const { ref, visible } = useReveal();
    return (_jsx("section", { className: "landing-section landing-final-cta", id: "landing-cta", children: _jsxs("div", { ref: ref, className: `landing-section-inner ${visible ? "is-visible" : ""}`, children: [_jsx("h2", { className: "landing-final-cta-heading", children: "Start understanding your health today." }), _jsx("p", { className: "landing-final-cta-body", children: "Keep everything important in one place, and make sense of it over time." }), _jsxs(Link, { to: "/register", className: "landing-signup-button landing-final-cta-button", children: ["Sign up", _jsx(ArrowRight, { size: 15 })] })] }) }));
};
export default FinalCta;
