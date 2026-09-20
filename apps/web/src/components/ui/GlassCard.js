import { jsx as _jsx } from "react/jsx-runtime";
const GlassCard = ({ className = "", children, ...props }) => {
    return (_jsx("div", { className: `rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl ${className}`, ...props, children: children }));
};
export default GlassCard;
