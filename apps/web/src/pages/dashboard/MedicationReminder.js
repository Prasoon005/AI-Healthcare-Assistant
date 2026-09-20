import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Plus, Pill, Trash2, X, } from "lucide-react";
import { createMedication, deleteMedication, getTodayMedications, takeMedication, } from "../../api/medications";
const MedicationReminder = () => {
    const [medications, setMedications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        dosage: "",
        instructions: "",
        time: "09:00",
    });
    const loadMedications = async () => {
        try {
            setLoading(true);
            const data = await getTodayMedications();
            setMedications(data);
        }
        catch (error) {
            console.error("Failed to load medications:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadMedications();
    }, []);
    const doses = useMemo(() => medications.flatMap((medicine) => medicine.doses.map((dose) => ({
        medicine,
        dose,
    }))), [medications]);
    const completed = doses.filter((item) => item.dose.taken).length;
    /* ================= CREATE ================= */
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("Please enter medicine name.");
            return;
        }
        if (!form.dosage.trim()) {
            alert("Please enter dosage.");
            return;
        }
        try {
            setSaving(true);
            await createMedication({
                name: form.name.trim(),
                dosage: form.dosage.trim(),
                instructions: form.instructions.trim(),
                times: [form.time],
            });
            setForm({
                name: "",
                dosage: "",
                instructions: "",
                time: "09:00",
            });
            setShowForm(false);
            await loadMedications();
        }
        catch (error) {
            console.error("Failed to save medication:", error);
            alert("Failed to save medication. Please try again.");
        }
        finally {
            setSaving(false);
        }
    };
    /* ================= DELETE ================= */
    const handleDelete = async (medicationId, medicationName) => {
        const confirmed = window.confirm(`Remove "${medicationName}" from your medicine reminders?`);
        if (!confirmed)
            return;
        try {
            setDeletingId(medicationId);
            await deleteMedication(medicationId);
            await loadMedications();
        }
        catch (error) {
            console.error("Failed to delete medication:", error);
            alert("Failed to remove medication. Please try again.");
        }
        finally {
            setDeletingId(null);
        }
    };
    /* ================= TAKE ================= */
    const handleTake = async (medicationId, logId, scheduledTime) => {
        try {
            await takeMedication(medicationId, logId, scheduledTime);
            await loadMedications();
        }
        catch (error) {
            console.error("Failed to mark medication as taken:", error);
        }
    };
    /* ================= STATUS ================= */
    const getStatus = (time, taken) => {
        if (taken)
            return "Taken";
        const now = new Date();
        const [hours, minutes] = time
            .split(":")
            .map(Number);
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);
        if (scheduled.getTime() < now.getTime()) {
            return "Missed";
        }
        return "Upcoming";
    };
    return (_jsxs("div", { className: "medication-widget glass-card", children: [_jsxs("div", { className: "medication-header", children: [_jsxs("div", { className: "medication-title", children: [_jsx("div", { className: "medication-icon", children: _jsx(Pill, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Today's medicines" }), _jsxs("p", { children: [completed, "/", doses.length, " doses completed"] })] })] }), _jsxs("button", { type: "button", className: "add-medication-button", onClick: () => setShowForm(true), children: [_jsx(Plus, { size: 15 }), "Add"] })] }), loading ? (_jsx("div", { className: "medication-empty", children: "Loading medicines..." })) : doses.length === 0 ? (_jsxs("div", { className: "medication-empty", children: [_jsx(Pill, { size: 20 }), _jsx("strong", { children: "No medicines added" }), _jsx("span", { children: "Add your daily medicine schedule to keep track of your doses." }), _jsx("button", { type: "button", onClick: () => setShowForm(true), children: "Add medicine" })] })) : (_jsx("div", { className: "medication-list", children: doses.map(({ medicine, dose }) => {
                    const status = getStatus(dose.scheduledTime, dose.taken);
                    return (_jsxs("div", { className: `medicine-row ${dose.taken ? "taken" : ""}`, children: [_jsxs("div", { className: "medicine-main", children: [_jsx("div", { className: "medicine-dot", children: _jsx(Pill, { size: 15 }) }), _jsxs("div", { children: [_jsx("strong", { children: medicine.name }), _jsxs("span", { children: [medicine.dosage, medicine.instructions
                                                        ? ` · ${medicine.instructions}`
                                                        : ""] })] })] }), _jsxs("div", { className: "medicine-time", children: [_jsx(Clock3, { size: 13 }), dose.scheduledTime] }), _jsxs("div", { className: "medicine-actions", children: [status === "Taken" ? (_jsxs("div", { className: "medicine-status taken-status", children: [_jsx(Check, { size: 14 }), "Taken"] })) : (_jsx("button", { type: "button", className: "take-button", onClick: () => handleTake(medicine.id, dose.id, dose.scheduledTime), children: status === "Missed"
                                            ? "Mark taken"
                                            : "Take now" })), _jsxs("button", { type: "button", className: "delete-medication-button", disabled: deletingId === medicine.id, onClick: () => handleDelete(medicine.id, medicine.name), "aria-label": `Remove ${medicine.name}`, title: "Remove medicine", children: [_jsx(Trash2, { size: 15 }), deletingId === medicine.id
                                                ? "..."
                                                : ""] })] })] }, dose.id));
                }) })), showForm && (_jsx("div", { className: "medication-modal-backdrop", onMouseDown: (e) => {
                    if (e.target === e.currentTarget) {
                        setShowForm(false);
                    }
                }, children: _jsxs("div", { className: "medication-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Add medication" }), _jsx("h3", { children: "Create a daily reminder" })] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleCreate, children: [_jsxs("label", { children: [_jsx("span", { children: "Medicine name" }), _jsx("input", { type: "text", value: form.name, onChange: (e) => setForm({
                                                ...form,
                                                name: e.target.value,
                                            }), placeholder: "e.g. Vitamin D", autoFocus: true })] }), _jsxs("label", { children: [_jsx("span", { children: "Dosage" }), _jsx("input", { type: "text", value: form.dosage, onChange: (e) => setForm({
                                                ...form,
                                                dosage: e.target.value,
                                            }), placeholder: "e.g. 500 IU" })] }), _jsxs("label", { children: [_jsx("span", { children: "Instructions" }), _jsx("input", { type: "text", value: form.instructions, onChange: (e) => setForm({
                                                ...form,
                                                instructions: e.target.value,
                                            }), placeholder: "Optional" })] }), _jsxs("label", { children: [_jsx("span", { children: "Reminder time" }), _jsx("input", { type: "time", value: form.time, onChange: (e) => setForm({
                                                ...form,
                                                time: e.target.value,
                                            }) })] }), _jsx("button", { type: "submit", disabled: saving, className: "save-medication", children: saving
                                        ? "Saving..."
                                        : "Save reminder" })] })] }) }))] }));
};
export default MedicationReminder;
