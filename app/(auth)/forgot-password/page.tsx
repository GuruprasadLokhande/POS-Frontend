"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  Mail, Eye, EyeOff, ArrowLeft,
  KeyRound, ShieldCheck, LockKeyhole, CheckCircle2,
} from "lucide-react";

/* ── Types ── */
type Step = "email" | "otp" | "reset" | "done";

/* ── OTP Input component ── */
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/, "").slice(-1);
    const next = [...value];
    next[i] = char;
    onChange(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = Array(6).fill("");
    pasted.forEach((c, i) => (next[i] = c));
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="otp-row">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`otp-cell ${digit ? "otp-cell--filled" : ""}`}
        />
      ))}
    </div>
  );
}

/* ── Panel metadata per step ── */
const PANEL_META: Record<Step, {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tip: string;
}> = {
  email: {
    icon: KeyRound,
    title: "Forgot your\npassword? 🔑",
    subtitle: "No worries! Enter your registered email and we'll send you a secure reset code.",
    tip: "Check your spam folder if you don't see the email within 2 minutes.",
  },
  otp: {
    icon: ShieldCheck,
    title: "Check your\ninbox! 📬",
    subtitle: "We've sent a 6-digit verification code to your email. Enter it to continue.",
    tip: "The code expires in 10 minutes. Didn't receive it? You can resend.",
  },
  reset: {
    icon: LockKeyhole,
    title: "Create a new\npassword 🔒",
    subtitle: "Choose a strong password with at least 8 characters, numbers, and symbols.",
    tip: "Never share your password with anyone. BillEase will never ask for it.",
  },
  done: {
    icon: CheckCircle2,
    title: "All done! 🎉",
    subtitle: "Your password has been reset successfully. You can now sign in with your new password.",
    tip: "For security, you'll be signed out from all other devices.",
  },
};

const STEPS: Step[] = ["email", "otp", "reset", "done"];

/* ── Main Component ── */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(Array(6).fill(""));
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving]     = useState(false);
  const [stepLeaving, setStepLeaving] = useState(false);

  const navigate = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push(href), 420);
  };

  const nextStep = (next: Step) => {
    setStepLeaving(true);
    setTimeout(() => {
      setStep(next);
      setStepLeaving(false);
    }, 280);
  };

  const meta     = PANEL_META[step];
  const PanelIcon = meta.icon;
  const stepIndex = STEPS.indexOf(step);

  const panelCls = leaving ? "anim-panel-leave-left" : "anim-panel-enter-left";
  const formCls  = leaving ? "anim-form-leave-down"  : "anim-form-enter-right";
  const stepCls  = stepLeaving ? "anim-step-leave"   : "anim-step-enter";

  return (
    <div className="auth-screen">

      {/* ── LEFT: Blue Panel ── */}
      <div className={`auth-panel ${panelCls}`}>

        <div className="auth-panel__arc" style={{ width: 520, height: 520, top: -60,  right: -200 }} />
        <div className="auth-panel__arc" style={{ width: 420, height: 420, top: 20,   right: -150 }} />
        <div className="auth-panel__arc" style={{ width: 320, height: 320, top: 80,   right: -100 }} />
        <div className="auth-panel__arc" style={{ width: 220, height: 220, top: 140,  right: -50  }} />
        <div className="auth-panel__arc" style={{ width: 120, height: 120, top: 200,  right: 0    }} />

        {/* Panel content re-animates on each step */}
        <div key={step} className="auth-panel__top anim-panel-fade">
          <div className="auth-panel__icon">
            <PanelIcon size={30} />
          </div>

          <h1 className="auth-panel__title">{meta.title}</h1>

          <p className="auth-panel__subtitle">{meta.subtitle}</p>

          <div className="auth-panel__tip">
            <span className="auth-panel__tip-emoji">💡</span>
            <p className="auth-panel__tip-text">{meta.tip}</p>
          </div>

          {/* Progress dots */}
          <div className="auth-panel__dots">
            {STEPS.map((s) => (
              <div
                key={s}
                className={`auth-panel__dot ${step === s ? "auth-panel__dot--active" : ""}`}
              />
            ))}
            <span className="auth-panel__dot-label">
              Step {stepIndex + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        <p className="auth-panel__copyright">© 2024 BillEase POS. All rights reserved.</p>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className={`auth-form-side auth-form-side--scrollable ${formCls}`}>

        {/* Brand + back link */}
        <div className="auth-brand-row">
          <div className="auth-brand">
            <div className="auth-brand__icon">B</div>
            <span className="auth-brand__name">BillEase</span>
          </div>
          <a href="/login" className="auth-back-link" onClick={navigate("/login")}>
            <ArrowLeft size={16} />
            Back to Login
          </a>
        </div>

        {/* Step content — keyed for re-animation */}
        <div key={step} className={`auth-form-body ${stepCls}`}>

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <>
              <h2 className="auth-form-title">Reset Password</h2>
              <p className="auth-form-subtitle">
                Enter your registered email. We&apos;ll send you a 6-digit verification code.
              </p>

              <div className="auth-field auth-field--last">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
                <Mail className="auth-field__icon" size={16} />
              </div>

              <button
                className="auth-btn auth-btn--blue"
                onClick={() => nextStep("otp")}
                disabled={!email.includes("@")}
              >
                Send Verification Code
              </button>

              <p className="auth-footer-link">
                Remember your password?{" "}
                <a href="/login" onClick={navigate("/login")}>Sign In</a>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <>
              <h2 className="auth-form-title">Enter Code</h2>
              <p className="auth-form-subtitle" style={{ marginBottom: "0.375rem" }}>
                We sent a 6-digit code to
              </p>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--slate-900)", marginBottom: "1.75rem" }}>
                {email}
              </p>

              <OtpInput value={otp} onChange={setOtp} />

              <button
                className="auth-btn auth-btn--blue"
                onClick={() => nextStep("reset")}
                disabled={otp.some((d) => !d)}
              >
                Verify Code
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                <button
                  onClick={() => nextStep("email")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--slate-400)", fontFamily: "var(--font)" }}
                >
                  ← Change email
                </button>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-blue)", fontFamily: "var(--font)", textDecoration: "underline", textUnderlineOffset: "2px" }}
                >
                  Resend code
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "reset" && (
            <>
              <h2 className="auth-form-title">New Password</h2>
              <p className="auth-form-subtitle">
                Create a strong password you haven&apos;t used before.
              </p>

              <div className="auth-field">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="New password"
                  className="auth-input"
                />
                <button type="button" className="auth-field__toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="auth-field" style={{ marginBottom: "1.25rem" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="auth-input"
                />
                <button type="button" className="auth-field__toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength */}
              <div className="strength-bar">
                <div className="strength-bar__seg strength-bar__seg--red"    />
                <div className="strength-bar__seg strength-bar__seg--orange" />
                <div className="strength-bar__seg" />
                <div className="strength-bar__seg" />
                <span className="strength-bar__label">Fair</span>
              </div>

              <button
                className="auth-btn auth-btn--blue"
                onClick={() => nextStep("done")}
              >
                Reset Password
              </button>
            </>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div className="auth-done">
              <div className="auth-done__icon">
                <CheckCircle2 size={40} />
              </div>

              <h2 className="auth-form-title" style={{ marginBottom: "0.75rem" }}>Password Reset!</h2>
              <p className="auth-form-subtitle">
                Your password has been updated successfully. Sign in with your new password.
              </p>

              <button
                className="auth-btn auth-btn--primary"
                onClick={(e) => navigate("/login")(e as unknown as React.MouseEvent)}
              >
                Back to Login
              </button>

              <p className="auth-done__note">
                You&apos;ll be signed out from all other devices for security.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}