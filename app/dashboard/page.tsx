"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  RiRocketLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiMagicLine,
  RiMailSendLine,
  RiDatabaseLine,
  RiFileTextLine,
  RiFlowChart,
} from "react-icons/ri";

export default function DashboardPage() {
  const [stats, setStats] = React.useState<{
    activeWorkflows: number;
    scheduledJobs: number;
    runsByStatus: any;
    stats: any;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { analyticsApi } = await import("@/lib/api/client");
        const data = await analyticsApi.getStats();
        setStats(data as any);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      label: "Active Workflows",
      value: stats?.activeWorkflows?.toString() ?? "0",
      change: "Total active",
      icon: RiFlowChart,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Tasks Automations",
      value: stats?.stats?.totalAutomations?.toString() ?? "0",
      change: "Completed runs",
      icon: RiRocketLine,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Scheduled Jobs",
      value: stats?.scheduledJobs?.toString() ?? "0",
      change: "Active schedules",
      icon: RiTimeLine,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Success Rate",
      value: `${stats?.stats?.successRate ?? 0}%`,
      change: "automation health",
      icon: RiCheckDoubleLine,
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Overview of your HR automation performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-500 bg-zinc-50 rounded-md px-2 py-1 inline-block w-fit">
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area (Mockup) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 mb-6">
              Automation Activity (Last 7 Days)
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 75, 55, 85, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end group cursor-pointer"
                >
                  <div
                    className="bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h * 12} runs
                    </div>
                  </div>
                  <div className="text-center text-xs text-zinc-400 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Automations (Answering user's question) */}
          <div className="bg-linear-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-lg p-6 text-white space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RiMagicLine className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-lg">Automation Ideas</h3>
              </div>
              <p className="text-zinc-400 text-sm">
                Enhance your HR workflows with these powerful integrations
                available in the editor.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-zinc-700/50 text-blue-400">
                  <RiMailSendLine />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Smart Notifications</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Trigger emails or Slack messages when a candidate status
                    changes or onboarding is complete.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-zinc-700/50 text-amber-400">
                  <RiDatabaseLine />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Database Sync</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Automatically create employee records in your database upon
                    contract signature.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-zinc-700/50 text-rose-400">
                  <RiFileTextLine />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Document Generation</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Generate offer letters or contracts as PDFs dynamically
                    using candidate data.
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5">
              Explore All Integrations
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
