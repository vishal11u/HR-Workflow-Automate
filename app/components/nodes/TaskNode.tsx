"use client";

import { Handle, Position } from "reactflow";
import { TaskNodeData } from "../../types/workflow";

interface Props {
  data: TaskNodeData;
}

export function TaskNode({ data }: Props) {
  const hasIssues = (data.validationIssues?.length ?? 0) > 0;
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm ${
        hasIssues
          ? "border border-rose-300 bg-rose-50"
          : "border border-sky-300 bg-sky-50"
      }`}
    >
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-sky-100 text-[10px] text-sky-700">
          ✔
        </span>
        <span>Task</span>
      </div>

      <div className="text-sm font-medium text-sky-900">{data.title}</div>
      {data.assignee && (
        <div className="mt-1 text-xs text-sky-800">
          Assignee: {data.assignee}
        </div>
      )}

      {hasIssues && (
        <div className="mt-1 text-[10px] text-rose-700">
          {data.validationIssues?.[0]}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-sky-500 border-2 border-white"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-sky-500 border-2 border-white"
      />
    </div>
  );
}
