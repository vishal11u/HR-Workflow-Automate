"use client";

import React, { useState, useEffect } from "react";
import { RiCloseLine, RiLoader4Line } from "react-icons/ri";
import { workflowApi, schedulerApi } from "@/lib/api/client";
import { Workflow } from "@/lib/types/database";
import { toast } from "sonner";

interface CreateScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateScheduleModal({
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [schedule, setSchedule] = useState("");
  const [frequencyType, setFrequencyType] = useState("preset"); // 'preset' or 'cron'

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await workflowApi.getAll();
        setWorkflows(data);
        if (data.length > 0) setWorkflowId(data[0].id);
      } catch (error) {
        console.error("Failed to fetch workflows", error);
        toast.error("Failed to load workflows");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !workflowId || !schedule) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      await schedulerApi.create({
        name,
        workflow_id: workflowId,
        schedule_expression: schedule,
        status: "active",
      });
      toast.success("Schedule created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create schedule", error);
      toast.error("Failed to create schedule");
    } finally {
      setSaving(false);
    }
  };

  const PRESETS = [
    { label: "Every Hour", value: "0 * * * *" },
    { label: "Every Day at 9 AM", value: "0 9 * * *" },
    { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
    { label: "First of Every Month", value: "0 0 1 * *" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">
            Schedule Workflow
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              Job Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Onboarding Sync"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              Select Workflow
            </label>
            {loading ? (
              <div className="h-10 w-full animate-pulse bg-zinc-100 rounded-lg" />
            ) : workflows.length === 0 ? (
              <div className="text-sm text-red-500">
                No workflows found. Create one first.
              </div>
            ) : (
              <select
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Run Frequency
              </label>
              <div className="flex bg-zinc-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFrequencyType("preset");
                    setSchedule(PRESETS[0].value);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    frequencyType === "preset"
                      ? "bg-white shadow-sm text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFrequencyType("cron");
                    setSchedule("");
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    frequencyType === "cron"
                      ? "bg-white shadow-sm text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  Custom Cron
                </button>
              </div>
            </div>

            {frequencyType === "preset" ? (
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSchedule(preset.value)}
                    className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                      schedule === preset.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 hover:border-zinc-300 text-zinc-600"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="* * * * *"
                className="w-full font-mono text-sm rounded-lg border border-zinc-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            )}
            <p className="mt-1.5 text-xs text-zinc-400">
              Selected spec:{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-600">
                {schedule || "None"}
              </code>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                saving || loading || workflows.length === 0 || !schedule
              }
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <RiLoader4Line className="animate-spin" />}
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
