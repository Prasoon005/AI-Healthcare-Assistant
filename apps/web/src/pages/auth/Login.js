import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { HeartPulse, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";
const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!password) {
            setError("Please enter your password.");
            return;
        }
        try {
            setLoading(true);
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });
            const { accessToken, refreshToken, user } = response.data.data;
            login(user, accessToken, refreshToken);
            navigate("/dashboard");
        }
        catch (err) {
            setError(err?.response?.data?.message ||
                "Invalid email or password.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "relative min-h-screen w-full overflow-hidden text-slate-900 dark:text-zinc-100", children: [_jsx("div", { className: "fixed inset-0 -z-10 dark:brightness-[0.32] dark:saturate-[1.15]", style: {
                    backgroundImage: `url(${bgArtwork})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                } }), _jsxs("header", { className: "flex h-[68px] items-center justify-between border-b border-white/30 bg-white/15 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 sm:px-10", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3 no-underline", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-[#09090b] dark:bg-zinc-100", children: _jsx(HeartPulse, { size: 18, className: "text-white dark:text-zinc-900" }) }), _jsxs("span", { className: "text-base font-bold tracking-tight text-[#18181b] dark:text-zinc-100", children: ["Health", _jsx("span", { className: "text-teal-600 dark:text-teal-400", children: "AI" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ThemeToggle, { className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/25 text-slate-600 transition hover:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10" }), _jsx(Link, { to: "/register", className: "rounded-full bg-[#09090b] px-5 py-2 text-sm font-semibold text-white no-underline dark:bg-zinc-100 dark:text-zinc-900", children: "Sign up" })] })] }), _jsx("main", { className: "flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-10", children: _jsxs("div", { className: "w-full max-w-[430px] rounded-[32px] border border-white/55 bg-white/18 p-11 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/55", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "mb-2 text-sm font-semibold text-slate-600 dark:text-zinc-400", children: "Welcome back" }), _jsx("h1", { className: "text-4xl font-extrabold leading-[1.1] tracking-[-1.2px] text-[#09090b] dark:text-zinc-100", children: "Sign in to HealthAI" }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400", children: "Continue to your personal health dashboard." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "login-email", className: "mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300", children: "Email address" }), _jsx("input", { id: "login-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", disabled: loading, className: "h-12 w-full rounded-2xl border border-white/65 bg-white/28 px-4 text-sm text-[#09090b] outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500" })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("label", { htmlFor: "login-password", className: "text-sm font-semibold text-slate-700 dark:text-zinc-300", children: "Password" }), _jsx("button", { type: "button", className: "border-0 bg-transparent p-0 text-xs text-slate-600 dark:text-zinc-400", children: "Forgot password?" })] }), _jsx("input", { id: "login-password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", disabled: loading, className: "h-12 w-full rounded-2xl border border-white/65 bg-white/28 px-4 text-sm text-[#09090b] outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500" })] }), error && (_jsx("div", { className: "rounded-xl border border-red-400/40 bg-red-100/70 px-3.5 py-3 text-xs font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400", children: error })), _jsxs("button", { type: "submit", disabled: loading, className: "mt-1 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl border-0 bg-[#09090b] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-65 dark:bg-zinc-100 dark:text-zinc-900", children: [loading ? "Signing in..." : "Sign in", !loading && _jsx(ArrowRight, { size: 17 })] })] }), _jsxs("p", { className: "mt-7 text-center text-sm text-slate-600 dark:text-zinc-400", children: ["Don't have an account?", " ", _jsx(Link, { to: "/register", className: "font-bold text-[#09090b] no-underline dark:text-zinc-100", children: "Create one" })] })] }) })] }));
};
export default Login;
