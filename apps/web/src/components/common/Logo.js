import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeartPulse } from "lucide-react";
const Logo = () => {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black", children: _jsx(HeartPulse, { size: 20 }) }), _jsx("span", { className: "text-lg font-semibold tracking-tight text-white", children: "HealthAI" })] }));
};
export default Logo;
