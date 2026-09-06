import { HeartPulse, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";

const Login = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
        color: "#18181b",
        backgroundImage: `url(${bgArtwork})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "64px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          boxSizing: "border-box",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#18181b",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartPulse size={18} color="#fff" />
          </div>

          <span
            style={{
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Health<span style={{ color: "#0d9488" }}>AI</span>
          </span>
        </Link>

        <Link
          to="/register"
          style={{
            padding: "8px 20px",
            borderRadius: "22px",
            backgroundColor: "#09090b",
            color: "#fff",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Sign up
        </Link>
      </header>

      {/* Login Content */}
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            padding: "44px",
            borderRadius: "32px",
            backgroundColor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5)",
            boxSizing: "border-box",
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: "32px" }}>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Welcome back
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                lineHeight: "1.1",
                letterSpacing: "-1.2px",
                fontWeight: 800,
                color: "#09090b",
              }}
            >
              Sign in to HealthAI
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#475569",
              }}
            >
              Continue to your personal health dashboard.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.65)",
                  backgroundColor: "rgba(255,255,255,0.28)",
                  outline: "none",
                  fontSize: "14px",
                  color: "#09090b",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Password
                </label>

                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    fontSize: "12px",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.65)",
                  backgroundColor: "rgba(255,255,255,0.28)",
                  outline: "none",
                  fontSize: "14px",
                  color: "#09090b",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "50px",
                marginTop: "4px",
                border: "none",
                borderRadius: "15px",
                backgroundColor: "#09090b",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Sign in
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Register */}
          <p
            style={{
              margin: "28px 0 0",
              textAlign: "center",
              fontSize: "13px",
              color: "#475569",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#09090b",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;