"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Eye, EyeOff, Receipt, Package, BarChart3 } from "lucide-react";

/* Google SVG icon */
const GoogleIcon = () => (
  <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const navigate = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push(href), 420);
  };

  const panelCls = leaving ? "anim-panel-leave-left" : "anim-panel-enter-left";
  const formCls  = leaving ? "anim-form-leave-right"  : "anim-form-enter-right";

  return (
    <div className="auth-screen">

      {/* ── LEFT: Blue Panel ── */}
      <div className={`auth-panel ${panelCls}`}>

        {/* Arc decorations */}
        <div className="auth-panel__arc" style={{ width: 520, height: 520, top: -60,  right: -200 }} />
        <div className="auth-panel__arc" style={{ width: 420, height: 420, top: 20,   right: -150 }} />
        <div className="auth-panel__arc" style={{ width: 320, height: 320, top: 80,   right: -100 }} />
        <div className="auth-panel__arc" style={{ width: 220, height: 220, top: 140,  right: -50  }} />
        <div className="auth-panel__arc" style={{ width: 120, height: 120, top: 200,  right: 0    }} />

        <div className="auth-panel__top">
          {/* Logo icon */}
          <div className="auth-panel__icon">
            <Receipt size={28} />
          </div>

          <h1 className="auth-panel__title">{"Hello\nBillEase!"}</h1>

          <p className="auth-panel__subtitle">
            Skip manual billing tasks. Manage your shop, inventory and customers — all in one place and save tons of time!
          </p>

          {/* Feature pills */}
          <div className="auth-panel__pills">
            {[
              { icon: Receipt,  label: "Fast Billing" },
              { icon: Package,  label: "Inventory"    },
              { icon: BarChart3, label: "Reports"     },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="auth-panel__pill">
                <Icon size={14} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="auth-panel__copyright">© 2024 BillEase POS. All rights reserved.</p>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className={`auth-form-side ${formCls}`}>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__icon">B</div>
          <span className="auth-brand__name">BillEase</span>
        </div>

        <div className="auth-form-body">
          <h2 className="auth-form-title">Welcome Back!</h2>
          <p className="auth-form-subtitle">
            Don&apos;t have an account?{" "}
            <a href="/signup" onClick={navigate("/signup")}>
              Create a new account now
            </a>
            , it&apos;s FREE! Takes less than a minute.
          </p>

          {/* Email */}
          <div className="auth-field">
            <input
              type="email"
              placeholder="Email address"
              className="auth-input"
            />
            <Mail className="auth-field__icon" size={16} />
          </div>

          {/* Password */}
          <div className="auth-field auth-field--last">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Login */}
          <button className="auth-btn auth-btn--primary">Login Now</button>

          {/* Google */}
          <button className="auth-btn auth-btn--ghost">
            <GoogleIcon />
            Login with Google
          </button>

          {/* Forgot */}
          <p className="auth-footer-link" style={{ marginTop: "1.5rem" }}>
            Forgot password?{" "}
            <a href="/forgot-password" onClick={navigate("/forgot-password")}>
              Click here
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}