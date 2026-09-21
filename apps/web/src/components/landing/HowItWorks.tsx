import { useReveal } from "../../hooks/useReveal";

const STEPS = [
  {
    index: "01",
    title: "Build your profile",
    body: "Tell HealthAI what matters about you.",
  },
  {
    index: "02",
    title: "Understand",
    body: "Analyze symptoms and health information.",
  },
  {
    index: "03",
    title: "Organize",
    body: "Keep reports, medications and vitals together.",
  },
  {
    index: "04",
    title: "See the bigger picture",
    body: "Understand your health history over time.",
  },
];

const HowItWorks = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="landing-section" id="landing-how-it-works">
      <div
        ref={ref}
        className={`landing-section-inner ${visible ? "is-visible" : ""}`}
      >
        <p className="landing-section-kicker">Your health, connected</p>
        <h2 className="landing-section-heading">How HealthAI works</h2>

        <div className="landing-steps">
          {STEPS.map((step, index) => (
            <div key={step.index} className="landing-step">
              <div className="landing-step-marker">
                <span className="landing-step-index">{step.index}</span>
                {index < STEPS.length - 1 && (
                  <span className="landing-step-line" />
                )}
              </div>

              <div className="landing-step-content">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
