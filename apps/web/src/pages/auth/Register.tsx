import { useState } from "react";
import { ArrowRight, HeartPulse } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bgArtwork from "../../assets/bg-artwork.png";
import { registerUser } from "../../api/auth";
import ThemeToggle from "../../components/common/ThemeToggle";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (form.name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess(response.message || "Account created successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-900 dark:text-zinc-100">
      <div
        className="fixed inset-0 -z-10 dark:brightness-[0.32] dark:saturate-[1.15]"
        style={{
          backgroundImage: `url(${bgArtwork})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Header */}
      <header className="flex h-[68px] items-center justify-between border-b border-white/30 bg-white/15 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-3 no-underline"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#09090b] dark:bg-zinc-100">
            <HeartPulse size={19} className="text-white dark:text-zinc-900" />
          </div>

          <span className="text-lg font-bold tracking-tight text-[#18181b] dark:text-zinc-100">
            Health<span className="text-teal-600 dark:text-teal-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/25 text-slate-600 backdrop-blur-md transition hover:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10" />

          <Link
            to="/login"
            className="rounded-full border border-white/50 bg-white/25 px-5 py-2 text-sm font-semibold text-slate-900 no-underline backdrop-blur-md transition hover:bg-white/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[560px] rounded-[32px] border border-white/60 bg-white/20 p-7 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/55 sm:p-10">

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-zinc-400">
              New to HealthAI?
            </p>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-1.5px] text-slate-950 dark:text-zinc-100 sm:text-5xl">
              Create your
              <br />
              HealthAI account
            </h1>

            <p className="mt-4 max-w-[440px] text-sm leading-6 text-slate-600 dark:text-zinc-400 sm:text-base">
              Start organizing your health information and get meaningful
              wellness insights in one secure place.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-300">
                Full name
              </label>

              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                disabled={loading}
                className="w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/25 dark:focus:bg-white/10"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-300">
                Email address
              </label>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/25 dark:focus:bg-white/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-zinc-300">
                Password
              </label>

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={loading}
                className="w-full rounded-2xl border border-white/70 bg-white/35 px-5 py-4 text-sm text-slate-900 outline-none backdrop-blur-md placeholder:text-slate-500 transition focus:border-white focus:bg-white/50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/25 dark:focus:bg-white/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-300/50 bg-red-100/40 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-2xl border border-emerald-300/50 bg-emerald-100/40 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#09090b] px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {loading ? "Creating account..." : "Create account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-slate-950 no-underline hover:underline dark:text-zinc-100"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-zinc-500">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
