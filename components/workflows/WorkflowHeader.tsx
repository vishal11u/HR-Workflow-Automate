"use client";

import { useEffect, useState, useCallback } from "react";
import { workflowApi } from "@/lib/api/client";
import type { Workflow } from "@/lib/types/database";
import { toast } from "sonner";
import { useWorkflow } from "@/app/hooks/useWorkflow";
import {
  RiSaveLine,
  RiHistoryLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiTimeLine,
} from "react-icons/ri";
import Link from "next/link";

type WorkflowState = ReturnType<typeof useWorkflow>;

export function WorkflowHeader({
  workflowId,
  workflow,
}: {
  workflowId: string;
  workflow: WorkflowState;
}) {
  const [workflowData, setWorkflowData] = useState<Workflow | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load workflow metadata
  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      const data = await workflowApi.getById(workflowId);
      console.log("📥 Loaded workflow data:", data);
      setWorkflowData(data);

      if (data.nodes && data.edges) {
        // console.log(
        //   "📦 Importing workflow with",
        //   data.nodes.length,
        //   "nodes and",
        //   data.edges.length,
        //   "edges"
        // );
        workflow.importWorkflow({
          nodes: data.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),
          edges: data.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
          })),
        });
      } else {
        console.log("⚠️ Workflow has no nodes/edges arrays in response");
      }

      // Always mark as loaded, regardless of whether nodes exist
      setIsLoaded(true);
      // console.log("✅ Workflow loaded, isLoaded set to true");
    } catch (error: any) {
      // console.error("❌ Failed to load workflow:", error);
      toast.error(error.message || "Failed to load workflow");
      // Still mark as loaded to prevent infinite loading state
      setIsLoaded(true);
    }
  };

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!workflowId) return;

    // console.log("💾 handleSave called, nodes count:", workflow.nodes.length);

    // Prevent saving empty workflows
    if (workflow.nodes.length === 0) {
      toast.error("Cannot save empty workflow");
      return;
    }

    try {
      setSaving(true);
      setSaveStatus("saving");

      await workflowApi.saveGraph(workflowId, {
        nodes: workflow.nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: node.data || {},
        })),
        edges: workflow.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      });

      setLastSaved(new Date());
      setSaveStatus("saved");
      toast.success("Workflow saved successfully");

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save workflow");
      setSaveStatus("idle");
    } finally {
      setSaving(false);
    }
  }, [workflowId, workflow.nodes, workflow.edges]);

  // Auto-save every 30 seconds (only after initial load)
  useEffect(() => {
    if (!workflowId || !isLoaded) return;

    const interval = setInterval(() => {
      if (workflow.nodes.length > 0 && !saving) {
        handleSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [workflowId, isLoaded, workflow.nodes, saving, handleSave]);

  // Create version snapshot
  const handleCreateVersion = async () => {
    if (!workflowId) return;

    // console.log(
    //   "📸 handleCreateVersion called, nodes count:",
    //   workflow.nodes.length
    // );

    // Prevent creating versions with empty data
    if (workflow.nodes.length === 0) {
      toast.error("Cannot create version of empty workflow");
      return;
    }

    try {
      const version = await workflowApi.createVersion(workflowId, {
        snapshot: {
          nodes: workflow.nodes.map((node: any) => ({
            id: node.id,
            type: node.type || "default",
            position: node.position,
            data: node.data || {},
          })),
          edges: workflow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
          })),
        },
      });

      toast.success(`Version ${version.version_number} created!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create version");
    }
  };

  // Keyboard shortcut for save (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <div className="flex items-center gap-3 min-w-[200px]">
        <Link
          href="/workflows"
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 transition"
          title="Back to workflows"
        >
          <RiArrowLeftLine className="h-5 w-5" />
        </Link>

        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
            User Automation
          </div>
          <div className="text-sm font-medium text-zinc-900">
            {workflowData?.name || "Loading..."}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {/* Save Status */}
        {lastSaved && (
          <span className="flex items-center gap-1.5 text-zinc-500">
            {saveStatus === "saving" ? (
              <>
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <RiCheckLine className="h-3.5 w-3.5 text-emerald-600" />
                Saved
              </>
            ) : (
              <>
                <RiTimeLine className="h-3.5 w-3.5" />
                {formatRelativeTime(lastSaved)}
              </>
            )}
          </span>
        )}

        <button
          type="button"
          className="rounded-full border cursor-pointer border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-100"
          onClick={workflow.undo}
          disabled={!workflow.canUndo}
        >
          Undo
        </button>

        <button
          type="button"
          className="rounded-full border cursor-pointer border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-100"
          onClick={workflow.redo}
          disabled={!workflow.canRedo}
        >
          Redo
        </button>

        <button
          type="button"
          className="rounded-full border cursor-pointer border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-100"
          onClick={workflow.autoLayout}
        >
          Auto layout
        </button>

        <button
          type="button"
          onClick={handleCreateVersion}
          className="inline-flex items-center gap-1.5 rounded-full border cursor-pointer border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100"
          title="Create version snapshot"
        >
          <RiHistoryLine className="h-3.5 w-3.5" />
          Save Version
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full cursor-pointer bg-zinc-800 px-3 py-1 font-medium text-white shadow-sm hover:bg-zinc-600 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <RiSaveLine className="h-3.5 w-3.5" />
              Save (Ctrl+S)
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 120) return "1 min ago";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 7200) return "1 hour ago";
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;

  return date.toLocaleString();
}
