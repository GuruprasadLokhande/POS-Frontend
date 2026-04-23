"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  Store,
  Phone,
  Zap,
  Shield,
  BadgeCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push("/login"), 420);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }

        @keyframes panelInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes formInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes panelOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }
        @keyframes formOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        .panel-enter-r { animation: panelInRight 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .form-enter-l  { animation: formInLeft  0.5s cubic-bezier(0.22,1,0.36,1) 0.06s both; }
        .panel-leave-r { animation: panelOutRight 0.42s cubic-bezier(0.55,0,1,0.45) both; }
        .form-leave-l  { animation: formOutLeft   0.42s cubic-bezier(0.55,0,1,0.45) both; }

        .arc {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12);
          pointer-events: none;
        }

        .input-line {
          border: none;
          border-bottom: 1.5px solid #d1d5db;
          border-radius: 0;
          background: transparent;
          padding: 10px 0 10px 0;
          width: 100%;
          font-size: 15px;
          color: #111;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-line::placeholder { color: #aaa; }
        .input-line:focus { border-color: #2563eb; }
      `}</style>

      <div className="flex min-h-screen w-full">

        {/* ── LEFT: Signup Form ── */}
        <div className={`flex flex-col justify-center flex-1 bg-white px-20 py-14 ${leaving ? "form-leave-l" : "form-enter-l"}`}>

          {/* Brand name top */}
          <div className="mb-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">BillEase</span>
            </div>
          </div>

          <div className="max-w-sm w-full">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Get Started!</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Already have an account?{" "}
              <a href="/login" onClick={goToLogin} className="text-slate-900 font-semibold underline underline-offset-2 hover:text-blue-600 transition-colors">
                Sign in here
              </a>
              . Takes less than a minute to set up.
            </p>

            {/* Shop Name */}
            <div className="relative mb-7">
              <input type="text" placeholder="Shop / Vendor Name" className="input-line pr-8" />
              <Store className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            </div>

            {/* Email */}
            <div className="relative mb-7">
              <input type="email" placeholder="Email address" className="input-line pr-8" />
              <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            </div>

            {/* Mobile */}
            <div className="relative mb-7">
              <input type="tel" placeholder="Mobile number (+91...)" className="input-line pr-8" />
              <Phone className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            </div>

            {/* Password */}
            <div className="relative mb-7">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 8 chars)"
                className="input-line pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative mb-10">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="input-line pr-8"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Create Account button */}
            <button className="w-full py-4 rounded-xl bg-[#2b34d1] text-white font-semibold text-sm tracking-wide hover:bg-[#1e27b5] active:scale-[0.98] transition-all duration-150 mb-3">
              Create Account — It&apos;s Free!
            </button>

            {/* Google button */}
            <button className="w-full py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>

        {/* ── RIGHT: Blue Panel ── */}
        <div className={`relative flex flex-col justify-between w-[48%] min-h-screen bg-[#2b34d1] px-16 py-14 overflow-hidden ${leaving ? "panel-leave-r" : "panel-enter-r"}`}>

          {/* Arc decorations — mirrored to left side */}
          <div className="arc" style={{ width: 520, height: 520, top: -60, left: -200 }} />
          <div className="arc" style={{ width: 420, height: 420, top: 20, left: -150 }} />
          <div className="arc" style={{ width: 320, height: 320, top: 80, left: -100 }} />
          <div className="arc" style={{ width: 220, height: 220, top: 140, left: -50 }} />
          <div className="arc" style={{ width: 120, height: 120, top: 200, left: 0 }} />

          {/* Top content */}
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-20">
              <Store className="w-7 h-7 text-white" />
            </div>

            <div className="text-white">
              <h1 className="text-5xl font-extrabold leading-tight mb-6">
                Start Your<br />
                Free Trial! 🚀
              </h1>
              <p className="text-lg font-light text-white/75 leading-relaxed max-w-sm">
                Join thousands of shop owners who trust BillEase to run their daily operations seamlessly.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: Zap, label: "Quick Setup" },
                { icon: Shield, label: "Secure Data" },
                { icon: BadgeCheck, label: "Free Plan" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Copyright */}
          <p className="relative z-10 text-white/40 text-xs font-light">
            © 2024 BillEase POS. All rights reserved.
          </p>
        </div>

      </div>
    </>
  );
}