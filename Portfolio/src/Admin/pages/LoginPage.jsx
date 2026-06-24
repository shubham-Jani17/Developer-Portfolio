import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminSession, loginAdmin } from "../api/client";
import GlassCard from "../components/GlassCard";

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateEmail(value) {
  if (!value.trim()) return "Email address is required.";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address (e.g. you@example.com).";
  return "";
}

function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 6) return "Password must be at least 6 characters.";
  return "";
}

const inputBase =
  "mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-white/[0.04]";
const inputNormal =
  "border-white/10 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30";
const inputError =
  "border-red-500/60 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If a valid session cookie already exists, skip login and go to dashboard
  useEffect(() => {
    checkAdminSession()
      .then(() => navigate("/admin", { replace: true }))
      .catch(() => { /* No valid session — stay on login page */ });
  }, []);

  const emailErr = touched.email ? validateEmail(email) : "";
  const passwordErr = touched.password ? validatePassword(password) : "";
  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleBlur = (field) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({ email: true, password: true });
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr || pErr) return;

    setLoading(true);
    setError("");
    try {
      await loginAdmin(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials and try again.");
      setEmail("");
      setPassword("");
      setTouched({ email: false, password: false });
    } finally {
      setLoading(false);
    }
  };

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? "http://localhost:3001";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <GlassCard className="w-full max-w-md p-8">
        <p className="font-mono-display text-[10px] tracking-[0.35em] uppercase text-cyan-400/90 mb-2">
          Admin
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your portfolio content and contact messages.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="admin-email" className="block">
              <span className="contact-label">
                Email Address <span className="text-red-400">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onBlur={() => handleBlur("email")}
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={emailErr ? "admin-email-error" : undefined}
                aria-invalid={!!emailErr}
                className={`${inputBase} ${emailErr ? inputError : inputNormal}`}
              />
              {/* Valid check icon */}
              {touched.email && !emailErr && email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-base select-none">✓</span>
              )}
            </div>
            {emailErr && (
              <p id="admin-email-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {emailErr}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="admin-password" className="block">
              <span className="contact-label">
                Password <span className="text-red-400">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onBlur={() => handleBlur("password")}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                aria-describedby={passwordErr ? "admin-password-error" : undefined}
                aria-invalid={!!passwordErr}
                className={`${inputBase} pr-10 ${passwordErr ? inputError : inputNormal}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground text-xs select-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordErr && (
              <p id="admin-password-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {passwordErr}
              </p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-900 hover:bg-white/95 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Signing in…" : "Enter dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <a href={publicSiteUrl} className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to portfolio
          </a>
        </p>
      </GlassCard>
    </div>
  );
}
