import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, FolderHeart, Sparkles } from "lucide-react";

const INSIGHT_MESSAGES = [
  "Your health story, organized in one place.",
  "Keep your profile, vitals, medications and reports together.",
  "Understand your health information with context from your history.",
  "Small, consistent habits can make everyday wellness easier to manage.",
  "Track. Understand. Stay informed.",
  "Your health information, organized for better understanding.",
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

const HealthShowcase = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHT_MESSAGES.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="landing-showcase" aria-hidden="true">
      <div className="landing-showcase-glow" />

      <div className="landing-showcase-grid">
        <div className="landing-showcase-card landing-showcase-primary">
          <span className="landing-showcase-label">
            <Sparkles size={13} />
            HealthAI Insight
          </span>
          <p key={insightIndex} className="landing-showcase-insight">
            {INSIGHT_MESSAGES[insightIndex]}
          </p>
          <div className="landing-showcase-dots">
            {INSIGHT_MESSAGES.map((_, index) => (
              <span
                key={index}
                className={index === insightIndex ? "active" : ""}
              />
            ))}
          </div>
        </div>

        <div className="landing-showcase-row">
          <div className="landing-showcase-card landing-showcase-tile">
            <div className="landing-showcase-icon">
              <FolderHeart size={16} />
            </div>
            <strong>Health Records</strong>
            <span>Profile · Vitals · Reports</span>
          </div>

          <div className="landing-showcase-card landing-showcase-tile">
            <div className="landing-showcase-icon">
              <ClipboardCheck size={16} />
            </div>
            <strong>AI Analysis</strong>
            <span>Understand your health information</span>
          </div>

          <div className="landing-showcase-card landing-showcase-tile">
            <div className="landing-showcase-icon">
              <FileText size={16} />
            </div>
            <strong>Medical Vault</strong>
            <span>Keep important reports organized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthShowcase;
