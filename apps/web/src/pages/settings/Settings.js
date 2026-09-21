import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Download, FileText, History as HistoryIcon, Info, KeyRound, LogOut, MessageSquareHeart, ShieldCheck, Trash2, UserRound, } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { changePassword, deleteAccount, exportAccountData, getAccount, logoutAllDevices, updateAccount, } from "../../api/account";
import { FEEDBACK_CATEGORY_OPTIONS, submitFeedback, } from "../../api/feedback";
const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
});
/* ============================================================
   ACCOUNT SECTION
============================================================ */
const AccountSection = ({ account, onUpdated, }) => {
    const [name, setName] = useState(account.name);
    const [email, setEmail] = useState(account.email);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const isDirty = name.trim() !== account.name || email.trim() !== account.email;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isDirty || saving)
            return;
        try {
            setSaving(true);
            setError("");
            setSuccess(false);
            const updated = await updateAccount({
                name: name.trim(),
                email: email.trim(),
            });
            onUpdated(updated);
            setSuccess(true);
        }
        catch (err) {
            console.error("Failed to update account:", err);
            setError(err?.response?.data?.message ||
                "Unable to update your account right now.");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(UserRound, { size: 16, className: "analysis-header-icon" }), "Account"] }), _jsxs("p", { children: ["Member since ", formatDate(account.createdAt)] })] }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "settings-name", children: "Name" }), _jsx("input", { id: "settings-name", value: name, onChange: (e) => {
                                            setName(e.target.value);
                                            setSuccess(false);
                                        }, maxLength: 100 })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "settings-email", children: "Email" }), _jsx("input", { id: "settings-email", type: "email", value: email, onChange: (e) => {
                                            setEmail(e.target.value);
                                            setSuccess(false);
                                        }, maxLength: 200 })] })] }), error && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })), success && (_jsxs("div", { className: "profile-success-banner", children: [_jsx(CheckCircle2, { size: 16 }), "Account details updated."] })), _jsx("div", { className: "profile-actions-bar", children: _jsx("button", { type: "submit", className: "profile-save-button", disabled: !isDirty || saving, children: saving ? "Saving..." : "Save changes" }) })] })] }));
};
/* ============================================================
   SECURITY SECTION
============================================================ */
const SecuritySection = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);
    const [logoutAllError, setLogoutAllError] = useState("");
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordSaving)
            return;
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all three password fields.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordError("New password must be different from your current password.");
            return;
        }
        try {
            setPasswordSaving(true);
            setPasswordError("");
            setPasswordSuccess(false);
            await changePassword({ currentPassword, newPassword, confirmPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordSuccess(true);
        }
        catch (err) {
            console.error("Failed to change password:", err);
            setPasswordError(err?.response?.data?.message ||
                "Unable to change your password right now.");
        }
        finally {
            setPasswordSaving(false);
        }
    };
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const handleLogoutAllDevices = async () => {
        try {
            setLogoutAllLoading(true);
            setLogoutAllError("");
            await logoutAllDevices();
            logout();
            navigate("/login");
        }
        catch (err) {
            console.error("Failed to log out of all devices:", err);
            setLogoutAllError(err?.response?.data?.message ||
                "Unable to log out of all devices right now.");
            setLogoutAllLoading(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(KeyRound, { size: 16, className: "analysis-header-icon" }), "Security"] }), _jsx("p", { children: "Change your password and manage sessions" })] }) }), _jsxs("form", { onSubmit: handleChangePassword, children: [_jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "current-password", children: "Current password" }), _jsx("input", { id: "current-password", type: "password", value: currentPassword, onChange: (e) => {
                                    setCurrentPassword(e.target.value);
                                    setPasswordSuccess(false);
                                }, autoComplete: "current-password" })] }), _jsxs("div", { className: "profile-grid", children: [_jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "new-password", children: "New password" }), _jsx("input", { id: "new-password", type: "password", value: newPassword, onChange: (e) => {
                                            setNewPassword(e.target.value);
                                            setPasswordSuccess(false);
                                        }, autoComplete: "new-password" })] }), _jsxs("div", { className: "profile-field", children: [_jsx("label", { htmlFor: "confirm-password", children: "Confirm new password" }), _jsx("input", { id: "confirm-password", type: "password", value: confirmPassword, onChange: (e) => {
                                            setConfirmPassword(e.target.value);
                                            setPasswordSuccess(false);
                                        }, autoComplete: "new-password" })] })] }), passwordError && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), passwordError] })), passwordSuccess && (_jsxs("div", { className: "profile-success-banner", children: [_jsx(CheckCircle2, { size: 16 }), "Password changed. You've been logged out of all other sessions."] })), _jsx("div", { className: "profile-actions-bar", children: _jsx("button", { type: "submit", className: "profile-save-button", disabled: passwordSaving, children: passwordSaving ? "Changing..." : "Change password" }) })] }), _jsx("div", { className: "settings-divider" }), _jsxs("div", { className: "settings-inline-action", children: [_jsxs("div", { children: [_jsx("strong", { children: "Logout" }), _jsx("p", { children: "Sign out of HealthAI on this device." })] }), _jsxs("button", { type: "button", className: "profile-edit-button", onClick: handleLogout, children: [_jsx(LogOut, { size: 14 }), "Logout"] })] }), _jsxs("div", { className: "settings-inline-action", children: [_jsxs("div", { children: [_jsx("strong", { children: "Log out of all devices" }), _jsx("p", { children: "Ends every active session, including this one." })] }), _jsxs("button", { type: "button", className: "profile-edit-button", disabled: logoutAllLoading, onClick: handleLogoutAllDevices, children: [_jsx(LogOut, { size: 14 }), logoutAllLoading ? "Logging out..." : "Log out everywhere"] })] }), logoutAllError && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), logoutAllError] }))] }));
};
/* ============================================================
   PRIVACY & DATA SECTION
============================================================ */
const PrivacySection = () => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState("");
    const handleExport = async () => {
        try {
            setExporting(true);
            setExportError("");
            const data = await exportAccountData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `healthai-data-export-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error("Failed to export account data:", err);
            setExportError(err?.response?.data?.message ||
                "Unable to export your data right now.");
        }
        finally {
            setExporting(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(ShieldCheck, { size: 16, className: "analysis-header-icon" }), "Privacy & Data"] }), _jsx("p", { children: "How your information is handled in HealthAI" })] }) }), _jsx("p", { className: "report-empty-note", children: "Your health information belongs to your account and is only accessible after you authenticate. Features that use AI (Health Analysis, Comprehensive Reports, Ask HealthAI) send the relevant information you've provided only when you actively use those features. You can access or export your existing health information through this application at any time." }), _jsxs("div", { className: "settings-link-list", children: [_jsxs(Link, { to: "/profile", className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(UserRound, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: "Health Profile" }), _jsx("span", { children: "View and edit your health information" })] })] }), _jsxs(Link, { to: "/history", className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(HistoryIcon, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: "Health History" }), _jsx("span", { children: "Your complete chronological health record" })] })] }), _jsxs(Link, { to: "/reports", className: "activity-item", children: [_jsx("div", { className: "activity-item-icon", children: _jsx(FileText, { size: 17 }) }), _jsxs("div", { className: "activity-item-content", children: [_jsx("strong", { children: "Medical Reports" }), _jsx("span", { children: "Your generated comprehensive health reports" })] })] })] }), exportError && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), exportError] })), _jsx("div", { className: "profile-actions-bar", children: _jsxs("button", { type: "button", className: "profile-edit-button", disabled: exporting, onClick: handleExport, children: [_jsx(Download, { size: 14 }), exporting ? "Preparing export..." : "Download my data"] }) })] }));
};
/* ============================================================
   FEEDBACK SECTION
============================================================ */
const FeedbackSection = () => {
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim().length < 5) {
            setError("Please write a few more words so we can understand your feedback.");
            return;
        }
        try {
            setSaving(true);
            setError("");
            setSuccess(false);
            await submitFeedback({
                message: message.trim(),
                category: category || undefined,
            });
            setMessage("");
            setCategory("");
            setSuccess(true);
        }
        catch (err) {
            console.error("Failed to submit feedback:", err);
            setError(err?.response?.data?.message || "Unable to submit feedback right now.");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(MessageSquareHeart, { size: 16, className: "analysis-header-icon" }), "Feedback"] }), _jsx("p", { children: "Report a bug or suggest an improvement" })] }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "profile-field full-width", children: [_jsxs("label", { htmlFor: "feedback-category", children: ["Category ", _jsx("span", { className: "optional-tag", children: "(optional)" })] }), _jsxs("select", { id: "feedback-category", value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "", children: "Select a category" }), FEEDBACK_CATEGORY_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), _jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "feedback-message", children: "Your feedback" }), _jsx("textarea", { id: "feedback-message", value: message, onChange: (e) => {
                                    setMessage(e.target.value);
                                    setSuccess(false);
                                }, placeholder: "Tell us what's working well or what could be better...", maxLength: 1000 })] }), error && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })), success && (_jsxs("div", { className: "profile-success-banner", children: [_jsx(CheckCircle2, { size: 16 }), "Thanks for your feedback!"] })), _jsx("div", { className: "profile-actions-bar", children: _jsx("button", { type: "submit", className: "profile-save-button", disabled: saving, children: saving ? "Sending..." : "Send feedback" }) })] })] }));
};
/* ============================================================
   DANGER ZONE
============================================================ */
const DangerZoneSection = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const closeModal = () => {
        if (deleting)
            return;
        setConfirmOpen(false);
        setPassword("");
        setError("");
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Please enter your password to confirm.");
            return;
        }
        try {
            setDeleting(true);
            setError("");
            await deleteAccount(password);
            logout();
            navigate("/login");
        }
        catch (err) {
            console.error("Failed to delete account:", err);
            setError(err?.response?.data?.message ||
                "Unable to delete your account right now.");
            setDeleting(false);
        }
    };
    return (_jsxs("div", { className: "glass-card profile-section settings-danger-zone", children: [_jsx("div", { className: "profile-section-header", children: _jsxs("div", { children: [_jsxs("h3", { children: [_jsx(Trash2, { size: 16, className: "analysis-header-icon" }), "Danger Zone"] }), _jsx("p", { children: "Permanently delete your account and its data" })] }) }), _jsx("p", { className: "report-empty-note", children: "Deleting your account permanently removes your HealthAI account and the health data associated with it \u2014 your profile, medications, vitals, health analyses, reports, and uploaded documents. This cannot be undone." }), _jsx("div", { className: "profile-actions-bar", children: _jsxs("button", { type: "button", className: "settings-danger-button", onClick: () => setConfirmOpen(true), children: [_jsx(Trash2, { size: 14 }), "Delete Account"] }) }), confirmOpen && (_jsx("div", { className: "document-modal-backdrop", onMouseDown: (e) => {
                    if (e.target === e.currentTarget)
                        closeModal();
                }, children: _jsxs("div", { className: "document-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsx("div", { className: "document-modal-header", children: _jsxs("div", { children: [_jsx("span", { children: "This action cannot be undone" }), _jsx("h3", { children: "Delete your account permanently?" })] }) }), _jsxs("form", { onSubmit: handleDelete, className: "settings-delete-form", children: [_jsx("p", { className: "report-empty-note", children: "Enter your password to confirm permanent deletion of your HealthAI account and all associated health data." }), _jsxs("div", { className: "profile-field full-width", children: [_jsx("label", { htmlFor: "delete-password", children: "Current password" }), _jsx("input", { id: "delete-password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", autoFocus: true })] }), error && (_jsxs("div", { className: "profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] })), _jsxs("div", { className: "settings-delete-actions", children: [_jsx("button", { type: "button", className: "profile-edit-button", onClick: closeModal, disabled: deleting, children: "Cancel" }), _jsx("button", { type: "submit", className: "settings-danger-button", disabled: deleting, children: deleting ? "Deleting..." : "Confirm Delete" })] })] })] }) }))] }));
};
/* ============================================================
   PAGE
============================================================ */
const Settings = () => {
    const { updateUser } = useAuth();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const result = await getAccount();
                setAccount(result);
            }
            catch (err) {
                console.error("Failed to load account:", err);
                setError("Unable to load your account right now.");
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    const handleAccountUpdated = (updated) => {
        setAccount(updated);
        updateUser({ name: updated.name, email: updated.email });
    };
    if (loading) {
        return (_jsx("div", { className: "profile-page", children: _jsx("div", { className: "glass-card profile-loading", children: "Loading your settings..." }) }));
    }
    if (error || !account) {
        return (_jsx("div", { className: "profile-page", children: _jsxs("div", { className: "glass-card profile-error-banner", children: [_jsx(AlertTriangle, { size: 16 }), error] }) }));
    }
    return (_jsxs("div", { className: "profile-page", children: [_jsx(AccountSection, { account: account, onUpdated: handleAccountUpdated }), _jsx(SecuritySection, {}), _jsx(PrivacySection, {}), _jsx(FeedbackSection, {}), _jsx(DangerZoneSection, {}), _jsxs("div", { className: "report-empty-note", children: [_jsx(Info, { size: 12, style: { verticalAlign: "-2px", marginRight: 4 } }), "Settings changes apply only to your own account."] })] }));
};
export default Settings;
