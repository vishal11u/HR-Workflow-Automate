"use client";

import { useRef, useState } from "react";
import { Edge, Node } from "reactflow";
import { SimulationResult } from "../types/workflow";
import { simulateWorkflow } from "../api/mockClient";

interface Props {
  nodes: Node[];
  edges: Edge[];
  onImport: (snapshot: { nodes: Node[]; edges: Edge[] }) => void;
}

export function SandboxPanel({ nodes, edges, onImport }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
   const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRun = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await simulateWorkflow({
        nodes,
        edges,
      });
      setResult(res);
    } catch {
      setError("Unable to simulate workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            nodes,
            edges,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hr-workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        onImport({
          nodes: parsed.nodes,
          edges: parsed.edges,
        });
        setError(null);
        setResult(null);
      } else {
        setError("Invalid workflow file. Expected JSON with `nodes` and `edges` arrays.");
      }
    } catch {
      setError("Could not read workflow file. Please check the JSON format.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
            Workflow Sandbox
          </h2>
          <p className="text-[11px] text-zinc-500">
            Simulate, export, and import workflows for quick testing.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={handleExport}
            disabled={nodes.length === 0}
          >
            Export
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={handleImportClick}
          >
            Import
          </button>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            onClick={handleRun}
            disabled={loading || nodes.length === 0}
          >
            {loading ? "Run..." : "Run"}
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportChange}
      />
      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
          {error}
        </div>
      )}
      <div className="mt-3 flex-1 overflow-auto rounded-md bg-white p-2 text-xs">
        {!result && (
          <p className="text-zinc-500">
            No simulation has been run yet. Press{" "}
            <span className="font-medium">Run Simulation</span> to get a
            step-by-step log.
          </p>
        )}
        {result && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    result.valid ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-xs font-medium text-zinc-800">
                  {result.valid
                    ? "Workflow is valid"
                    : "Workflow has validation issues"}
                </span>
              </div>
              {result.issues.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-[11px] text-amber-700">
                  {result.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Execution Trace
              </div>
              <ol className="mt-1 space-y-1">
                {result.steps.map((step, index) => (
                  <li
                    key={step.id}
                    className="flex items-start gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1"
                  >
                    <span className="mt-[3px] text-[10px] text-zinc-400">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800">
                          {step.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                          {step.type}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-600">
                        {step.message}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
      <details className="mt-2 rounded-md border border-dashed border-zinc-200 bg-white p-2 text-[11px] text-zinc-500">
        <summary className="cursor-pointer text-[11px] font-medium text-zinc-700">
          View workflow JSON
        </summary>
        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px]">
          {JSON.stringify(
            {
              nodes,
              edges,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}


