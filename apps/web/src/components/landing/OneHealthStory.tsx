import { useReveal } from "../../hooks/useReveal";

const INPUTS = [
  "Profile",
  "Vitals",
  "Medications",
  "Medical Reports",
  "AI Analysis",
  "Health History",
];

const OneHealthStory = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="landing-section landing-story-section" id="landing-story">
      <div
        ref={ref}
        className={`landing-section-inner ${visible ? "is-visible" : ""}`}
      >
        <p className="landing-section-kicker">Not scattered information</p>
        <h2 className="landing-section-heading landing-story-heading">
          One health story.
        </h2>

        <div className="landing-story">
          <div className="landing-story-inputs">
            {INPUTS.map((input) => (
              <span key={input} className="landing-story-input">
                {input}
              </span>
            ))}
          </div>

          <span className="landing-story-connector" aria-hidden="true" />

          <div className="landing-story-output">HealthAI</div>
        </div>
      </div>
    </section>
  );
};

export default OneHealthStory;
