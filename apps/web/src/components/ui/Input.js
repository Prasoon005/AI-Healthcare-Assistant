import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Input = ({ label, error, className = "", ...props }) => {
    return (_jsxs("div", { className: "space-y-2", children: [label && (_jsx("label", { className: "block text-sm font-medium text-zinc-300", children: label })), _jsx("input", { className: `w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition-all focus:border-white/30 focus:bg-white/[0.07] ${className}`, ...props }), error && (_jsx("p", { className: "text-xs text-red-400", children: error }))] }));
};
export default Input;
