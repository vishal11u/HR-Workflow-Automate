"use client";

import { Handle, Position } from "reactflow";
import { AutomatedStepNodeData } from "../../types/workflow";

interface Props {
  data: AutomatedStepNodeData;
}

export function AutomatedNode({ data }: Props) {
  const hasIssues = (data.validationIssues?.length ?? 0) > 0;
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm ${
        hasIssues
          ? "border border-rose-300 bg-rose-50"
          : "border border-purple-300 bg-purple-50"
      }`}
    >
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-purple-100 text-[10px] text-purple-700">
          ⚙
        </span>
        <span>Automated</span>
      </div>
      <div className="text-sm font-medium text-purple-900">{data.title}</div>
      {data.actionId && (
        <div className="mt-1 text-xs text-purple-800">Action: {data.actionId}</div>
      )}
      {hasIssues && (
        <div className="mt-1 text-[10px] text-rose-700">
          {data.validationIssues?.[0]}
        </div>
      )}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-purple-500" />
    </div>
  );
}


