import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FolderHeart,
  History,
  BellRing,
  Sparkles,
} from "lucide-react";

interface InsightState {
  icon: typeof Sparkles;
  label: string;
  message: string;
}

const INSIGHT_STATES: InsightState[] = [
  {
    icon: Sparkles,
    label: "HealthAI Insight",
    message:
      "Understand your recorded health information over time.",
  },
  {
    icon: FolderHeart,
    label: "Health Records",
    message: "Keep your profile, vitals and reports organized.",
  },
  {
    icon: ClipboardCheck,
    label: "AI Analysis",
    message: "Explore educational insights from the information you provide.",
  },
  {
    icon: History,
    label: "Health History",
    message: "See your health information over time.",
  },
  {
    icon: BellRing,
    label: "Wellness Reminder",
    message: "Small, consistent habits can support everyday wellbeing.",
  },
];

const ROTATE_INTERVAL_MS = 6500;

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(media.matches);

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return reduced;
};

/*
 * One cohesive "living health record" window rather than a cluster of
 * separate floating cards - the rotating insight is now a row inside a
 * single designed object, alongside illustrative (never invented)
 * product state: an empty-state-style profile row and placeholder vital
 * labels with no fabricated values.
 */
const HealthShowcase = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHT_STATES.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const current = INSIGHT_STATES[insightIndex];
  const CurrentIcon = current.icon;

  return (
    <div
      className={`landing-record ${reducedMotion ? "no-motion" : ""}`}
      aria-hidden="true"
    >
      <div className="landing-record-glow" />

      <div className="landing-record-window">
        <div className="landing-record-header">
          <span className="landing-record-dot" />
          <div>
            <strong>HealthAI</strong>
            <span>Your health timeline</span>
          </div>
        </div>

        <div className="landing-record-row">
          <span className="landing-record-row-label">Profile</span>
          <span className="landing-record-row-value landing-record-complete">
            ✓ Complete
          </span>
        </div>

        <div className="landing-record-row landing-record-row-stacked">
          <span className="landing-record-row-label">Vitals</span>
          <div className="landing-record-vitals">
            <div>
              <span>Heart rate</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Blood pressure</span>
              <strong>—</strong>
            </div>
          </div>
        </div>

        <div className="landing-record-row landing-record-row-stacked">
          <span className="landing-record-row-label">Recent insight</span>
          <div key={insightIndex} className="landing-record-insight">
            <span className="landing-record-insight-tag">
              <CurrentIcon size={12} />
              {current.label}
            </span>
            <p>{current.message}</p>
          </div>
        </div>

        <div className="landing-record-footer">
          <span>03 recent updates</span>
        </div>
      </div>
    </div>
  );
};

export default HealthShowcase;
