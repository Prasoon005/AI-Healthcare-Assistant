import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ComingSoon = ({ icon: Icon, title, description }) => {
    return (_jsxs("section", { className: "coming-soon-card glass-card", children: [_jsx("div", { className: "coming-soon-icon", children: _jsx(Icon, { size: 26 }) }), _jsx("h2", { children: title }), _jsx("p", { children: description }), _jsx("span", { className: "coming-soon-badge", children: "Coming soon" })] }));
};
export default ComingSoon;
