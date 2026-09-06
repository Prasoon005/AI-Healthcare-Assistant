import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Droplets,
  HeartPulse,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  createVital,
  deleteVital,
  getVitals,
  type VitalLog,
} from "../../api/vitals";

const VitalsCard = () => {
  const [vitals, setVitals] = useState<VitalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Failed to load vitals:", error);
    } finally {
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
        sevenDaysAgo.setDate(
          sevenDaysAgo.getDate() - 7
        );

        return date >= sevenDaysAgo;
      })
      .reverse()
      .map((vital) => ({
        date: new Date(
          vital.recordedAt
        ).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        heartRate: vital.heartRate,
        spo2: vital.spo2,
      }));
  }, [vitals]);

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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

    if (
      heartRate === undefined &&
      systolic === undefined &&
      diastolic === undefined &&
      spo2 === undefined
    ) {
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
    } catch (error) {
      console.error(
        "Failed to save vitals:",
        error
      );

      alert(
        "Failed to save reading. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    try {
      setDeletingId(id);

      await deleteVital(id);
      await loadVitals();
    } catch (error) {
      console.error(
        "Failed to delete vital:",
        error
      );

      alert(
        "Failed to delete reading."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  return (
    <div className="vitals-card glass-card">
      <div className="vitals-header">
        <div className="vitals-title">
          <div className="vitals-icon">
            <Activity size={19} />
          </div>

          <div>
            <h3>Vitals & trends</h3>
            <p>
              Track your recent health readings
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-vital-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={15} />
          Add reading
        </button>
      </div>

      {loading ? (
        <div className="vitals-empty">
          Loading readings...
        </div>
      ) : vitals.length === 0 ? (
        <div className="vitals-empty">
          <Activity size={22} />

          <strong>
            No vital readings yet
          </strong>

          <span>
            Add your first heart rate,
            blood pressure or SpO₂ reading.
          </span>

          <button
            type="button"
            onClick={() => setShowForm(true)}
          >
            Add first reading
          </button>
        </div>
      ) : (
        <>
          <div className="vitals-metrics">
            <div className="vital-metric">
              <div className="metric-icon heart">
                <HeartPulse size={17} />
              </div>

              <div>
                <span>Heart rate</span>

                <strong>
                  {latest.heartRate ?? "--"}
                  <small>
                    {latest.heartRate
                      ? " bpm"
                      : ""}
                  </small>
                </strong>
              </div>
            </div>

            <div className="vital-metric">
              <div className="metric-icon pressure">
                <Activity size={17} />
              </div>

              <div>
                <span>Blood pressure</span>

                <strong>
                  {latest.systolic ??
                  latest.diastolic
                    ? `${latest.systolic ?? "--"}/${latest.diastolic ?? "--"}`
                    : "--"}
                  <small>
                    {latest.systolic ||
                    latest.diastolic
                      ? " mmHg"
                      : ""}
                  </small>
                </strong>
              </div>
            </div>

            <div className="vital-metric">
              <div className="metric-icon oxygen">
                <Droplets size={17} />
              </div>

              <div>
                <span>SpO₂</span>

                <strong>
                  {latest.spo2 ?? "--"}
                  <small>
                    {latest.spo2 ? "%" : ""}
                  </small>
                </strong>
              </div>
            </div>
          </div>

          <div className="vitals-chart-section">
            <div className="chart-heading">
              <div>
                <strong>
                  7-day trend
                </strong>

                <span>
                  Based on your recorded readings
                </span>
              </div>
            </div>

            {chartData.length < 2 ? (
              <div className="chart-empty">
                Add another reading to see your
                trend.
              </div>
            ) : (
              <div className="vitals-chart">
                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <LineChart
                    data={chartData}
                  >
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                      }}
                      width={32}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart rate"
                      stroke="currentColor"
                      strokeWidth={2}
                      dot={{
                        r: 3,
                      }}
                      connectNulls
                    />

                    <Line
                      type="monotone"
                      dataKey="spo2"
                      name="SpO₂"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{
                        r: 3,
                      }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="recent-vitals">
            <div className="recent-heading">
              <strong>
                Recent readings
              </strong>

              <span>
                {vitals.length} total
              </span>
            </div>

            {vitals.slice(0, 4).map(
              (vital) => (
                <div
                  className="vital-history-row"
                  key={vital.id}
                >
                  <div>
                    <strong>
                      {vital.heartRate
                        ? `${vital.heartRate} bpm`
                        : "No heart rate"}
                    </strong>

                    <span>
                      {vital.systolic ||
                      vital.diastolic
                        ? `${vital.systolic ?? "--"}/${vital.diastolic ?? "--"} mmHg`
                        : "No BP"}{" "}
                      ·{" "}
                      {vital.spo2
                        ? `${vital.spo2}% SpO₂`
                        : "No SpO₂"}
                    </span>
                  </div>

                  <div className="vital-history-right">
                    <time>
                      {formatTime(
                        vital.recordedAt
                      )}
                    </time>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        vital.id
                      }
                      onClick={() =>
                        handleDelete(
                          vital.id
                        )
                      }
                      aria-label="Delete reading"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}

      {showForm && (
        <div
          className="vital-modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="vital-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="vital-modal-header">
              <div>
                <span>
                  Health tracking
                </span>

                <h3>
                  Add vital reading
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

            <form onSubmit={handleSave}>
              <label>
                <span>
                  Heart rate
                  <small> bpm</small>
                </span>

                <input
                  type="number"
                  min="1"
                  max="300"
                  value={
                    form.heartRate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      heartRate:
                        e.target.value,
                    })
                  }
                  placeholder="72"
                />
              </label>

              <div className="bp-inputs">
                <label>
                  <span>
                    Systolic
                    <small>
                      {" "}
                      mmHg
                    </small>
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={
                      form.systolic
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        systolic:
                          e.target.value,
                      })
                    }
                    placeholder="120"
                  />
                </label>

                <label>
                  <span>
                    Diastolic
                    <small>
                      {" "}
                      mmHg
                    </small>
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={
                      form.diastolic
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        diastolic:
                          e.target.value,
                      })
                    }
                    placeholder="80"
                  />
                </label>
              </div>

              <label>
                <span>
                  SpO₂
                  <small> %</small>
                </span>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.spo2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      spo2:
                        e.target.value,
                    })
                  }
                  placeholder="98"
                />
              </label>

              <p className="vital-disclaimer">
                Enter readings from your own
                device or measurement. This
                tracker does not diagnose
                medical conditions.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="save-vital-button"
              >
                {saving
                  ? "Saving..."
                  : "Save reading"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsCard;