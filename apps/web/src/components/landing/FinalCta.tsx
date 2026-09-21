import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "../../hooks/useReveal";

const FinalCta = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="landing-section landing-final-cta" id="landing-cta">
      <div
        ref={ref}
        className={`landing-section-inner ${visible ? "is-visible" : ""}`}
      >
        <h2 className="landing-final-cta-heading">
          Start understanding your health today.
        </h2>
        <p className="landing-final-cta-body">
          Keep everything important in one place, and make sense of it over
          time.
        </p>

        <Link to="/register" className="landing-signup-button landing-final-cta-button">
          Sign up
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default FinalCta;
