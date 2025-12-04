"use client";

import { Handle, Position } from "reactflow";
import { ApprovalNodeData } from "../../types/workflow";
import { FiClock } from "react-icons/fi";

interface Props {
  data: ApprovalNodeData;
}

export function ApprovalNode({ data }: Props) {
  const hasIssues = (data.validationIssues?.length ?? 0) > 0;

  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm ${
        hasIssues
          ? "border border-rose-300 bg-rose-50"
          : "border border-amber-300 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-amber-100 text-[10px] text-amber-700">
          <FiClock className="w-3 h-3" />
        </span>
        <span>Approval</span>
      </div>

      <div className="text-sm font-medium text-amber-900">{data.title}</div>

      <div className="mt-1 text-xs text-amber-800">
        Role: {data.approverRole}
      </div>

      {hasIssues && (
        <div className="mt-1 text-[10px] text-rose-700">
          {data.validationIssues?.[0]}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-amber-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-amber-500 border-2 border-white"
      />
    </div>
  );
}
