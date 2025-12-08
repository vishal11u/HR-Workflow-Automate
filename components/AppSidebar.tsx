"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiTimerLine,
  RiPlayMiniLine,
  RiSettings4Line,
} from "react-icons/ri";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  interface NavItem {
    name: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navItems: NavGroup[] = [
    {
      group: "General",
      items: [
        { name: "Dashboard", icon: RiDashboardLine, href: "/dashboard" },
        { name: "Scheduler", icon: RiTimerLine, href: "/scheduler" },
      ],
    },
    {
      group: "Automation",
      items: [
        {
          name: "Workflows",
          icon: RiPlayMiniLine,
          href: "/",
          badge: "HR",
        },
      ],
    },
  ];

  return (
    <aside className="flex w-52 min-w-52 flex-col border-r border-zinc-200 bg-zinc-50/80 px-3 py-4 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center">
          <RiPlayMiniLine className="text-white h-4 w-4" />
        </div>
        <span className="font-bold text-sm text-zinc-900">HR Flow</span>
      </div>

      <nav className="flex-1 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors
                      ${
                        active
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-600 hover:bg-zinc-200/60"
                      }
                    `}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`
                          flex h-4 w-4 items-center justify-center rounded-md transition-colors
                          ${
                            active
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-200 text-zinc-500 group-hover:bg-zinc-300"
                          }
                        `}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <span>{item.name}</span>
                    </span>

                    {item.badge && (
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] text-zinc-900 shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-zinc-200 space-y-1">
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200/60">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-200 text-zinc-500">
            <RiSettings4Line className="h-3 w-3" />
          </span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
