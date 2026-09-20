import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Activity, Droplets, HeartPulse, Plus, Trash2, X, } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { createVital, deleteVital, getVitals, } from "../../api/vitals";
const VitalsCard = () => {
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({
        heartRate: "",
        systolic: "",
        diastolic: "",
        spo2: "",
    });
    const loadVitals = async () => {
        try {
            setLoading(true);
            const data = await getVitals();
            setVitals(data);
        }
        catch (error) {
            console.error("Failed to load vitals:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadVitals();
    }, []);
    const latest = vitals[0];
    const chartData = useMemo(() => {
        return [...vitals]
            .filter((vital) => {
            const date = new Date(vital.recordedAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return date >= sevenDaysAgo;
        })
            .reverse()
            .map((vital) => ({
            date: new Date(vital.recordedAt).toLocaleDateString("en-US", {
                weekday: "short",
            }),
            heartRate: vital.heartRate,
            spo2: vital.spo2,
        }));
    }, [vitals]);
    const handleSave = async (e) => {
        e.preventDefault();
        const heartRate = form.heartRate
            ? Number(form.heartRate)
            : undefined;
        const systolic = form.systolic
            ? Number(form.systolic)
            : undefined;
        const diastolic = form.diastolic
            ? Number(form.diastolic)
            : undefined;
        const spo2 = form.spo2
            ? Number(form.spo2)
            : undefined;
        if (heartRate === undefined &&
            systolic === undefined &&
            diastolic === undefined &&
            spo2 === undefined) {
            alert("Enter at least one vital reading.");
            return;
        }
        try {
            setSaving(true);
            await createVital({
                heartRate,
                systolic,
                diastolic,
                spo2,
            });
            setForm({
                heartRate: "",
                systolic: "",
                diastolic: "",
                spo2: "",
            });
            setShowForm(false);
            await loadVitals();
        }
        catch (error) {
            console.error("Failed to save vitals:", error);
            alert("Failed to save reading. Please try again.");
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await deleteVital(id);
            await loadVitals();
        }
        catch (error) {
            console.error("Failed to delete vital:", error);
            alert("Failed to delete reading.");
        }
        finally {
            setDeletingId(null);
        }
    };
    const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
    return (_jsxs("div", { className: "vitals-card glass-card", children: [_jsxs("div", { className: "vitals-header", children: [_jsxs("div", { className: "vitals-title", children: [_jsx("div", { className: "vitals-icon", children: _jsx(Activity, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Vitals & trends" }), _jsx("p", { children: "Track your recent health readings" })] })] }), _jsxs("button", { type: "button", className: "add-vital-button", onClick: () => setShowForm(true), children: [_jsx(Plus, { size: 15 }), "Add reading"] })] }), loading ? (_jsx("div", { className: "vitals-empty", children: "Loading readings..." })) : vitals.length === 0 ? (_jsxs("div", { className: "vitals-empty", children: [_jsx(Activity, { size: 22 }), _jsx("strong", { children: "No vital readings yet" }), _jsx("span", { children: "Add your first heart rate, blood pressure or SpO\u2082 reading." }), _jsx("button", { type: "button", onClick: () => setShowForm(true), children: "Add first reading" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "vitals-metrics", children: [_jsxs("div", { className: "vital-metric", children: [_jsx("div", { className: "metric-icon heart", children: _jsx(HeartPulse, { size: 17 }) }), _jsxs("div", { children: [_jsx("span", { children: "Heart rate" }), _jsxs("strong", { children: [latest.heartRate ?? "--", _jsx("small", { children: latest.heartRate
                                                            ? " bpm"
                                                            : "" })] })] })] }), _jsxs("div", { className: "vital-metric", children: [_jsx("div", { className: "metric-icon pressure", children: _jsx(Activity, { size: 17 }) }), _jsxs("div", { children: [_jsx("span", { children: "Blood pressure" }), _jsxs("strong", { children: [latest.systolic ??
                                                        latest.diastolic
                                                        ? `${latest.systolic ?? "--"}/${latest.diastolic ?? "--"}`
                                                        : "--", _jsx("small", { children: latest.systolic ||
                                                            latest.diastolic
                                                            ? " mmHg"
                                                            : "" })] })] })] }), _jsxs("div", { className: "vital-metric", children: [_jsx("div", { className: "metric-icon oxygen", children: _jsx(Droplets, { size: 17 }) }), _jsxs("div", { children: [_jsx("span", { children: "SpO\u2082" }), _jsxs("strong", { children: [latest.spo2 ?? "--", _jsx("small", { children: latest.spo2 ? "%" : "" })] })] })] })] }), _jsxs("div", { className: "vitals-chart-section", children: [_jsx("div", { className: "chart-heading", children: _jsxs("div", { children: [_jsx("strong", { children: "7-day trend" }), _jsx("span", { children: "Based on your recorded readings" })] }) }), chartData.length < 2 ? (_jsx("div", { className: "chart-empty", children: "Add another reading to see your trend." })) : (_jsx("div", { className: "vitals-chart", children: _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(LineChart, { data: chartData, children: [_jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tick: {
                                                    fontSize: 11,
                                                } }), _jsx(YAxis, { axisLine: false, tickLine: false, tick: {
                                                    fontSize: 11,
                                                }, width: 32 }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "heartRate", name: "Heart rate", stroke: "currentColor", strokeWidth: 2, dot: {
                                                    r: 3,
                                                }, connectNulls: true }), _jsx(Line, { type: "monotone", dataKey: "spo2", name: "SpO\u2082", stroke: "currentColor", strokeWidth: 2, strokeDasharray: "5 5", dot: {
                                                    r: 3,
                                                }, connectNulls: true })] }) }) }))] }), _jsxs("div", { className: "recent-vitals", children: [_jsxs("div", { className: "recent-heading", children: [_jsx("strong", { children: "Recent readings" }), _jsxs("span", { children: [vitals.length, " total"] })] }), vitals.slice(0, 4).map((vital) => (_jsxs("div", { className: "vital-history-row", children: [_jsxs("div", { children: [_jsx("strong", { children: vital.heartRate
                                                    ? `${vital.heartRate} bpm`
                                                    : "No heart rate" }), _jsxs("span", { children: [vital.systolic ||
                                                        vital.diastolic
                                                        ? `${vital.systolic ?? "--"}/${vital.diastolic ?? "--"} mmHg`
                                                        : "No BP", " ", "\u00B7", " ", vital.spo2
                                                        ? `${vital.spo2}% SpO₂`
                                                        : "No SpO₂"] })] }), _jsxs("div", { className: "vital-history-right", children: [_jsx("time", { children: formatTime(vital.recordedAt) }), _jsx("button", { type: "button", disabled: deletingId ===
                                                    vital.id, onClick: () => handleDelete(vital.id), "aria-label": "Delete reading", children: _jsx(Trash2, { size: 14 }) })] })] }, vital.id)))] })] })), showForm && (_jsx("div", { className: "vital-modal-backdrop", onMouseDown: (e) => {
                    if (e.target ===
                        e.currentTarget) {
                        setShowForm(false);
                    }
                }, children: _jsxs("div", { className: "vital-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "vital-modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Health tracking" }), _jsx("h3", { children: "Add vital reading" })] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleSave, children: [_jsxs("label", { children: [_jsxs("span", { children: ["Heart rate", _jsx("small", { children: " bpm" })] }), _jsx("input", { type: "number", min: "1", max: "300", value: form.heartRate, onChange: (e) => setForm({
                                                ...form,
                                                heartRate: e.target.value,
                                            }), placeholder: "72" })] }), _jsxs("div", { className: "bp-inputs", children: [_jsxs("label", { children: [_jsxs("span", { children: ["Systolic", _jsxs("small", { children: [" ", "mmHg"] })] }), _jsx("input", { type: "number", min: "1", max: "300", value: form.systolic, onChange: (e) => setForm({
                                                        ...form,
                                                        systolic: e.target.value,
                                                    }), placeholder: "120" })] }), _jsxs("label", { children: [_jsxs("span", { children: ["Diastolic", _jsxs("small", { children: [" ", "mmHg"] })] }), _jsx("input", { type: "number", min: "1", max: "200", value: form.diastolic, onChange: (e) => setForm({
                                                        ...form,
                                                        diastolic: e.target.value,
                                                    }), placeholder: "80" })] })] }), _jsxs("label", { children: [_jsxs("span", { children: ["SpO\u2082", _jsx("small", { children: " %" })] }), _jsx("input", { type: "number", min: "1", max: "100", value: form.spo2, onChange: (e) => setForm({
                                                ...form,
                                                spo2: e.target.value,
                                            }), placeholder: "98" })] }), _jsx("p", { className: "vital-disclaimer", children: "Enter readings from your own device or measurement. This tracker does not diagnose medical conditions." }), _jsx("button", { type: "submit", disabled: saving, className: "save-vital-button", children: saving
                                        ? "Saving..."
                                        : "Save reading" })] })] }) }))] }));
};
export default VitalsCard;
