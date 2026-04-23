"use client";

import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  Plus, ArrowRight, IndianRupee, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

const BRAND    = "#2b34d1";
const BRAND_BG = "rgba(43,52,209,0.08)";
const WHITE    = "#ffffff";
const SURFACE  = "#f8fafc";
const BORDER   = "#f1f5f9";
const TXT      = "#0f172a";
const SUBT     = "#475569";
const MUTE     = "#94a3b8";

function StatCard({ label, value, sub, trend, trendUp, Icon, iconBg, iconColor }: {
  label: string; value: string; sub?: string; trend?: string;
  trendUp?: boolean; Icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  const bad = !trendUp || trend === "Critical";
  return (
    <div style={{ background: WHITE, borderRadius: 16, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 20, height: 20, color: iconColor }} />
        </div>
        {trend && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: bad ? "#fee2e2" : "#d1fae5", color: bad ? "#ef4444" : "#059669" }}>
            {bad ? <TrendingDown style={{ width: 10, height: 10 }} /> : <TrendingUp style={{ width: 10, height: 10 }} />}
            {trend}
          </span>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: TXT, lineHeight: 1, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: SUBT, marginTop: 8 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function SaleRow({ id, customer, amount, items, time, status }: {
  id: string; customer: string; amount: string;
  items: number; time: string; status: "paid" | "pending" | "partial";
}) {
  const cfg = {
    paid:    { label: "Paid",    bg: "#d1fae5", color: "#059669", Icon: CheckCircle2 },
    pending: { label: "Pending", bg: "#fef3c7", color: "#d97706", Icon: Clock        },
    partial: { label: "Partial", bg: "#dbeafe", color: "#2563eb", Icon: AlertCircle  },
  }[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #f8fafc" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ShoppingCart style={{ width: 15, height: 15, color: BRAND }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: TXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer}</span>
          <span style={{ fontSize: 11, color: MUTE, flexShrink: 0 }}>#{id}</span>
        </div>
        <p style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{items} item{items !== 1 ? "s" : ""} · {time}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: TXT }}>{amount}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: cfg.bg, color: cfg.color, marginTop: 3 }}>
          <cfg.Icon style={{ width: 9, height: 9 }} />{cfg.label}
        </span>
      </div>
    </div>
  );
}

function QuickAction({ href, Icon, label, sub, borderColor, iconBg, iconColor }: {
  href: string; Icon: React.ElementType; label: string; sub: string;
  borderColor: string; iconBg: string; iconColor: string;
}) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, border: `2px solid ${borderColor}`, background: WHITE, textDecoration: "none" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 18, height: 18, color: iconColor }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: TXT, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: SUBT, marginTop: 3, margin: 0 }}>{sub}</p>
      </div>
      <ArrowRight style={{ width: 14, height: 14, color: "#cbd5e1", flexShrink: 0 }} />
    </Link>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const bars = [38, 62, 44, 78, 52, 88, 68, 82, 58, 92, 72, 100, 54, 70, 86];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .db * { font-family:'Sora',sans-serif; box-sizing:border-box; }
        .db-sg { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .db-mg { display:grid; grid-template-columns:1fr; gap:20px; }
        @media(min-width:1024px){
          .db-sg { grid-template-columns:repeat(4,1fr) !important; }
          .db-mg { grid-template-columns:2fr 1fr !important; }
        }
      `}</style>

      <div className="db" style={{ minHeight: "100%", background: SURFACE }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: TXT, margin: 0 }}>Good morning, Rajesh! 👋</h1>
              <p style={{ fontSize: 13, color: MUTE, marginTop: 6, marginBottom: 0 }}>{today}</p>
            </div>
            <Link href="/dashboard/sales/new" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: BRAND, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(43,52,209,0.28)", flexShrink: 0 }}>
              <Plus style={{ width: 15, height: 15 }} />Add Sale
            </Link>
          </div>

          {/* ── Stat cards ── */}
          <div className="db-sg" style={{ marginBottom: 28 }}>
            <StatCard label="Today's Revenue"  value="₹12,480" sub="vs ₹9,200 yesterday"  trend="+35.6%"  trendUp={true}  Icon={IndianRupee} iconBg="rgba(43,52,209,0.1)"  iconColor={BRAND}    />
            <StatCard label="Today's Sales"    value="24"      sub="8 pending payment"    trend="+4"      trendUp={true}  Icon={ShoppingCart} iconBg="#ffedd5"             iconColor="#f97316"  />
            <StatCard label="Customers Served" value="19"      sub="3 new customers"      trend="+3"      trendUp={true}  Icon={Users}        iconBg="#d1fae5"             iconColor="#059669"  />
            <StatCard label="Low Stock Items"  value="7"       sub="Needs restock soon"   trend="Critical" trendUp={false} Icon={Package}      iconBg="#fee2e2"             iconColor="#ef4444"  />
          </div>

          {/* ── Main grid ── */}
          <div className="db-mg" style={{ marginBottom: 28 }}>

            {/* Recent Sales */}
            <div style={{ background: WHITE, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f8fafc" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: TXT, margin: 0 }}>Recent Sales</h2>
                <Link href="/dashboard/sales" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: BRAND, textDecoration: "none" }}>
                  View all <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              <div style={{ padding: "4px 20px 8px" }}>
                <SaleRow id="1024" customer="Priya Mehta"       amount="₹1,240" items={5} time="10 min ago"  status="paid"    />
                <SaleRow id="1023" customer="Ravi Kumar"        amount="₹580"   items={3} time="45 min ago"  status="paid"    />
                <SaleRow id="1022" customer="Sunita Devi"       amount="₹2,100" items={8} time="1 hr ago"    status="pending" />
                <SaleRow id="1021" customer="Ajay Patel"        amount="₹750"   items={4} time="2 hrs ago"   status="partial" />
                <SaleRow id="1020" customer="Meena Sharma"      amount="₹340"   items={2} time="3 hrs ago"   status="paid"    />
                <SaleRow id="1019" customer="Walk-in Customer"  amount="₹920"   items={6} time="4 hrs ago"   status="paid"    />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Quick Actions */}
              <div style={{ background: WHITE, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", padding: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: TXT, marginBottom: 14, marginTop: 0 }}>Quick Actions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <QuickAction href="/dashboard/sales/new"  Icon={ShoppingCart} label="New Sale"     sub="Add items & bill customer" borderColor="rgba(43,52,209,0.18)" iconBg={BRAND_BG}  iconColor={BRAND}    />
                  <QuickAction href="/dashboard/inventory"  Icon={Package}      label="Add Item"     sub="Add product to inventory"  borderColor="#fed7aa"              iconBg="#ffedd5"   iconColor="#f97316"  />
                  <QuickAction href="/dashboard/customers"  Icon={Users}        label="Add Customer" sub="Register new customer"     borderColor="#a7f3d0"              iconBg="#d1fae5"   iconColor="#059669"  />
                </div>
              </div>

              {/* Today's Summary */}
              <div style={{ borderRadius: 16, padding: 20, background: "linear-gradient(135deg,#2b34d1,#1a1f8f)", color: "#fff" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16, marginTop: 0 }}>Today's Summary</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Cash Sales",   value: "₹7,840", note: "63%" },
                    { label: "UPI / Online", value: "₹4,640", note: "37%" },
                    { label: "Pending Due",  value: "₹2,100", note: ""    },
                  ].map(({ label, value, note }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>{value}</span>
                        {note && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Total Revenue</span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>₹12,480</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bar chart ── */}
          <div style={{ background: WHITE, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: TXT, margin: 0 }}>Revenue This Month</h2>
                <p style={{ fontSize: 11, color: MUTE, marginTop: 4, marginBottom: 0 }}>March 2026</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Week", "Month", "Year"].map((t, i) => (
                  <button key={t} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Sora,sans-serif", background: i === 1 ? BRAND : "#f1f5f9", color: i === 1 ? "#fff" : SUBT }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 140 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0", background: i === bars.length - 1 ? BRAND : "#e2e8f0", transition: "background 0.2s" }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 11, color: MUTE }}>Mar 1</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: MUTE }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: BRAND, display: "inline-block" }} />Today
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: SUBT }}>Total: <span style={{ color: BRAND }}>₹3,42,800</span></span>
              </div>
              <span style={{ fontSize: 11, color: MUTE }}>Mar {bars.length}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}