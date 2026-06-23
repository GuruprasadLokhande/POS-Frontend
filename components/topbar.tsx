"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell, Search, Plus, X, ShoppingCart,
  Package, Users, BarChart3, Settings, Menu, Receipt,
} from "lucide-react";
import "./topbar.css";

const NAV = [
  { href: "/dashboard/sales",     Icon: ShoppingCart, label: "Sales"     },
  { href: "/dashboard/inventory", Icon: Package,      label: "Inventory" },
  { href: "/dashboard/customers", Icon: Users,        label: "Customers" },
  { href: "/dashboard/reports",   Icon: BarChart3,    label: "Reports"   },
  { href: "/settings",  Icon: Settings,     label: "Settings"  },
  { href: "/employees",  Icon: Users,     label: "Employees"  },
];

export function Topbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen,    setNavOpen]    = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* ── Header bar ── */}
      <header className="bp-bar bp-header">

        {/* Brand */}
        <Link href="/dashboard" className="bp-brand">
          <div className="bp-brand-icon">
            <Receipt style={{ width: 15, height: 15, color: "#fff" }} />
          </div>
          <span className="bp-brand-name">BillEase</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="bp-desktop-nav bp-desktop-only">
          {NAV.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`bp-nav-link${isActive(href) ? " active" : ""}`}
            >
              <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="bp-search-wrap bp-desktop-only">
          <Search className="bp-search-icon" />
          <input type="text" placeholder="Search..." className="bp-search-input" />
        </div>

        {/* Right actions */}
        <div className="bp-right">

          {/* Add Sale */}
          <Link href="/dashboard/sales/new" className="bp-add-sale">
            <Plus style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>Add Sale</span>
          </Link>

          {/* Bell */}
          <div className="bp-bell-wrap">
            <button className="bp-icon-btn" aria-label="Notifications">
              <Bell style={{ width: 16, height: 16, color: "#475569" }} />
            </button>
            <span className="bp-bell-dot" />
          </div>

          {/* Avatar */}
          <div className="bp-avatar" role="button" tabIndex={0} aria-label="User profile">
            R
          </div>

          {/* Mobile: search toggle */}
          <button
            className="bp-icon-btn bp-mobile-only"
            aria-label="Open search"
            onClick={() => setSearchOpen(s => !s)}
          >
            <Search style={{ width: 16, height: 16, color: "#475569" }} />
          </button>

          {/* Mobile: hamburger */}
          <button
            className="bp-icon-btn bp-mobile-only"
            aria-label="Open navigation"
            onClick={() => setNavOpen(s => !s)}
          >
            <Menu style={{ width: 17, height: 17, color: "#475569" }} />
          </button>
        </div>

        {/* Mobile search overlay (inside header) */}
        {searchOpen && (
          <div className="bp-mobile-search">
            <Search style={{ width: 15, height: 15, color: "#94a3b8", flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              aria-label="Search"
            />
            <button
              className="bp-mobile-search-close"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <X style={{ width: 16, height: 16, color: "#94a3b8" }} />
            </button>
          </div>
        )}
      </header>

      {/* ── Mobile nav dropdown ── */}
      {navOpen && (
        <>
          <div
            className="bp-mobile-nav-backdrop"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <div className="bp-mobile-nav" role="navigation" aria-label="Mobile navigation">
            {NAV.map(({ href, Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
                className={`bp-mob-link${isActive(href) ? " active" : ""}`}
              >
                <Icon style={{ width: 20, height: 20 }} />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}