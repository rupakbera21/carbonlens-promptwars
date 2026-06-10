"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import {
  LayoutDashboard,
  Activity,
  Target,
  BarChart3,
  Settings,
  Leaf,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Activities",
    href: "/dashboard/activities",
    icon: Activity,
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    label: "Insights",
    href: "/dashboard/insights",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/**
 * Sidebar navigation with accessible link styling and active state.
 */
export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden flex-shrink-0 border-r bg-card lg:block transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Leaf className="h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                Carbon<span className="text-primary">Lens</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="border-t p-4 whitespace-nowrap overflow-hidden">
            <p className="text-xs text-muted-foreground">CarbonLens v1.0.0</p>
            <p className="text-xs text-muted-foreground">Tracking your impact</p>
          </div>
        )}
      </div>
    </aside>
  );
}
