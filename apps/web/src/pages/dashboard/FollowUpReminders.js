import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Check, Clock3, Plus, X, } from "lucide-react";
import { createReminder, deleteReminder, getReminders, } from "../../api/reminders";
const emptyForm = {
    title: "",
    note: "",
    dueDate: "",
};
const isOverdue = (dueDate) => new Date(dueDate).getTime() < Date.now();
const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const days = Math.round((date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (days === 0)
        return "Today";
    if (days === 1)
        return "Tomorrow";
    if (days === -1)
        return "Yesterday";
    if (days < 0)
        return `${Math.abs(days)} days overdue`;
    return new Date(dueDate).toLocaleDateString();
};
const FollowUpReminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const loadReminders = async () => {
        try {
            setLoading(true);
            const data = await getReminders();
            setReminders(data);
        }
        catch (error) {
            console.error("Failed to load reminders:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadReminders();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            alert("Please enter a reminder title.");
            return;
        }
        if (!form.dueDate) {
            alert("Please choose a date.");
            return;
        }
        try {
            setSaving(true);
            await createReminder({
                title: form.title.trim(),
                note: form.note.trim() || undefined,
                dueDate: form.dueDate,
            });
            setForm(emptyForm);
            setShowForm(false);
            await loadReminders();
        }
        catch (error) {
            console.error("Failed to save reminder:", error);
            alert("Failed to save reminder. Please try again.");
        }
        finally {
            setSaving(false);
        }
    };
    const handleMarkDone = async (id) => {
        try {
            setRemovingId(id);
            await deleteReminder(id);
            await loadReminders();
        }
        catch (error) {
            console.error("Failed to remove reminder:", error);
            alert("Failed to remove reminder. Please try again.");
        }
        finally {
            setRemovingId(null);
        }
    };
    return (_jsxs("div", { className: "reminder-widget glass-card", children: [_jsxs("div", { className: "reminder-header", children: [_jsxs("div", { className: "reminder-title", children: [_jsx("div", { className: "reminder-icon", children: _jsx(BellRing, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Follow-up reminders" }), _jsxs("p", { children: [reminders.length, " upcoming"] })] })] }), _jsxs("button", { type: "button", className: "add-reminder-button", onClick: () => setShowForm(true), children: [_jsx(Plus, { size: 15 }), "Add"] })] }), loading ? (_jsx("div", { className: "reminder-empty", children: "Loading reminders..." })) : reminders.length === 0 ? (_jsxs("div", { className: "reminder-empty", children: [_jsx(BellRing, { size: 20 }), _jsx("strong", { children: "No reminders yet" }), _jsx("span", { children: "Reminders are created automatically after a health analysis suggests following up, or you can add your own." }), _jsx("button", { type: "button", onClick: () => setShowForm(true), children: "Add reminder" })] })) : (_jsx("div", { className: "reminder-list", children: reminders.map((reminder) => (_jsxs("div", { className: `reminder-row ${isOverdue(reminder.dueDate) ? "overdue" : ""}`, children: [_jsxs("div", { className: "reminder-main", children: [_jsx("div", { className: "reminder-dot", children: _jsx(Clock3, { size: 15 }) }), _jsxs("div", { children: [reminder.analysisId ? (_jsx(Link, { to: `/analysis?id=${reminder.analysisId}`, className: "reminder-title-link", children: reminder.title })) : (_jsx("strong", { children: reminder.title })), reminder.note && _jsx("span", { children: reminder.note })] })] }), _jsx("div", { className: "reminder-due", children: formatDueDate(reminder.dueDate) }), _jsxs("button", { type: "button", className: "reminder-done-button", disabled: removingId === reminder.id, onClick: () => handleMarkDone(reminder.id), "aria-label": `Mark "${reminder.title}" done`, title: "Mark done", children: [_jsx(Check, { size: 14 }), removingId === reminder.id ? "..." : "Done"] })] }, reminder.id))) })), showForm && (_jsx("div", { className: "medication-modal-backdrop", onMouseDown: (e) => {
                    if (e.target === e.currentTarget)
                        setShowForm(false);
                }, children: _jsxs("div", { className: "medication-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Add reminder" }), _jsx("h3", { children: "Create a follow-up reminder" })] }), _jsx("button", { type: "button", onClick: () => setShowForm(false), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleCreate, children: [_jsxs("label", { children: [_jsx("span", { children: "Title" }), _jsx("input", { type: "text", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Book a dentist appointment", autoFocus: true, maxLength: 150 })] }), _jsxs("label", { children: [_jsx("span", { children: "Note (optional)" }), _jsx("input", { type: "text", value: form.note, onChange: (e) => setForm({ ...form, note: e.target.value }), placeholder: "Optional details", maxLength: 300 })] }), _jsxs("label", { children: [_jsx("span", { children: "Date" }), _jsx("input", { type: "date", value: form.dueDate, onChange: (e) => setForm({ ...form, dueDate: e.target.value }) })] }), _jsx("button", { type: "submit", disabled: saving, className: "save-medication", children: saving ? "Saving..." : "Save reminder" })] })] }) }))] }));
};
export default FollowUpReminders;
