"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell, Search, Plus, X, LayoutDashboard, ShoppingCart,
  Package, Users, BarChart3, Settings, Menu, Receipt,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           Icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/sales",     Icon: ShoppingCart,    label: "Sales"     },
  { href: "/dashboard/inventory", Icon: Package,         label: "Inventory" },
  { href: "/dashboard/customers", Icon: Users,           label: "Customers" },
  { href: "/dashboard/reports",   Icon: BarChart3,       label: "Reports"   },
  { href: "/dashboard/settings",  Icon: Settings,        label: "Settings"  },
];

const C = {
  brand:   "#2b34d1",
  bg:      "#ffffff",
  border:  "#f1f5f9",
  pill:    "#f1f5f9",
  pillTxt: "#475569",
  txt:     "#0f172a",
};

export function Topbar() {
  const pathname                      = usePathname();
  const [searchOpen, setSearchOpen]   = useState(false);
  const [navOpen,    setNavOpen]      = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .bp-bar * { font-family:'Sora',sans-serif; box-sizing:border-box; }
        .bp-nav-link { display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;font-size:13px;font-weight:500;text-decoration:none;white-space:nowrap;transition:background 0.15s,color 0.15s; }
        .bp-nav-active { background:${C.brand};color:#fff; }
        .bp-nav-idle   { color:#64748b; }
        .bp-nav-idle:hover { background:#f1f5f9;color:#1e293b; }
        .bp-icon-btn { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:${C.pill};border:none;cursor:pointer;flex-shrink:0; }
        .bp-icon-btn:hover { background:#e2e8f0; }
        .bp-input { width:100%;padding:9px 14px 9px 36px;border-radius:10px;border:1px solid transparent;background:${C.pill};font-size:13px;color:#334155;outline:none;font-family:'Sora',sans-serif; }
        .bp-input:focus { background:#fff;border-color:#e2e8f0; }
        .bp-mob-link { display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;border-radius:12px;font-size:11px;font-weight:600;text-decoration:none;transition:background 0.15s; }
        .bp-mob-active { background:${C.brand};color:#fff; }
        .bp-mob-idle   { color:#64748b; }
        .bp-mob-idle:hover { background:#f1f5f9; }
        @media(min-width:1024px){ .bp-hide-lg{display:none!important} .bp-show-lg{display:flex!important} }
        @media(max-width:1023px){ .bp-hide-sm{display:none!important} }
      `}</style>

      {/* ── Header bar ── */}
      <header className="bp-bar" style={{
        position: "sticky", top: 0, zIndex: 30,
        height: 64, background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        gap: 10, padding: "0 20px", flexShrink: 0,
      }}>

        {/* Brand */}
        <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", flexShrink:0, marginRight:4 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.brand, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Receipt style={{ width:15, height:15, color:"#fff" }} />
          </div>
          <span className="bp-hide-sm" style={{ fontSize:16, fontWeight:800, color:C.txt, fontFamily:"Sora,sans-serif" }}>BillEase</span>
        </Link>

        {/* Desktop nav */}
        <nav className="bp-show-lg bp-hide-sm" style={{ display:"none", alignItems:"center", gap:3, flex:1, overflow:"hidden" }}>
          {NAV.map(({ href, Icon, label }) => (
            <Link key={href} href={href} className={`bp-nav-link ${isActive(href) ? "bp-nav-active" : "bp-nav-idle"}`}>
              <Icon style={{ width:14, height:14, flexShrink:0 }} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <div className="bp-show-lg bp-hide-sm" style={{ display:"none", position:"relative", width:200 }}>
          <Search style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:"#94a3b8", pointerEvents:"none" }} />
          <input type="text" placeholder="Search..." className="bp-input" />
        </div>

        {/* Right */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          {/* Add Sale */}
          <Link href="/dashboard/sales/new" style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"8px 14px", borderRadius:10,
            background: C.brand, color:"#fff",
            fontSize:13, fontWeight:700, textDecoration:"none",
            boxShadow:"0 2px 8px rgba(43,52,209,0.3)", flexShrink:0,
            fontFamily:"Sora,sans-serif",
          }}>
            <Plus style={{ width:14, height:14 }} />
            Add Sale
          </Link>

          {/* Bell */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <button className="bp-icon-btn"><Bell style={{ width:16, height:16, color:C.pillTxt }} /></button>
            <span style={{ position:"absolute", top:7, right:7, width:7, height:7, borderRadius:"50%", background:"#ef4444", border:"2px solid #fff" }} />
          </div>

          {/* Avatar */}
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#fb923c,#2b34d1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800, flexShrink:0, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>R</div>

          {/* Mobile search */}
          <button className="bp-icon-btn bp-hide-lg" onClick={() => setSearchOpen(s => !s)}><Search style={{ width:16, height:16, color:C.pillTxt }} /></button>

          {/* Mobile hamburger */}
          <button className="bp-icon-btn bp-hide-lg" onClick={() => setNavOpen(s => !s)}><Menu style={{ width:17, height:17, color:C.pillTxt }} /></button>
        </div>

        {/* Mobile search bar (overlay inside header) */}
        {searchOpen && (
          <div style={{ position:"absolute", left:0, right:0, top:0, height:64, background:"#fff", display:"flex", alignItems:"center", padding:"0 16px", gap:8, zIndex:10 }}>
            <Search style={{ width:15, height:15, color:"#94a3b8", flexShrink:0 }} />
            <input autoFocus type="text" placeholder="Search..." style={{ flex:1, border:"none", background:"transparent", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif" }} />
            <button onClick={() => setSearchOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex" }}><X style={{ width:16, height:16, color:"#94a3b8" }} /></button>
          </div>
        )}
      </header>

      {/* ── Mobile nav dropdown ── */}
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position:"fixed", inset:0, zIndex:19 }} />
          <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:20, background:"#fff", borderBottom:`1px solid ${C.border}`, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:12, fontFamily:"Sora,sans-serif" }}>
            {NAV.map(({ href, Icon, label }) => (
              <Link key={href} href={href} onClick={() => setNavOpen(false)} className={`bp-mob-link ${isActive(href) ? "bp-mob-active" : "bp-mob-idle"}`}>
                <Icon style={{ width:20, height:20 }} />{label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}