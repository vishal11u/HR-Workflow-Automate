"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflow } from "../hooks/useWorkflow";
import { NodeFormsPanel } from "./NodeForms";
import { SandboxPanel } from "./SandboxPanel";
import { StartNode } from "./nodes/StartNode";
import { TaskNode } from "./nodes/TaskNode";
import { ApprovalNode } from "./nodes/ApprovalNode";
import { AutomatedNode } from "./nodes/AutomatedNode";
import { EndNode } from "./nodes/EndNode";

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

function InnerWorkflowCanvas() {
  const workflow = useWorkflow();
  const reactFlow = useReactFlow();

  const selectedNode: Node | null = useMemo(
    () => workflow.nodes.find((n) => n.id === workflow.selectedNodeId) ?? null,
    [workflow.nodes, workflow.selectedNodeId],
  );

  return (
    <div className="flex h-[calc(100vh-88px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Primary left navigation, similar to reference UI */}
      <aside className="flex w-52 flex-col border-r border-zinc-200 bg-zinc-50/80 px-3 py-4">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          General
        </div>
        <nav className="space-y-1 text-xs">
          <button className="flex w-full items-center justify-between px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-800">
                <span className="h-2 w-2 rounded-sm bg-white" />
              </span>
              <span>Dashboard</span>
            </span>
            
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-100 text-[10px]">
                ✓
              </span>
              <span>Compliance</span>
            </span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-100 text-[10px]">
                ⏱
              </span>
              <span>Scheduler</span>
            </span>
          </button>

        </nav>
        <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Automation
        </div>
        <nav className="space-y-1 text-xs">
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-100 text-[10px]">
                🔗
              </span>
              <span>Integrations</span>
            </span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-100 text-[10px]">
                ⧉
              </span>
              <span>Repository</span>
            </span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-zinc-100 bg-zinc-900">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-emerald-100 text-[10px] text-emerald-700">
                ▶
              </span>
              <span>Workflows</span>
            </span>
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] text-zinc-900">
              HR
            </span>
          </button>
        </nav>
        <div className="mt-auto space-y-2 text-[11px] text-zinc-500">
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-2 py-1.5">
            Tip: Click a node to edit details on the right. Use edges to define
            the HR flow.
          </p>
        </div>
      </aside>

      {/* Center canvas + palette header */}
      <section className="flex min-w-0 flex-1 flex-col border-r border-zinc-200 ">
        {/* Canvas header with breadcrumb and quick palette */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
          <div className="min-w-[200px]">
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">
              User Automation
            </div>
            <div className="text-sm font-medium text-zinc-900">
              New Hire Onboarding
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button
              type="button"
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-50"
              onClick={workflow.undo}
              disabled={!workflow.canUndo}
            >
              Undo
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-50"
              onClick={workflow.redo}
              disabled={!workflow.canRedo}
            >
              Redo
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-zinc-700 hover:bg-zinc-50"
              onClick={workflow.autoLayout}
            >
              Auto layout
            </button>
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-3 py-1 font-medium text-white shadow-sm hover:bg-emerald-600"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Mini palette row, similar to chips in the reference */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50/80 px-4 py-2 text-[11px]">
          <span className="mr-1 text-zinc-400">Nodes</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-800 hover:bg-sky-100"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "task");
              event.dataTransfer.effectAllowed = "move";
            }}
            onClick={workflow.addTaskNode}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Task
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 hover:bg-amber-100"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "approval");
              event.dataTransfer.effectAllowed = "move";
            }}
            onClick={workflow.addApprovalNode}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Approval
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-purple-800 hover:bg-purple-100"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "automated");
              event.dataTransfer.effectAllowed = "move";
            }}
            onClick={workflow.addAutomatedNode}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            Automated
          </button>
        </div>

        {/* React Flow canvas */}
        <div
          className="flex-1 bg-zinc-50/60 dot-grid-bg"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow") as
              | "task"
              | "approval"
              | "automated"
              | "";
            if (!type) return;
            const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
            const position = reactFlow.project({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
            workflow.addNodeByType(type, position);
          }}
        >
          <ReactFlow
            nodes={workflow.nodes}
            edges={workflow.edges}
            onNodesChange={workflow.onNodesChange}
            onEdgesChange={workflow.onEdgesChange}
            onConnect={workflow.onConnect}
            nodeTypes={nodeTypes}
            fitView
            onNodeClick={(_, node) => workflow.setSelectedNodeId(node.id)}
          >
            <Background gap={18} size={1} color="#e4e4e7" />
            <MiniMap
              pannable
              zoomable
              className="!bg-white/80 !shadow-sm !rounded-lg"
            />
            <Controls className="!bg-white/90 !shadow-sm !rounded-lg" />
          </ReactFlow>
        </div>
      </section>

      {/* Right inspector / sandbox column */}
      <aside className="flex w-96 min-w-[320px] flex-col bg-zinc-50/80">
        <div className="border-b border-zinc-200 px-4 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
            Performance Overview
          </div>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            Workflow Insights
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-3 py-3">
          {workflow.selectedNodeId && (
            <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              <span>Selected node: {workflow.selectedNodeId}</span>
              <button
                type="button"
                className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                onClick={workflow.deleteSelected}
              >
                Delete node
              </button>
            </div>
          )}
          <div className="h-[360px] rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="h-full overflow-auto pr-1">
              <NodeFormsPanel
                node={selectedNode?.data ?? null}
                onChange={(patch) =>
                  selectedNode &&
                  workflow.updateNodeData(selectedNode.id, patch)
                }
              />
            </div>
          </div>
          <div className="h-[360px]">
            <SandboxPanel
              nodes={workflow.nodes}
              edges={workflow.edges}
              onImport={workflow.importWorkflow}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <InnerWorkflowCanvas />
    </ReactFlowProvider>
  );
}


