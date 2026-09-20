import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Check, Droplets, Dumbbell, Moon, Salad, Sparkles, } from "lucide-react";
import { getDailyPlan, } from "../../api/planner";
const DailyPlanner = () => {
    const [data, setData] = useState(null);
    const [completed, setCompleted] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadPlan = async () => {
            try {
                const result = await getDailyPlan();
                setData(result);
                const saved = localStorage.getItem("dailyPlannerProgress");
                if (saved) {
                    setCompleted(JSON.parse(saved));
                }
            }
            catch (error) {
                console.error("Failed to load daily planner:", error);
            }
            finally {
                setLoading(false);
            }
        };
        loadPlan();
    }, []);
    const toggleTask = (key) => {
        setCompleted((current) => {
            const updated = {
                ...current,
                [key]: !current[key],
            };
            localStorage.setItem("dailyPlannerProgress", JSON.stringify(updated));
            return updated;
        });
    };
    const tasks = useMemo(() => {
        if (!data)
            return [];
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
    const completedCount = tasks.filter((task) => completed[task.key]).length;
    const progress = tasks.length === 0
        ? 0
        : Math.round((completedCount / tasks.length) * 100);
    if (loading) {
        return (_jsx("div", { className: "daily-planner-card glass-card", children: _jsx("div", { className: "planner-loading", children: "Preparing your daily plan..." }) }));
    }
    return (_jsxs("div", { className: "daily-planner-card glass-card", children: [_jsxs("div", { className: "daily-planner-header", children: [_jsxs("div", { className: "daily-planner-title", children: [_jsx("div", { className: "daily-planner-icon", children: _jsx(Sparkles, { size: 18 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Daily Health Planner" }), _jsx("p", { children: "Simple goals for a healthier day" })] })] }), _jsxs("div", { className: "planner-progress", children: [progress, "%"] })] }), _jsx("div", { className: "planner-progress-bar", children: _jsx("div", { className: "planner-progress-fill", style: { width: `${progress}%` } }) }), !data?.profileAvailable && (_jsx("div", { className: "planner-profile-note", children: "Complete your Health Profile for more personalized goals." })), _jsx("div", { className: "planner-task-list", children: tasks.map((task) => {
                    const Icon = task.icon;
                    const isDone = !!completed[task.key];
                    return (_jsxs("button", { type: "button", className: `planner-task ${isDone ? "completed" : ""}`, onClick: () => toggleTask(task.key), children: [_jsx("div", { className: "planner-task-icon", children: _jsx(Icon, { size: 17 }) }), _jsxs("div", { className: "planner-task-content", children: [_jsx("strong", { children: task.title }), _jsx("span", { children: task.target })] }), _jsx("div", { className: "planner-check", children: isDone && _jsx(Check, { size: 14 }) })] }, task.key));
                }) }), _jsxs("div", { className: "planner-footer", children: [_jsxs("span", { children: [completedCount, " of ", tasks.length, " goals completed"] }), progress === 100 && (_jsx("strong", { children: "Great job today \u2728" }))] })] }));
};
export default DailyPlanner;
