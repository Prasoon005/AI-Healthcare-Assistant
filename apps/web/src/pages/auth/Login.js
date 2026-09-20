import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { HeartPulse, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
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
    return (_jsxs("div", { style: {
            minHeight: "100vh",
            width: "100%",
            position: "relative",
            overflow: "hidden",
            fontFamily: "sans-serif",
            color: "#18181b",
            backgroundImage: `url(${bgArtwork})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }, children: [_jsxs("header", { style: {
                    height: "68px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 40px",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.3)",
                    boxSizing: "border-box",
                }, children: [_jsxs(Link, { to: "/", style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            textDecoration: "none",
                            color: "#18181b",
                        }, children: [_jsx("div", { style: {
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: "#18181b",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }, children: _jsx(HeartPulse, { size: 18, color: "#ffffff" }) }), _jsxs("span", { style: {
                                    fontWeight: 700,
                                    fontSize: "16px",
                                }, children: ["Health", _jsx("span", { style: { color: "#0d9488" }, children: "AI" })] })] }), _jsx(Link, { to: "/register", style: {
                            padding: "8px 20px",
                            borderRadius: "22px",
                            backgroundColor: "#09090b",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                        }, children: "Sign up" })] }), _jsx("main", { style: {
                    minHeight: "calc(100vh - 68px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    boxSizing: "border-box",
                }, children: _jsxs("div", { style: {
                        width: "100%",
                        maxWidth: "430px",
                        padding: "44px",
                        borderRadius: "32px",
                        backgroundColor: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                        border: "1px solid rgba(255,255,255,0.55)",
                        boxShadow: "0 24px 70px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5)",
                        boxSizing: "border-box",
                    }, children: [_jsxs("div", { style: { marginBottom: "32px" }, children: [_jsx("p", { style: {
                                        margin: "0 0 8px",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#475569",
                                    }, children: "Welcome back" }), _jsx("h1", { style: {
                                        margin: 0,
                                        fontSize: "38px",
                                        lineHeight: "1.1",
                                        letterSpacing: "-1.2px",
                                        fontWeight: 800,
                                        color: "#09090b",
                                    }, children: "Sign in to HealthAI" }), _jsx("p", { style: {
                                        margin: "12px 0 0",
                                        fontSize: "14px",
                                        lineHeight: "1.6",
                                        color: "#475569",
                                    }, children: "Continue to your personal health dashboard." })] }), _jsxs("form", { onSubmit: handleSubmit, style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                display: "block",
                                                marginBottom: "8px",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: "#334155",
                                            }, children: "Email address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", disabled: loading, style: {
                                                width: "100%",
                                                height: "48px",
                                                padding: "0 16px",
                                                borderRadius: "14px",
                                                border: "1px solid rgba(255,255,255,0.65)",
                                                backgroundColor: "rgba(255,255,255,0.28)",
                                                outline: "none",
                                                fontSize: "14px",
                                                color: "#09090b",
                                                boxSizing: "border-box",
                                            } })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "8px",
                                            }, children: [_jsx("label", { style: {
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                        color: "#334155",
                                                    }, children: "Password" }), _jsx("button", { type: "button", style: {
                                                        border: "none",
                                                        background: "none",
                                                        padding: 0,
                                                        fontSize: "12px",
                                                        color: "#475569",
                                                        cursor: "pointer",
                                                    }, children: "Forgot password?" })] }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", disabled: loading, style: {
                                                width: "100%",
                                                height: "48px",
                                                padding: "0 16px",
                                                borderRadius: "14px",
                                                border: "1px solid rgba(255,255,255,0.65)",
                                                backgroundColor: "rgba(255,255,255,0.28)",
                                                outline: "none",
                                                fontSize: "14px",
                                                color: "#09090b",
                                                boxSizing: "border-box",
                                            } })] }), error && (_jsx("div", { style: {
                                        padding: "12px 14px",
                                        borderRadius: "12px",
                                        backgroundColor: "rgba(254,226,226,0.7)",
                                        border: "1px solid rgba(248,113,113,0.4)",
                                        color: "#b91c1c",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                    }, children: error })), _jsxs("button", { type: "submit", disabled: loading, style: {
                                        width: "100%",
                                        height: "50px",
                                        marginTop: "4px",
                                        border: "none",
                                        borderRadius: "15px",
                                        backgroundColor: "#09090b",
                                        color: "#ffffff",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.65 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }, children: [loading ? "Signing in..." : "Sign in", !loading && _jsx(ArrowRight, { size: 17 })] })] }), _jsxs("p", { style: {
                                margin: "28px 0 0",
                                textAlign: "center",
                                fontSize: "13px",
                                color: "#475569",
                            }, children: ["Don't have an account?", " ", _jsx(Link, { to: "/register", style: {
                                        color: "#09090b",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                    }, children: "Create one" })] })] }) })] }));
};
export default Login;
