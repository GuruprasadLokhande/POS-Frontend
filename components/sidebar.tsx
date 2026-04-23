"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Receipt,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
} from "lucide-react";
import { useSidebar } from "@/app/context/sidebar-context";

const NAV_ITEMS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/sales",     icon: ShoppingCart,    label: "Sales"     },
  { href: "/dashboard/inventory", icon: Package,         label: "Inventory" },
  { href: "/dashboard/customers", icon: Users,           label: "Customers" },
  { href: "/dashboard/reports",   icon: BarChart3,       label: "Reports"   },
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings"  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1a1f2e] text-white",
          "transition-all duration-300 ease-in-out will-change-transform",
          // mobile: slide in/out via translate
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // desktop: always visible, just change width
          "lg:relative lg:translate-x-0 lg:flex-shrink-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[240px]",
          "w-[240px]",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex items-center gap-3 h-16 px-5 border-b border-white/8 flex-shrink-0",
            collapsed ? "lg:justify-center lg:px-0" : "",
          ].join(" ")}
        >
          <div className="w-8 h-8 rounded-xl bg-[#2b34d1] flex items-center justify-center flex-shrink-0">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white leading-tight">BillEase</p>
              <p className="text-[10px] text-white/40">Point of Sale</p>
            </div>
          )}
        </div>

        {/* Shop pill */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-white/6 border border-white/8 flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/90 truncate">Sharma Store</p>
              <p className="text-[10px] text-white/40">Grocery · Mumbai</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                title={collapsed ? label : undefined}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  "transition-colors duration-150 group",
                  active
                    ? "bg-[#2b34d1] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8",
                  collapsed ? "lg:justify-center lg:px-2" : "",
                ].join(" ")}
              >
                <Icon
                  style={{ width: 18, height: 18 }}
                  className={[
                    "flex-shrink-0",
                    active ? "text-white" : "text-white/50 group-hover:text-white",
                  ].join(" ")}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-white/8 pt-3 space-y-0.5 flex-shrink-0">
          {/* User */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-[#2b34d1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                R
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">Rajesh Sharma</p>
                <p className="text-[10px] text-white/35">Owner</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            title={collapsed ? "Logout" : undefined}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
              "text-white/40 hover:text-red-400 hover:bg-red-500/10",
              "text-sm font-medium transition-colors",
              collapsed ? "lg:justify-center lg:px-2" : "",
            ].join(" ")}
          >
            <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse — desktop only */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand" : "Collapse"}
            className={[
              "hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl",
              "text-white/25 hover:text-white/60 hover:bg-white/5",
              "text-sm transition-colors",
              collapsed ? "justify-center px-2" : "",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronRight style={{ width: 18, height: 18 }} />
            ) : (
              <>
                <ChevronLeft style={{ width: 18, height: 18 }} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}