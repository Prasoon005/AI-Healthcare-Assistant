import { useEffect, useMemo, useState } from "react";

import {
  Check,
  Droplets,
  Dumbbell,
  Moon,
  Salad,
  Sparkles,
} from "lucide-react";

import {
  getDailyPlan,
  type DailyPlan,
} from "../../api/planner";

const DailyPlanner = () => {
  const [data, setData] = useState<DailyPlan | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const result = await getDailyPlan();

        setData(result);

        const saved = localStorage.getItem(
          "dailyPlannerProgress"
        );

        if (saved) {
          setCompleted(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load daily planner:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  const toggleTask = (key: string) => {
    setCompleted((current) => {
      const updated = {
        ...current,
        [key]: !current[key],
      };

      localStorage.setItem(
        "dailyPlannerProgress",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const tasks = useMemo(() => {
    if (!data) return [];

    return [
      {
        key: "hydration",
        ...data.plan.hydration,
        icon: Droplets,
      },
      {
        key: "activity",
        ...data.plan.activity,
        icon: Dumbbell,
      },
      {
        key: "sleep",
        ...data.plan.sleep,
        icon: Moon,
      },
      {
        key: "nutrition",
        ...data.plan.nutrition,
        icon: Salad,
      },
    ];
  }, [data]);

  const completedCount = tasks.filter(
    (task) => completed[task.key]
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  if (loading) {
    return (
      <div className="daily-planner-card glass-card">
        <div className="planner-loading">
          Preparing your daily plan...
        </div>
      </div>
    );
  }

  return (
    <div className="daily-planner-card glass-card">
      <div className="daily-planner-header">
        <div className="daily-planner-title">
          <div className="daily-planner-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <h3>Daily Health Planner</h3>
            <p>Simple goals for a healthier day</p>
          </div>
        </div>

        <div className="planner-progress">
          {progress}%
        </div>
      </div>

      <div className="planner-progress-bar">
        <div
          className="planner-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!data?.profileAvailable && (
        <div className="planner-profile-note">
          Complete your Health Profile for more personalized goals.
        </div>
      )}

      <div className="planner-task-list">
        {tasks.map((task) => {
          const Icon = task.icon;
          const isDone = !!completed[task.key];

          return (
            <button
              type="button"
              key={task.key}
              className={`planner-task ${
                isDone ? "completed" : ""
              }`}
              onClick={() => toggleTask(task.key)}
            >
              <div className="planner-task-icon">
                <Icon size={17} />
              </div>

              <div className="planner-task-content">
                <strong>{task.title}</strong>
                <span>{task.target}</span>
              </div>

              <div className="planner-check">
                {isDone && <Check size={14} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="planner-footer">
        <span>
          {completedCount} of {tasks.length} goals completed
        </span>

        {progress === 100 && (
          <strong>Great job today ✨</strong>
        )}
      </div>
    </div>
  );
};

export default DailyPlanner;