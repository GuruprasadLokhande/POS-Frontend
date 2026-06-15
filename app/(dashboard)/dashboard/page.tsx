"use client";

import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  Plus, ArrowRight, IndianRupee, CheckCircle2, Clock, AlertCircle,
  Wallet, CreditCard, Hourglass, Star,
} from "lucide-react";
import "./dashboard.css";

/* ─────────────────── Types ─────────────────── */

type TrendDir = "up" | "down";
type SaleStatus = "paid" | "pending" | "partial";

/* ─────────────────── StatCard ─────────────────── */

function StatCard({
  label, value, sub, trend, trendDir, Icon, iconBg, iconColor,
}: {
  label: string; value: string; sub?: string;
  trend?: string; trendDir?: TrendDir;
  Icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  const isDown = trendDir === "down";
  return (
    <div className="db-stat-card">
      <div className="db-stat-top">
        <div className="db-stat-icon" style={{ background: iconBg }}>
          <Icon style={{ width: 20, height: 20, color: iconColor }} />
        </div>
        {trend && (
          <span className={`db-stat-badge ${isDown ? "down" : "up"}`}>
            {isDown
              ? <TrendingDown style={{ width: 10, height: 10 }} />
              : <TrendingUp   style={{ width: 10, height: 10 }} />}
            {trend}
          </span>
        )}
      </div>
      <p className="db-stat-value">{value}</p>
      <p className="db-stat-label">{label}</p>
      {sub && <p className="db-stat-sub">{sub}</p>}
    </div>
  );
}

/* ─────────────────── SaleRow ─────────────────── */

const STATUS_CFG: Record<SaleStatus, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  paid:    { label: "Paid",    bg: "var(--success-bg)", color: "var(--success)", Icon: CheckCircle2 },
  pending: { label: "Pending", bg: "var(--warning-bg)", color: "var(--warning)", Icon: Clock        },
  partial: { label: "Partial", bg: "var(--info-bg)",    color: "var(--info)",    Icon: AlertCircle  },
};

function SaleRow({ id, customer, amount, items, time, status }: {
  id: string; customer: string; amount: string;
  items: number; time: string; status: SaleStatus;
}) {
  const cfg = STATUS_CFG[status];
  return (
    <div className="db-sale-row">
      <div className="db-sale-icon">
        <ShoppingCart style={{ width: 15, height: 15, color: "var(--brand)" }} />
      </div>
      <div className="db-sale-info">
        <div className="db-sale-name-row">
          <span className="db-sale-name">{customer}</span>
          <span className="db-sale-id">#{id}</span>
        </div>
        <p className="db-sale-meta">{items} item{items !== 1 ? "s" : ""} · {time}</p>
      </div>
      <div className="db-sale-right">
        <p className="db-sale-amount">{amount}</p>
        <span className="db-sale-status" style={{ background: cfg.bg, color: cfg.color }}>
          <cfg.Icon style={{ width: 9, height: 9 }} />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── QuickAction ─────────────────── */

function QuickAction({ href, Icon, label, sub, iconBg, iconColor }: {
  href: string; Icon: React.ElementType; label: string; sub: string;
  iconBg: string; iconColor: string;
}) {
  return (
    <Link href={href} className="db-quick-link">
      <div className="db-quick-icon" style={{ background: iconBg }}>
        <Icon style={{ width: 17, height: 17, color: iconColor }} />
      </div>
      <div className="db-quick-text">
        <p className="db-quick-label">{label}</p>
        <p className="db-quick-sub">{sub}</p>
      </div>
      <ArrowRight style={{ width: 13, height: 13, color: "var(--border-mid)", flexShrink: 0 }} />
    </Link>
  );
}

/* ─────────────────── InsightItem ─────────────────── */

function InsightItem({ Icon, iconBg, iconColor, val, label }: {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  val: string; label: string;
}) {
  return (
    <div className="db-insight-item">
      <div className="db-insight-icon" style={{ background: iconBg }}>
        <Icon style={{ width: 16, height: 16, color: iconColor }} />
      </div>
      <div>
        <p className="db-insight-val">{val}</p>
        <p className="db-insight-label">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────── Page ─────────────────── */

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const bars = [38, 62, 44, 78, 52, 88, 68, 82, 58, 92, 72, 100, 54, 70, 86];

  return (
    <div className="db">
      <div className="db-page">

        {/* ── Page header ── */}
        <div className="db-header">
          <div>
            <h1 className="db-header-title">Good morning, Rajesh</h1>
            <p className="db-header-date">{today}</p>
          </div>
          <Link href="/dashboard/sales/new" className="db-add-btn">
            <Plus style={{ width: 14, height: 14 }} />
            Add Sale
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="db-stat-grid">
          <StatCard
            label="Today's Revenue" value="₹12,480" sub="vs ₹9,200 yesterday"
            trend="+35.6%" trendDir="up"
            Icon={IndianRupee} iconBg="rgba(43,52,209,0.1)" iconColor="var(--brand)"
          />
          <StatCard
            label="Sales Today" value="24" sub="8 pending payment"
            trend="+4" trendDir="up"
            Icon={ShoppingCart} iconBg="var(--orange-bg)" iconColor="var(--orange)"
          />
          <StatCard
            label="Customers Served" value="19" sub="3 new today"
            trend="+3" trendDir="up"
            Icon={Users} iconBg="var(--success-bg)" iconColor="var(--success)"
          />
          <StatCard
            label="Low Stock Items" value="7" sub="Needs restock soon"
            trend="Critical" trendDir="down"
            Icon={Package} iconBg="var(--danger-bg)" iconColor="var(--danger)"
          />
        </div>

        {/* ── Insight strip ── */}
        <div className="db-insight-strip">
          <InsightItem Icon={Wallet}     iconBg="var(--success-bg)"          iconColor="var(--success)" val="₹7,840" label="Cash collected" />
          <InsightItem Icon={CreditCard} iconBg="var(--info-bg)"             iconColor="var(--info)"    val="₹4,640" label="UPI / Online"   />
          <InsightItem Icon={Hourglass}  iconBg="var(--warning-bg)"          iconColor="var(--warning)" val="₹2,100" label="Dues pending"   />
          <InsightItem Icon={Star}       iconBg="rgba(43,52,209,0.08)"       iconColor="var(--brand)"   val="4.8"    label="Avg. order rating" />
        </div>

        {/* ── Main grid: recent sales + sidebar ── */}
        <div className="db-main-grid">

          {/* Recent sales */}
          <div className="db-card">
            <div className="db-card-header">
              <h2 className="db-card-title">Recent Sales</h2>
              <Link href="/dashboard/sales" className="db-view-all">
                View all <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <div className="db-card-body">
              <SaleRow id="1024" customer="Priya Mehta"      amount="₹1,240" items={5} time="10 min ago" status="paid"    />
              <SaleRow id="1023" customer="Ravi Kumar"       amount="₹580"   items={3} time="45 min ago" status="paid"    />
              <SaleRow id="1022" customer="Sunita Devi"      amount="₹2,100" items={8} time="1 hr ago"   status="pending" />
              <SaleRow id="1021" customer="Ajay Patel"       amount="₹750"   items={4} time="2 hrs ago"  status="partial" />
              <SaleRow id="1020" customer="Meena Sharma"     amount="₹340"   items={2} time="3 hrs ago"  status="paid"    />
              <SaleRow id="1019" customer="Walk-in Customer" amount="₹920"   items={6} time="4 hrs ago"  status="paid"    />
            </div>
          </div>

          {/* Right column */}
          <div className="db-right-col">

            {/* Quick actions */}
            <div className="db-quick-actions">
              <h2 className="db-quick-title">Quick Actions</h2>
              <div className="db-quick-list">
                <QuickAction
                  href="/dashboard/sales/new" Icon={ShoppingCart}
                  label="New Sale" sub="Bill a customer"
                  iconBg="var(--brand-dim)" iconColor="var(--brand)"
                />
                <QuickAction
                  href="/dashboard/inventory" Icon={Package}
                  label="Add Item" sub="Update inventory"
                  iconBg="var(--orange-bg)" iconColor="var(--orange)"
                />
                <QuickAction
                  href="/dashboard/customers" Icon={Users}
                  label="Add Customer" sub="Register new customer"
                  iconBg="var(--success-bg)" iconColor="var(--success)"
                />
              </div>
            </div>

            {/* Today summary */}
            <div className="db-summary-card">
              <p className="db-summary-eyebrow">Today's Summary</p>
              <div className="db-summary-rows">
                {[
                  { label: "Cash",       value: "₹7,840", note: "63%" },
                  { label: "UPI / Online", value: "₹4,640", note: "37%" },
                  { label: "Pending Due",  value: "₹2,100", note: ""    },
                ].map(({ label, value, note }) => (
                  <div key={label} className="db-summary-row">
                    <span className="db-summary-row-label">{label}</span>
                    <div className="db-summary-row-vals">
                      <span className="db-summary-row-val">{value}</span>
                      {note && <span className="db-summary-row-note">{note}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment split bar */}
              <div className="db-split-bar-wrap">
                <div className="db-split-bar" style={{ width: "63%", background: "rgba(255,255,255,0.6)" }} />
                <div className="db-split-bar" style={{ width: "37%", background: "rgba(255,255,255,0.25)" }} />
              </div>

              <div className="db-summary-total">
                <span className="db-summary-total-label">Total Revenue</span>
                <span className="db-summary-total-val">₹12,480</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bar chart ── */}
        <div className="db-chart-card">
          <div className="db-chart-header">
            <div>
              <h2 className="db-chart-title">Revenue This Month</h2>
              <p className="db-chart-subtitle">March 2026</p>
            </div>
            <div className="db-chart-tabs">
              {["Week", "Month", "Year"].map((t, i) => (
                <button key={t} className={`db-chart-tab${i === 1 ? " active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="db-chart-bars">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`db-chart-bar${i === bars.length - 1 ? " today" : ""}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="db-chart-footer">
            <span className="db-chart-foot-label">Mar 1</span>
            <div className="db-chart-legend">
              <span className="db-chart-legend-item">
                <span className="db-chart-legend-dot" />Today
              </span>
              <span className="db-chart-total">
                Total: <span className="db-chart-total-val">₹3,42,800</span>
              </span>
            </div>
            <span className="db-chart-foot-label">Mar {bars.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}