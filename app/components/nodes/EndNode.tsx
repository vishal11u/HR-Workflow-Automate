"use client";

import { Handle, Position } from "reactflow";
import { EndNodeData } from "../../types/workflow";

interface Props {
  data: EndNodeData;
}

export function EndNode({ data }: Props) {
  const hasIssues = (data.validationIssues?.length ?? 0) > 0;
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm ${
        hasIssues
          ? "border border-rose-300 bg-rose-50"
          : "border border-zinc-300 bg-zinc-50"
      }`}
    >
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-100 text-[11px] text-zinc-700">
          ■
        </span>
        <span>End</span>
      </div>

      <div className="text-sm font-medium text-zinc-900">
        {data.endMessage || "Workflow complete"}
      </div>

      {data.summaryFlag && (
        <div className="mt-1 text-xs text-zinc-600">Summarize outcome</div>
      )}

      {hasIssues && (
        <div className="mt-1 text-[10px] text-rose-700">
          {data.validationIssues?.[0]}
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-zinc-500 border-2 border-white"
      />
    </div>
  );
}
