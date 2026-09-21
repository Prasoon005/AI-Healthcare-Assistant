import {
  ClipboardCheck,
  FileText,
  FolderHeart,
  HeartPulse,
  History,
  Pill,
  Sparkles,
} from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

const FeatureShowcase = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="landing-section" id="landing-features">
      <div
        ref={ref}
        className={`landing-section-inner ${visible ? "is-visible" : ""}`}
      >
        <p className="landing-section-kicker">What's inside</p>
        <h2 className="landing-section-heading">
          Everything about your health, in one workspace.
        </h2>

        <div className="landing-features-grid">
          <div className="landing-feature landing-feature-large">
            <Sparkles size={20} />
            <h3>AI Health Analysis</h3>
            <p>
              Turn scattered health information into a clearer picture, with
              educational insights grounded in what you've shared.
            </p>
          </div>

          <div className="landing-feature landing-feature-large">
            <History size={20} />
            <h3>Health History</h3>
            <p>
              Every analysis, report and vital reading, organized into one
              searchable timeline you can look back on.
            </p>
          </div>

          <div className="landing-feature">
            <FolderHeart size={17} />
            <h3>Health Profile</h3>
            <p>The foundation your insights are built on.</p>
          </div>

          <div className="landing-feature">
            <HeartPulse size={17} />
            <h3>Vitals &amp; Trends</h3>
            <p>Log readings and see how they move over time.</p>
          </div>

          <div className="landing-feature">
            <Pill size={17} />
            <h3>Medication tracking</h3>
            <p>Daily reminders that stay out of the way.</p>
          </div>

          <div className="landing-feature">
            <FileText size={17} />
            <h3>Medical Vault</h3>
            <p>Reports and prescriptions, kept in one place.</p>
          </div>

          <div className="landing-feature">
            <ClipboardCheck size={17} />
            <h3>Health Reports</h3>
            <p>Comprehensive summaries you can revisit anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
