import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  Check,
  Clock3,
  Plus,
  X,
} from "lucide-react";

import {
  createReminder,
  deleteReminder,
  getReminders,
  type Reminder,
} from "../../api/reminders";

const emptyForm = {
  title: "",
  note: "",
  dueDate: "",
};

const isOverdue = (dueDate: string) =>
  new Date(dueDate).getTime() < Date.now();

const formatDueDate = (dueDate: string) => {
  const date = new Date(dueDate);
  const days = Math.round(
    (date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
  );

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return new Date(dueDate).toLocaleDateString();
};

const FollowUpReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      console.error("Failed to save reminder:", error);
      alert("Failed to save reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      setRemovingId(id);
      await deleteReminder(id);
      await loadReminders();
    } catch (error) {
      console.error("Failed to remove reminder:", error);
      alert("Failed to remove reminder. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="reminder-widget glass-card">
      <div className="reminder-header">
        <div className="reminder-title">
          <div className="reminder-icon">
            <BellRing size={19} />
          </div>

          <div>
            <h3>Follow-up reminders</h3>
            <p>{reminders.length} upcoming</p>
          </div>
        </div>

        <button
          type="button"
          className="add-reminder-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {loading ? (
        <div className="reminder-empty">Loading reminders...</div>
      ) : reminders.length === 0 ? (
        <div className="reminder-empty">
          <BellRing size={20} />
          <strong>No reminders yet</strong>
          <span>
            Reminders are created automatically after a health analysis
            suggests following up, or you can add your own.
          </span>
          <button type="button" onClick={() => setShowForm(true)}>
            Add reminder
          </button>
        </div>
      ) : (
        <div className="reminder-list">
          {reminders.map((reminder) => (
            <div
              className={`reminder-row ${
                isOverdue(reminder.dueDate) ? "overdue" : ""
              }`}
              key={reminder.id}
            >
              <div className="reminder-main">
                <div className="reminder-dot">
                  <Clock3 size={15} />
                </div>

                <div>
                  {reminder.analysisId ? (
                    <Link
                      to={`/analysis?id=${reminder.analysisId}`}
                      className="reminder-title-link"
                    >
                      {reminder.title}
                    </Link>
                  ) : (
                    <strong>{reminder.title}</strong>
                  )}
                  {reminder.note && <span>{reminder.note}</span>}
                </div>
              </div>

              <div className="reminder-due">
                {formatDueDate(reminder.dueDate)}
              </div>

              <button
                type="button"
                className="reminder-done-button"
                disabled={removingId === reminder.id}
                onClick={() => handleMarkDone(reminder.id)}
                aria-label={`Mark "${reminder.title}" done`}
                title="Mark done"
              >
                <Check size={14} />
                {removingId === reminder.id ? "..." : "Done"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="medication-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            className="medication-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span>Add reminder</span>
                <h3>Create a follow-up reminder</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Book a dentist appointment"
                  autoFocus
                  maxLength={150}
                />
              </label>

              <label>
                <span>Note (optional)</span>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) =>
                    setForm({ ...form, note: e.target.value })
                  }
                  placeholder="Optional details"
                  maxLength={300}
                />
              </label>

              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="save-medication"
              >
                {saving ? "Saving..." : "Save reminder"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpReminders;
