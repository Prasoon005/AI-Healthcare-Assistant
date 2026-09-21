import { HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-brand">
        <div className="landing-logo-mark">
          <HeartPulse size={16} />
        </div>
        <span>
          Health<span className="landing-logo-accent">AI</span>
        </span>
      </div>

      <p className="landing-footer-note">
        Educational health information, not a substitute for professional
        medical advice.
      </p>

      <div className="landing-footer-links">
        <Link to="/login">Log in</Link>
        <Link to="/register">Sign up</Link>
      </div>
    </footer>
  );
};

export default LandingFooter;
