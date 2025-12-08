"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "reactflow";
import { workflowApi } from "@/lib/api/client";
import { toast } from "sonner";
import "reactflow/dist/style.css";

interface WorkflowEditorProps {
  workflowId: string;
}

export default function WorkflowEditor({ workflowId }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load workflow on mount
  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const workflow = await workflowApi.getById(workflowId);

      setWorkflowName(workflow.name);

      // Convert database nodes to React Flow format
      const flowNodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      }));

      // Convert database edges to React Flow format
      const flowEdges: Edge[] = workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      toast.error("Failed to load workflow");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Save workflow
  const saveWorkflow = async () => {
    try {
      setSaving(true);

      // Convert React Flow nodes/edges to database format
      const payload = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: node.data || {},
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      const result = await workflowApi.saveGraph(workflowId, payload);

      toast.success(
        `Saved ${result.nodesCount} nodes and ${result.edgesCount} edges`
      );
    } catch (error) {
      toast.error("Failed to save workflow");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Create version snapshot
  const createVersion = async () => {
    try {
      const snapshot = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: node.data || {},
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      const version = await workflowApi.createVersion(workflowId, {
        snapshot,
      });

      toast.success(`Version ${version.version_number} created!`);
    } catch (error) {
      toast.error("Failed to create version");
      console.error(error);
    }
  };

  // Auto-save functionality (optional)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (nodes.length > 0 && !saving) {
        saveWorkflow();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges, saving]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{workflowName}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {nodes.length} nodes, {edges.length} connections
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveWorkflow}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={createVersion}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
          >
            Create Version
          </button>

          <button
            onClick={loadWorkflow}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Reload
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
