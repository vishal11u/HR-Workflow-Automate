"use client";

import { useState, useEffect } from "react";
import { workflowApi } from "@/lib/api/client";
import type { Workflow } from "@/lib/types/database";
import { toast } from "sonner";
import {
  RiAddLine,
  RiMore2Fill,
  // RiEditLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiPlayLine,
  RiHistoryLine,
} from "react-icons/ri";
import Link from "next/link";
import { DashboardLayout } from "../DashboardLayout";

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getAll();
      setWorkflows(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await workflowApi.delete(id);
      toast.success("Workflow deleted");
      loadWorkflows();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workflow");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mx-auto" />
          <p className="mt-4 text-sm text-zinc-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <header className="">
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  HR Workflows
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Design and manage your organization's workflows
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700"
              >
                <RiAddLine className="h-5 w-5" />
                New Workflow
              </button>
            </div>
          </div>
        </header>

        {/* Workflows Grid */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {workflows.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <RiPlayLine className="h-12 w-12 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                No workflows yet
              </h3>
              <p className="text-sm text-zinc-600 mb-6">
                Get started by creating your first workflow
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <RiAddLine className="h-5 w-5" />
                Create Workflow
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateWorkflowModal
            onClose={() => setShowCreateModal(false)}
            onCreate={loadWorkflows}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function WorkflowCard({
  workflow,
  onDelete,
}: {
  workflow: Workflow;
  onDelete: (id: string, name: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
      {/* Workflow Info */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1">
            {workflow.name}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <RiMore2Fill className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(workflow.id, workflow.name);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-zinc-600 line-clamp-2">
          {workflow.description || "No description"}
        </p>
      </div>

      {/* Metadata */}
      <div className="mb-4 flex items-center gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <RiTimeLine className="h-3.5 w-3.5" />
          {new Date(workflow.updated_at).toLocaleDateString()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/workflows/${workflow.id}`}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 transition"
        >
          Open Editor
        </Link>
        <Link
          href={`/workflows/${workflow.id}/versions`}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-600 hover:bg-zinc-50 transition"
          title="View versions"
        >
          <RiHistoryLine className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function CreateWorkflowModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workflow = await workflowApi.create({ name, description });
      toast.success("Workflow created!");
      onClose();
      onCreate();
      // Redirect to editor
      window.location.href = `/workflows/${workflow.id}`;
    } catch (error: any) {
      toast.error(error.message || "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">
          Create New Workflow
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Workflow Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g., Employee Onboarding"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Describe what this workflow does..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
