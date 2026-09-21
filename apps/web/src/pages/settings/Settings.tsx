import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  History as HistoryIcon,
  Info,
  KeyRound,
  LogOut,
  MessageSquareHeart,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  changePassword,
  deleteAccount,
  exportAccountData,
  getAccount,
  logoutAllDevices,
  updateAccount,
  type Account,
} from "../../api/account";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  submitFeedback,
  type FeedbackCategory,
} from "../../api/feedback";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ============================================================
   ACCOUNT SECTION
============================================================ */

const AccountSection = ({
  account,
  onUpdated,
}: {
  account: Account;
  onUpdated: (account: Account) => void;
}) => {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isDirty = name.trim() !== account.name || email.trim() !== account.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;

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
    } catch (err: any) {
      console.error("Failed to update account:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to update your account right now."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <UserRound size={16} className="analysis-header-icon" />
            Account
          </h3>
          <p>Member since {formatDate(account.createdAt)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="settings-name">Name</label>
            <input
              id="settings-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSuccess(false);
              }}
              maxLength={100}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccess(false);
              }}
              maxLength={200}
            />
          </div>
        </div>

        {error && (
          <div className="profile-error-banner">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success-banner">
            <CheckCircle2 size={16} />
            Account details updated.
          </div>
        )}

        <div className="profile-actions-bar">
          <button
            type="submit"
            className="profile-save-button"
            disabled={!isDirty || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordSaving) return;

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
    } catch (err: any) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err?.response?.data?.message ||
          "Unable to change your password right now."
      );
    } finally {
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
    } catch (err: any) {
      console.error("Failed to log out of all devices:", err);
      setLogoutAllError(
        err?.response?.data?.message ||
          "Unable to log out of all devices right now."
      );
      setLogoutAllLoading(false);
    }
  };

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <KeyRound size={16} className="analysis-header-icon" />
            Security
          </h3>
          <p>Change your password and manage sessions</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword}>
        <div className="profile-field full-width">
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordSuccess(false);
            }}
            autoComplete="current-password"
          />
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordSuccess(false);
              }}
              autoComplete="new-password"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordSuccess(false);
              }}
              autoComplete="new-password"
            />
          </div>
        </div>

        {passwordError && (
          <div className="profile-error-banner">
            <AlertTriangle size={16} />
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="profile-success-banner">
            <CheckCircle2 size={16} />
            Password changed. You've been logged out of all other sessions.
          </div>
        )}

        <div className="profile-actions-bar">
          <button
            type="submit"
            className="profile-save-button"
            disabled={passwordSaving}
          >
            {passwordSaving ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>

      <div className="settings-divider" />

      <div className="settings-inline-action">
        <div>
          <strong>Logout</strong>
          <p>Sign out of HealthAI on this device.</p>
        </div>
        <button
          type="button"
          className="profile-edit-button"
          onClick={handleLogout}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <div className="settings-inline-action">
        <div>
          <strong>Log out of all devices</strong>
          <p>Ends every active session, including this one.</p>
        </div>
        <button
          type="button"
          className="profile-edit-button"
          disabled={logoutAllLoading}
          onClick={handleLogoutAllDevices}
        >
          <LogOut size={14} />
          {logoutAllLoading ? "Logging out..." : "Log out everywhere"}
        </button>
      </div>

      {logoutAllError && (
        <div className="profile-error-banner">
          <AlertTriangle size={16} />
          {logoutAllError}
        </div>
      )}
    </div>
  );
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
    } catch (err: any) {
      console.error("Failed to export account data:", err);
      setExportError(
        err?.response?.data?.message ||
          "Unable to export your data right now."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <ShieldCheck size={16} className="analysis-header-icon" />
            Privacy & Data
          </h3>
          <p>How your information is handled in HealthAI</p>
        </div>
      </div>

      <p className="report-empty-note">
        Your health information belongs to your account and is only
        accessible after you authenticate. Features that use AI (Health
        Analysis, Comprehensive Reports, Ask HealthAI) send the relevant
        information you've provided only when you actively use those
        features. You can access or export your existing health information
        through this application at any time.
      </p>

      <div className="settings-link-list">
        <Link to="/profile" className="activity-item">
          <div className="activity-item-icon">
            <UserRound size={17} />
          </div>
          <div className="activity-item-content">
            <strong>Health Profile</strong>
            <span>View and edit your health information</span>
          </div>
        </Link>

        <Link to="/history" className="activity-item">
          <div className="activity-item-icon">
            <HistoryIcon size={17} />
          </div>
          <div className="activity-item-content">
            <strong>Health History</strong>
            <span>Your complete chronological health record</span>
          </div>
        </Link>

        <Link to="/reports" className="activity-item">
          <div className="activity-item-icon">
            <FileText size={17} />
          </div>
          <div className="activity-item-content">
            <strong>Medical Reports</strong>
            <span>Your generated comprehensive health reports</span>
          </div>
        </Link>
      </div>

      {exportError && (
        <div className="profile-error-banner">
          <AlertTriangle size={16} />
          {exportError}
        </div>
      )}

      <div className="profile-actions-bar">
        <button
          type="button"
          className="profile-edit-button"
          disabled={exporting}
          onClick={handleExport}
        >
          <Download size={14} />
          {exporting ? "Preparing export..." : "Download my data"}
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   FEEDBACK SECTION
============================================================ */

const FeedbackSection = () => {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      setError(
        err?.response?.data?.message || "Unable to submit feedback right now."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card profile-section">
      <div className="profile-section-header">
        <div>
          <h3>
            <MessageSquareHeart size={16} className="analysis-header-icon" />
            Feedback
          </h3>
          <p>Report a bug or suggest an improvement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-field full-width">
          <label htmlFor="feedback-category">
            Category <span className="optional-tag">(optional)</span>
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory | "")}
          >
            <option value="">Select a category</option>
            {FEEDBACK_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="profile-field full-width">
          <label htmlFor="feedback-message">Your feedback</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSuccess(false);
            }}
            placeholder="Tell us what's working well or what could be better..."
            maxLength={1000}
          />
        </div>

        {error && (
          <div className="profile-error-banner">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success-banner">
            <CheckCircle2 size={16} />
            Thanks for your feedback!
          </div>
        )}

        <div className="profile-actions-bar">
          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >
            {saving ? "Sending..." : "Send feedback"}
          </button>
        </div>
      </form>
    </div>
  );
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
    if (deleting) return;
    setConfirmOpen(false);
    setPassword("");
    setError("");
  };

  const handleDelete = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to delete your account right now."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="glass-card profile-section settings-danger-zone">
      <div className="profile-section-header">
        <div>
          <h3>
            <Trash2 size={16} className="analysis-header-icon" />
            Danger Zone
          </h3>
          <p>Permanently delete your account and its data</p>
        </div>
      </div>

      <p className="report-empty-note">
        Deleting your account permanently removes your HealthAI account and
        the health data associated with it — your profile, medications,
        vitals, health analyses, reports, and uploaded documents. This
        cannot be undone.
      </p>

      <div className="profile-actions-bar">
        <button
          type="button"
          className="settings-danger-button"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 size={14} />
          Delete Account
        </button>
      </div>

      {confirmOpen && (
        <div
          className="document-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="document-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="document-modal-header">
              <div>
                <span>This action cannot be undone</span>
                <h3>Delete your account permanently?</h3>
              </div>
            </div>

            <form onSubmit={handleDelete} className="settings-delete-form">
              <p className="report-empty-note">
                Enter your password to confirm permanent deletion of your
                HealthAI account and all associated health data.
              </p>

              <div className="profile-field full-width">
                <label htmlFor="delete-password">Current password</label>
                <input
                  id="delete-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="profile-error-banner">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="settings-delete-actions">
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={closeModal}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="settings-danger-button"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   PAGE
============================================================ */

const Settings = () => {
  const { updateUser } = useAuth();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getAccount();
        setAccount(result);
      } catch (err) {
        console.error("Failed to load account:", err);
        setError("Unable to load your account right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleAccountUpdated = (updated: Account) => {
    setAccount(updated);
    updateUser({ name: updated.name, email: updated.email });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="glass-card profile-loading">
          Loading your settings...
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="profile-page">
        <div className="glass-card profile-error-banner">
          <AlertTriangle size={16} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <AccountSection account={account} onUpdated={handleAccountUpdated} />
      <SecuritySection />
      <PrivacySection />
      <FeedbackSection />
      <DangerZoneSection />

      <div className="report-empty-note">
        <Info size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Settings changes apply only to your own account.
      </div>
    </div>
  );
};

export default Settings;
