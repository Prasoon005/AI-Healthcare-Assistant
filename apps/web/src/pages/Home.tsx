import { HeartPulse, Search } from "lucide-react";
import { Link } from "react-router-dom";
import bgArtwork from "../assets/bg-artwork.png";
import LanguageSelector from "../components/landing/LanguageSelector";
import ThemeToggle from "../components/common/ThemeToggle";
import HealthShowcase from "../components/landing/HealthShowcase";
import "./Home.css";

const Home = () => {
  return (
    <div className="landing-page">
      <div
        className="landing-bg"
        style={{ backgroundImage: `url(${bgArtwork})` }}
      />
      <div className="landing-bg-overlay" />

      <header className="landing-navbar">
        <div className="landing-logo">
          <div className="landing-logo-mark">
            <HeartPulse size={18} />
          </div>
          <span>
            Health<span className="landing-logo-accent">AI</span>
          </span>
        </div>

        <div className="landing-navbar-actions">
          <div className="landing-search">
            <Search size={14} />
            <input type="text" placeholder="Search" />
          </div>

          <LanguageSelector />

          <ThemeToggle />

          <Link to="/login" className="landing-login-button">
            Log in
          </Link>

          <Link to="/register" className="landing-signup-button">
            Sign up
          </Link>
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-hero-panel">
          <h1>
            Understand your <br />
            health. <br />
            Explore with us
          </h1>

          <p>
            HealthAI helps you track symptoms, organize health records, and
            discover personalized wellness insights — all in one secure
            platform.
          </p>

          <div className="landing-signup-bar">
            <input type="email" placeholder="Enter your email address" />

            <Link to="/register">Sign up</Link>
          </div>
        </div>

        <HealthShowcase />
      </main>
    </div>
  );
};

export default Home;
