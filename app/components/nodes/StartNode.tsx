"use client";

import { Handle, Position } from "reactflow";
import { StartNodeData } from "../../types/workflow";

interface Props {
  data: StartNodeData;
}

export function StartNode({ data }: Props) {
  const hasIssues = (data.validationIssues?.length ?? 0) > 0;
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm ${
        hasIssues
          ? "border border-rose-300 bg-rose-50"
          : "border border-emerald-300 bg-emerald-50"
      }`}
    >
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-emerald-100 text-[10px] text-emerald-700">
          ▶
        </span>
        <span>Start</span>
      </div>

      <div className="text-sm font-medium text-emerald-900">{data.title}</div>

      {hasIssues && (
        <div className="mt-1 text-[10px] text-rose-700">
          {data.validationIssues?.[0]}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-emerald-500"
      />
    </div>
  );
}
