import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Plus,
  Pill,
  Trash2,
  X,
} from "lucide-react";

import {
  createMedication,
  deleteMedication,
  getTodayMedications,
  takeMedication,
  type Medication,
} from "../../api/medications";

const MedicationReminder = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Failed to load medications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const doses = useMemo(
    () =>
      medications.flatMap((medicine) =>
        medicine.doses.map((dose) => ({
          medicine,
          dose,
        }))
      ),
    [medications]
  );

  const completed = doses.filter(
    (item) => item.dose.taken
  ).length;

  /* ================= CREATE ================= */

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
    } catch (error) {
      console.error(
        "Failed to save medication:",
        error
      );

      alert(
        "Failed to save medication. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (
    medicationId: string,
    medicationName: string
  ) => {
    const confirmed = window.confirm(
      `Remove "${medicationName}" from your medicine reminders?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(medicationId);

      await deleteMedication(medicationId);

      await loadMedications();
    } catch (error) {
      console.error(
        "Failed to delete medication:",
        error
      );

      alert(
        "Failed to remove medication. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= TAKE ================= */

  const handleTake = async (
    medicationId: string,
    logId: string,
    scheduledTime: string
  ) => {
    try {
      await takeMedication(
        medicationId,
        logId,
        scheduledTime
      );

      await loadMedications();
    } catch (error) {
      console.error(
        "Failed to mark medication as taken:",
        error
      );
    }
  };

  /* ================= STATUS ================= */

  const getStatus = (
    time: string,
    taken: boolean
  ) => {
    if (taken) return "Taken";

    const now = new Date();

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const scheduled = new Date();

    scheduled.setHours(
      hours,
      minutes,
      0,
      0
    );

    if (scheduled.getTime() < now.getTime()) {
      return "Missed";
    }

    return "Upcoming";
  };

  return (
    <div className="medication-widget glass-card">
      {/* ================= HEADER ================= */}

      <div className="medication-header">
        <div className="medication-title">
          <div className="medication-icon">
            <Pill size={19} />
          </div>

          <div>
            <h3>Today's medicines</h3>

            <p>
              {completed}/{doses.length} doses completed
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-medication-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* ================= MEDICATION LIST ================= */}

      {loading ? (
        <div className="medication-empty">
          Loading medicines...
        </div>
      ) : doses.length === 0 ? (
        <div className="medication-empty">
          <Pill size={20} />

          <strong>No medicines added</strong>

          <span>
            Add your daily medicine schedule to keep
            track of your doses.
          </span>

          <button
            type="button"
            onClick={() => setShowForm(true)}
          >
            Add medicine
          </button>
        </div>
      ) : (
        <div className="medication-list">
          {doses.map(({ medicine, dose }) => {
            const status = getStatus(
              dose.scheduledTime,
              dose.taken
            );

            return (
              <div
                className={`medicine-row ${
                  dose.taken ? "taken" : ""
                }`}
                key={dose.id}
              >
                <div className="medicine-main">
                  <div className="medicine-dot">
                    <Pill size={15} />
                  </div>

                  <div>
                    <strong>
                      {medicine.name}
                    </strong>

                    <span>
                      {medicine.dosage}

                      {medicine.instructions
                        ? ` · ${medicine.instructions}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="medicine-time">
                  <Clock3 size={13} />
                  {dose.scheduledTime}
                </div>

                <div className="medicine-actions">
                  {status === "Taken" ? (
                    <div className="medicine-status taken-status">
                      <Check size={14} />
                      Taken
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="take-button"
                      onClick={() =>
                        handleTake(
                          medicine.id,
                          dose.id,
                          dose.scheduledTime
                        )
                      }
                    >
                      {status === "Missed"
                        ? "Mark taken"
                        : "Take now"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="delete-medication-button"
                    disabled={
                      deletingId === medicine.id
                    }
                    onClick={() =>
                      handleDelete(
                        medicine.id,
                        medicine.name
                      )
                    }
                    aria-label={`Remove ${medicine.name}`}
                    title="Remove medicine"
                  >
                    <Trash2 size={15} />

                    {deletingId === medicine.id
                      ? "..."
                      : ""}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD MEDICINE MODAL ================= */}

      {showForm && (
        <div
          className="medication-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="medication-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span>Add medication</span>

                <h3>
                  Create a daily reminder
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              {/* Medicine Name */}

              <label>
                <span>Medicine name</span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Vitamin D"
                  autoFocus
                />
              </label>

              {/* Dosage */}

              <label>
                <span>Dosage</span>

                <input
                  type="text"
                  value={form.dosage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dosage: e.target.value,
                    })
                  }
                  placeholder="e.g. 500 IU"
                />
              </label>

              {/* Instructions */}

              <label>
                <span>Instructions</span>

                <input
                  type="text"
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      instructions:
                        e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </label>

              {/* Reminder Time */}

              <label>
                <span>Reminder time</span>

                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />
              </label>

              {/* Save */}

              <button
                type="submit"
                disabled={saving}
                className="save-medication"
              >
                {saving
                  ? "Saving..."
                  : "Save reminder"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReminder;