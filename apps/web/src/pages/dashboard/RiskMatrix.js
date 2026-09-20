import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Activity, Brain, HeartPulse, ShieldCheck, X, } from "lucide-react";
import { getRiskMatrix, } from "../../api/risk";
const icons = {
    cardio: HeartPulse,
    metabolic: Activity,
    recovery: Brain,
};
const RiskMatrix = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(false);
    const [completeness, setCompleteness] = useState(0);
    const [disclaimer, setDisclaimer] = useState("");
    const loadRiskMatrix = async () => {
        try {
            setLoading(true);
            const data = await getRiskMatrix();
            setAvailable(data.available);
            setItems(data.items);
            setCompleteness(data.completeness);
            setDisclaimer(data.disclaimer ?? "");
        }
        catch (error) {
            console.error("Failed to load risk matrix:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRiskMatrix();
    }, []);
    const getIcon = (key) => {
        if (key in icons) {
            return icons[key];
        }
        return Activity;
    };
    const getLevelLabel = (level) => {
        if (level === "low") {
            return "Low attention";
        }
        if (level === "moderate") {
            return "Moderate attention";
        }
        return "Higher attention";
    };
    if (loading) {
        return (_jsx("div", { className: "risk-matrix-card glass-card", children: _jsx("div", { className: "risk-loading", children: "Loading wellness assessment..." }) }));
    }
    return (_jsxs("div", { className: "risk-matrix-card glass-card", children: [_jsxs("div", { className: "risk-header", children: [_jsxs("div", { className: "risk-title", children: [_jsx("div", { className: "risk-main-icon", children: _jsx(ShieldCheck, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Preventive wellness" }), _jsx("p", { children: "Lifestyle-based attention indicators" })] })] }), available && (_jsxs("div", { className: "risk-completeness", children: [completeness, "% profile"] }))] }), !available ? (_jsxs("div", { className: "risk-unavailable", children: [_jsx(ShieldCheck, { size: 25 }), _jsx("strong", { children: "Complete your health profile" }), _jsx("span", { children: "Add your age, activity, sleep and lifestyle details to generate personalized wellness indicators." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "risk-grid", children: items.map((item) => {
                            const Icon = getIcon(item.key);
                            return (_jsxs("div", { className: `risk-item ${item.level}`, children: [_jsxs("div", { className: "risk-item-top", children: [_jsx("div", { className: "risk-item-icon", children: _jsx(Icon, { size: 17 }) }), _jsx("span", { className: `risk-badge ${item.level}`, children: getLevelLabel(item.level) })] }), _jsxs("div", { className: "risk-item-content", children: [_jsx("strong", { children: item.label }), _jsx("p", { children: item.description })] }), _jsx("div", { className: "risk-meter", children: _jsx("div", { className: "risk-meter-fill", style: {
                                                width: `${item.score}%`,
                                            } }) }), _jsxs("div", { className: "risk-score", children: [_jsx("span", { children: "Attention indicator" }), _jsxs("strong", { children: [item.score, "/100"] })] })] }, item.key));
                        }) }), _jsxs("div", { className: "risk-disclaimer", children: [_jsx(X, { size: 13 }), _jsx("span", { children: disclaimer ||
                                    "These indicators are educational wellness signals and are not a medical diagnosis." })] })] }))] }));
};
export default RiskMatrix;
