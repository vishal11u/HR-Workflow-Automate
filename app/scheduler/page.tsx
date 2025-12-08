"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  RiAddLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiMore2Fill,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiSearchLine,
} from "react-icons/ri";
import { CreateScheduleModal } from "@/components/scheduler/CreateScheduleModal";

export default function SchedulerPage() {
  const [filter, setFilter] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { schedulerApi } = await import("@/lib/api/client");
      const data = await schedulerApi.getAll();
      setJobs(data);
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job: any) => {
    try {
      const { schedulerApi } = await import("@/lib/api/client");
      const newStatus = job.status === "active" ? "paused" : "active";
      // Optimistic update
      setJobs(
        jobs.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );

      await schedulerApi.update(job.id, { status: newStatus });
    } catch (e) {
      console.error("Failed to toggle status", e);
      fetchJobs(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const { schedulerApi } = await import("@/lib/api/client");
      await schedulerApi.delete(id);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const displayedJobs = jobs.filter(
    (j) => filter === "all" || j.status === filter
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Scheduler</h1>
            <p className="text-sm text-zinc-500">
              Manage time-based automation triggers
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 transition-all cursor-pointer"
          >
            <RiAddLine className="h-5 w-5" />
            Schedule Workflow
          </button>
        </header>

        {/* List Area */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
                onClick={() => setFilter("all")}
              >
                All Jobs
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
                onClick={() => setFilter("active")}
              >
                Active
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "paused"
                    ? "bg-amber-50 text-amber-700"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
                onClick={() => setFilter("paused")}
              >
                Paused
              </button>
            </div>

            <div className="relative">
              <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search schedules..."
                className="pl-9 pr-4 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {loading ? (
              <div className="p-12 text-center text-zinc-500">
                Loading schedules...
              </div>
            ) : displayedJobs.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                No schedules found.
              </div>
            ) : (
              displayedJobs.map((job) => (
                <div
                  key={job.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        job.status === "active"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      <RiCalendarEventLine className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {job.name}{" "}
                        <span className="text-zinc-400 font-normal text-sm">
                          ({job.workflowName})
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="h-3.5 w-3.5" />
                          {job.schedule_expression}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span>
                          Next run:{" "}
                          {job.next_run_at
                            ? new Date(job.next_run_at).toLocaleString()
                            : "Not scheduled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2">
                      {job.last_run_status === "success" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                          Last run: Success
                        </span>
                      )}
                      {job.last_run_status === "failed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 border border-rose-100">
                          Last run: Failed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center border-l border-zinc-200 pl-4 ml-2 gap-1">
                      <button
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                        title={job.status === "active" ? "Pause" : "Resume"}
                        onClick={() => handleToggleStatus(job)}
                      >
                        {job.status === "active" ? (
                          <RiPauseCircleLine className="h-5 w-5" />
                        ) : (
                          <RiPlayCircleLine className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleDelete(job.id)}
                      >
                        <RiMore2Fill className="h-5 w-5 rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateScheduleModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchJobs}
        />
      )}
    </DashboardLayout>
  );
}
