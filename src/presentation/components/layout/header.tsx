"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/presentation/components/ui/button";
import {
  Leaf,
  Menu,
  LogOut,
  LayoutDashboard,
  Activity,
  Target,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Activities", href: "/dashboard/activities", icon: Activity },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/**
 * Header with mobile navigation drawer.
 */
export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Leaf className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-bold">
            Carbon<span className="text-primary">Lens</span>
          </span>
        </div>

        {/* Desktop: spacer */}
        <div className="hidden lg:block" />

        {/* User info & logout */}
        <div className="flex items-center gap-3">
          {session?.user?.name && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <nav className="border-t bg-card p-4 lg:hidden" aria-label="Mobile navigation">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
