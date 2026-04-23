"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

/* ── Step type ───────────────────────────────────────────── */
type Step = "email" | "otp" | "reset" | "done";

/* ── OTP Input ───────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
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
    <div className="flex gap-3 mb-10">
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
          className={[
            "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200",
            digit
              ? "border-[#2b34d1] bg-[#2b34d1]/5 text-[#2b34d1]"
              : "border-slate-200 bg-slate-50 text-slate-800",
            "focus:border-[#2b34d1] focus:bg-white focus:shadow-[0_0_0_4px_rgba(43,52,209,0.08)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [stepLeaving, setStepLeaving] = useState(false);

  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push("/login"), 420);
  };

  const nextStep = (next: Step) => {
    setStepLeaving(true);
    setTimeout(() => {
      setStep(next);
      setStepLeaving(false);
    }, 300);
  };

  /* ── Panel content per step ── */
  const panelMeta: Record<Step, { icon: React.ElementType; title: string; subtitle: string; tip: string }> = {
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

  const meta = panelMeta[step];
  const PanelIcon = meta.icon;

  const panelCls = leaving ? "panel-leave" : "panel-enter";
  const formCls  = leaving ? "form-leave-down" : "form-enter";
  const stepCls  = stepLeaving ? "step-leave" : "step-enter";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }

        @keyframes panelIn    { from { opacity:0; transform:translateX(-40px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes formIn     { from { opacity:0; transform:translateX(40px);   } to { opacity:1; transform:translateX(0); } }
        @keyframes panelOut   { from { opacity:1; transform:translateX(0);      } to { opacity:0; transform:translateX(-60px); } }
        @keyframes formDown   { from { opacity:1; transform:translateY(0);      } to { opacity:0; transform:translateY(40px); } }
        @keyframes stepIn     { from { opacity:0; transform:translateY(20px);   } to { opacity:1; transform:translateY(0); } }
        @keyframes stepOut    { from { opacity:1; transform:translateY(0);      } to { opacity:0; transform:translateY(-20px); } }
        @keyframes panelFade  { from { opacity:0; } to { opacity:1; } }

        .panel-enter    { animation: panelIn   0.5s  cubic-bezier(0.22,1,0.36,1) both; }
        .form-enter     { animation: formIn    0.5s  cubic-bezier(0.22,1,0.36,1) 0.06s both; }
        .panel-leave    { animation: panelOut  0.42s cubic-bezier(0.55,0,1,0.45) both; }
        .form-leave-down{ animation: formDown  0.38s cubic-bezier(0.55,0,1,0.45) both; }
        .step-enter     { animation: stepIn    0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .step-leave     { animation: stepOut   0.25s cubic-bezier(0.55,0,1,0.45) both; }
        .panel-content  { animation: panelFade 0.4s  ease both; }

        .arc { position:absolute; border-radius:50%; border:1.5px solid rgba(255,255,255,0.12); pointer-events:none; }

        .input-line {
          border:none; border-bottom:1.5px solid #d1d5db; border-radius:0;
          background:transparent; padding:10px 0; width:100%;
          font-size:15px; color:#111; outline:none; transition:border-color 0.2s;
        }
        .input-line::placeholder { color:#aaa; }
        .input-line:focus { border-color:#2b34d1; }

        .progress-dot {
          width: 8px; height: 8px; border-radius: 50%;
          transition: all 0.3s ease;
        }
      `}</style>

      <div className="flex min-h-screen w-full">

        {/* ── LEFT: Blue Panel ── */}
        <div className={`relative flex flex-col justify-between w-[48%] min-h-screen bg-[#2b34d1] px-16 py-14 overflow-hidden ${panelCls}`}>
          <div className="arc" style={{ width:520, height:520, top:-60,  right:-200 }} />
          <div className="arc" style={{ width:420, height:420, top:20,   right:-150 }} />
          <div className="arc" style={{ width:320, height:320, top:80,   right:-100 }} />
          <div className="arc" style={{ width:220, height:220, top:140,  right:-50  }} />
          <div className="arc" style={{ width:120, height:120, top:200,  right:0    }} />

          {/* Panel content animates per step */}
          <div key={step} className="relative z-10 panel-content">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-16">
              <PanelIcon className="w-8 h-8 text-white" />
            </div>

            <div className="text-white">
              <h1 className="text-5xl font-extrabold leading-tight mb-6 whitespace-pre-line">
                {meta.title}
              </h1>
              <p className="text-base font-light text-white/75 leading-relaxed max-w-xs mb-10">
                {meta.subtitle}
              </p>

              {/* Tip box */}
              <div className="flex gap-3 items-center p-4 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-lg mt-0.5">💡</span>
                <p className="text-xs text-white/70 leading-relaxed">{meta.tip}</p>
              </div>
            </div>

            {/* Step progress dots */}
            <div className="flex items-center gap-2 mt-12">
              {(["email", "otp", "reset", "done"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`progress-dot ${step === s ? "bg-white w-6 rounded-full" : "bg-white/30"}`}
                />
              ))}
              <span className="ml-2 text-xs text-white/50 font-light">
                Step {["email","otp","reset","done"].indexOf(step) + 1} of 4
              </span>
            </div>
          </div>

          <p className="relative z-10 text-white/40 text-xs font-light">© 2024 BillEase POS. All rights reserved.</p>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className={`flex flex-col justify-center flex-1 bg-white px-20 py-14 ${formCls}`}>

          {/* Brand + Back */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">BillEase</span>
            </div>
            <a
              href="/login"
              onClick={goToLogin}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </a>
          </div>

          {/* Step content */}
          <div key={step} className={`max-w-sm w-full ${stepCls}`}>

            {/* ── STEP 1: Email ── */}
            {step === "email" && (
              <>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-sm text-slate-400 mb-10 leading-relaxed">
                  Enter your registered email address. We&apos;ll send you a 6-digit verification code.
                </p>

                <div className="relative mb-10">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-line pr-8"
                  />
                  <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>

                <button
                  onClick={() => nextStep("otp")}
                  disabled={!email.includes("@")}
                  className="w-full py-4 rounded-xl bg-[#2b34d1] text-white font-semibold text-sm tracking-wide hover:bg-[#1e27b5] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Send Verification Code
                </button>

                <p className="text-center text-xs text-slate-400 mt-6">
                  Remember your password?{" "}
                  <a href="/login" onClick={goToLogin} className="text-slate-900 font-semibold underline underline-offset-2 hover:text-[#2b34d1] transition-colors">
                    Sign In
                  </a>
                </p>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Enter Code</h2>
                <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-8">{email}</p>

                <OtpInput value={otp} onChange={setOtp} />

                <button
                  onClick={() => nextStep("reset")}
                  disabled={otp.some((d) => !d)}
                  className="w-full py-4 rounded-xl bg-[#2b34d1] text-white font-semibold text-sm tracking-wide hover:bg-[#1e27b5] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 mb-4"
                >
                  Verify Code
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => nextStep("email")}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Change email
                  </button>
                  <button className="text-xs text-[#2b34d1] font-semibold hover:underline underline-offset-2 transition-colors">
                    Resend code
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: Reset Password ── */}
            {step === "reset" && (
              <>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-2">New Password</h2>
                <p className="text-sm text-slate-400 mb-10 leading-relaxed">
                  Create a strong password you haven&apos;t used before.
                </p>

                <div className="relative mb-8">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="New password"
                    className="input-line pr-8"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative mb-10">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="input-line pr-8"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength hint */}
                <div className="flex gap-1.5 mb-8">
                  {["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"].map((c, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < 2 ? c : "bg-slate-200"}`} />
                  ))}
                  <span className="ml-2 text-xs text-slate-400 self-center whitespace-nowrap">Fair</span>
                </div>

                <button
                  onClick={() => nextStep("done")}
                  className="w-full py-4 rounded-xl bg-[#2b34d1] text-white font-semibold text-sm tracking-wide hover:bg-[#1e27b5] active:scale-[0.98] transition-all duration-150"
                >
                  Reset Password
                </button>
              </>
            )}

            {/* ── STEP 4: Done ── */}
            {step === "done" && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Password Reset!</h2>
                <p className="text-sm text-slate-400 mb-10 leading-relaxed">
                  Your password has been updated successfully. Sign in with your new password.
                </p>

                <button
                  onClick={(e) => goToLogin(e as unknown as React.MouseEvent)}
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold text-sm tracking-wide hover:bg-slate-700 active:scale-[0.98] transition-all duration-150 mb-4"
                >
                  Back to Login
                </button>

                <p className="text-xs text-slate-400">
                  You&apos;ll be signed out from all other devices for security.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}