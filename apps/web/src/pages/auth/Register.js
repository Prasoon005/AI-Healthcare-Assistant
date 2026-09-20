import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, HeartPulse } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";
import { registerUser } from "../../api/auth";
const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setError("");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (form.name.trim().length < 3) {
            setError("Name must be at least 3 characters.");
            return;
        }
        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!form.email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const response = await registerUser({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            setSuccess(response.message || "Account created successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        }
        catch (err) {
            const message = err?.response?.data?.message ||
                "Something went wrong. Please try again.";
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen w-full overflow-hidden text-slate-900", style: {
            backgroundImage: `url(${bgArtwork})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }, children: [_jsxs("header", { className: "flex h-[68px] items-center justify-between border-b border-white/30 bg-white/15 px-5 backdrop-blur-xl sm:px-10", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3 no-underline", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-[#09090b]", children: _jsx(HeartPulse, { size: 19, color: "white" }) }), _jsxs("span", { className: "text-lg font-bold tracking-tight", children: ["Health", _jsx("span", { className: "text-teal-600", children: "AI" })] })] }), _jsx(Link, { to: "/login", className: "rounded-full border border-white/50 bg-white/25 px-5 py-2 text-sm font-semibold text-slate-900 no-underline backdrop-blur-md transition hover:bg-white/40", children: "Log in" })] }), _jsx("main", { className: "flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-10", children: _jsxs("div", { className: "w-full max-w-[560px] rounded-[32px] border border-white/60 bg-white/20 p-7 shadow-2xl backdrop-blur-xl sm:p-10", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "mb-2 text-sm font-semibold text-slate-600", children: "New to HealthAI?" }), _jsxs("h1", { className: "text-4xl font-extrabold leading-[1.05] tracking-[-1.5px] text-slate-950 sm:text-5xl", children: ["Create your", _jsx("br", {}), "HealthAI account"] }), _jsx("p", { className: "mt-4 max-w-[440px] text-sm leading-6 text-slate-600 sm:text-base", children: "Start organizing your health information and get meaningful wellness insights in one secure place." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-semibold text-slate-800", children: "Full name" }), _jsx("input", { name: "name", type: "text", value: form.name, onChange: handleChange, placeholder: "Your full name", disabled: loading, className: "w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-semibold text-slate-800", children: "Email address" }), _jsx("input", { name: "email", type: "email", value: form.email, onChange: handleChange, placeholder: "you@example.com", disabled: loading, className: "w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-semibold text-slate-800", children: "Password" }), _jsx("input", { name: "password", type: "password", value: form.password, onChange: handleChange, placeholder: "Create a strong password", disabled: loading, className: "w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60" })] }), error && (_jsx("div", { className: "rounded-2xl border border-red-300/50 bg-red-100/40 px-4 py-3 text-sm font-medium text-red-700", children: error })), success && (_jsx("div", { className: "rounded-2xl border border-emerald-300/50 bg-emerald-100/40 px-4 py-3 text-sm font-medium text-emerald-700", children: success })), _jsxs("button", { type: "submit", disabled: loading, className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#09090b] px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-black disabled:cursor-not-allowed disabled:opacity-60", children: [loading ? "Creating account..." : "Create account", !loading && _jsx(ArrowRight, { size: 18 })] })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-slate-600", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "font-bold text-slate-950 no-underline hover:underline", children: "Sign in" })] }), _jsx("p", { className: "mt-4 text-center text-xs leading-5 text-slate-500", children: "By creating an account, you agree to our Terms of Service and Privacy Policy." })] }) })] }));
};
export default Register;
