"use client";

import { useCallback, useEffect, useState } from "react";
import {
  XYPosition,
  addEdge,
  Connection,
  Edge,
  Node,
  OnConnect,
  useEdgesState,
  useNodesState,
  MarkerType,
} from "reactflow";

import {
  AutomatedStepNodeData,
  EndNodeData,
  StartNodeData,
  TaskNodeData,
  WorkflowNodeData,
} from "../types/workflow";

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

interface WorkflowSnapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function useWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [past, setPast] = useState<WorkflowSnapshot[]>([]);
  const [future, setFuture] = useState<WorkflowSnapshot[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return;

    const initialStart: WorkflowNode = {
      id: "start-1",
      position: { x: 100, y: 100 },
      data: {
        id: "start-1",
        label: "Start",
        type: "start",
        title: "New Hire Onboarding",
        metadata: [],
      } satisfies StartNodeData,
      type: "start",
    };

    const initialEnd: WorkflowNode = {
      id: "end-1",
      position: { x: 500, y: 100 },
      data: {
        id: "end-1",
        label: "End",
        type: "end",
        endMessage: "Onboarding completed",
        summaryFlag: true,
      } satisfies EndNodeData,
      type: "end",
    };

    setNodes([initialStart, initialEnd]);
    setHasInitialized(true);
  }, [hasInitialized, setNodes]);

  const pushHistory = useCallback(() => {
    setPast((prev) => [
      ...prev.slice(-9),
      {
        nodes,
        edges,
      },
    ]);
    setFuture([]);
  }, [nodes, edges]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      let edgeColor = "#71717a";

      if (sourceNode) {
        switch (sourceNode.data.type) {
          case "start":
            edgeColor = "#10b981"; // emerald-500
            break;
          case "task":
            edgeColor = "#0ea5e9"; // sky-500
            break;
          case "approval":
            edgeColor = "#f59e0b"; // amber-500
            break;
          case "automated":
            edgeColor = "#a855f7"; // purple-500
            break;
          default:
            edgeColor = "#71717a"; // zinc-500
        }
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            style: { stroke: edgeColor, strokeWidth: 3 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
              width: 9,
              height: 9,
            },
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  const addTaskNode = useCallback(() => {
    pushHistory();
    setNodes((current) =>
      addTaskAtPosition(current, { x: 300, y: 200 + current.length * 30 })
    );
  }, [pushHistory, setNodes]);

  const addApprovalNode = useCallback(() => {
    pushHistory();
    setNodes((current) =>
      addApprovalAtPosition(current, { x: 300, y: 200 + current.length * 30 })
    );
  }, [pushHistory, setNodes]);

  const addAutomatedNode = useCallback(() => {
    pushHistory();
    setNodes((current) =>
      addAutomatedAtPosition(current, { x: 300, y: 200 + current.length * 30 })
    );
  }, [pushHistory, setNodes]);

  const addNodeByType = useCallback(
    (type: WorkflowNodeData["type"], position: XYPosition) => {
      pushHistory();
      setNodes((current) => {
        switch (type) {
          case "task":
            return addTaskAtPosition(current, position);
          case "approval":
            return addApprovalAtPosition(current, position);
          case "automated":
            return addAutomatedAtPosition(current, position);
          default:
            return current;
        }
      });
    },
    [pushHistory, setNodes]
  );

  const updateNodeData = useCallback(
    (id: string, data: Partial<WorkflowNodeData>) => {
      setNodes((nds: any) =>
        nds.map((node: any) =>
          node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )
      );
    },
    [setNodes]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    pushHistory();
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNodeId && edge.target !== selectedNodeId
      )
    );
    setSelectedNodeId(null);
  }, [pushHistory, selectedNodeId, setNodes, setEdges]);

  const importWorkflow = useCallback(
    (snapshot: WorkflowSnapshot) => {
      pushHistory();
      const laidOutNodes = computeAutoLayout(snapshot.nodes, snapshot.edges);
      const styledEdges = applyEdgeStyles(snapshot.edges, laidOutNodes);
      setNodes(laidOutNodes);
      setEdges(styledEdges);
      setSelectedNodeId(null);
    },
    [pushHistory, setEdges, setNodes]
  );

  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    pushHistory();
    const laidOutNodes = computeAutoLayout(nodes, edges);
    setNodes(laidOutNodes);
  }, [edges, nodes, pushHistory, setNodes]);

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      setSelectedNodeId(null);
      return prev.slice(0, -1);
    });
  }, [edges, nodes, setEdges, setNodes]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast((p) => [...p, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      setSelectedNodeId(null);
      return prev.slice(1);
    });
  }, [edges, nodes, setEdges, setNodes]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextIssues: string[] = [];
      const nodeIssuesMap = new Map<string, string[]>();

      const startNodes = nodes.filter((n) => n.data.type === "start");
      const endNodes = nodes.filter((n) => n.data.type === "end");

      if (startNodes.length === 0) {
        nextIssues.push("Workflow must contain a Start node.");
      }
      if (startNodes.length > 1) {
        nextIssues.push("Workflow has multiple Start nodes.");
        startNodes.forEach((n) => {
          const issues = nodeIssuesMap.get(n.id) || [];
          issues.push("Multiple Start nodes.");
          nodeIssuesMap.set(n.id, issues);
        });
      }

      if (endNodes.length === 0) {
        nextIssues.push("Workflow must contain an End node.");
      }
      if (endNodes.length > 1) {
        nextIssues.push("Workflow has multiple End nodes.");
        endNodes.forEach((n) => {
          const issues = nodeIssuesMap.get(n.id) || [];
          issues.push("Multiple End nodes.");
          nodeIssuesMap.set(n.id, issues);
        });
      }

      const outgoingMap = new Map<string, number>();
      const incomingMap = new Map<string, number>();

      edges.forEach((e) => {
        outgoingMap.set(e.source, (outgoingMap.get(e.source) ?? 0) + 1);
        incomingMap.set(e.target, (incomingMap.get(e.target) ?? 0) + 1);
        if (e.source === e.target) {
          const issues = nodeIssuesMap.get(e.source) || [];
          issues.push("Node has a self-referencing edge.");
          nodeIssuesMap.set(e.source, issues);
        }
      });

      nodes.forEach((node) => {
        const type = node.data.type;
        const incoming = incomingMap.get(node.id) ?? 0;
        const outgoing = outgoingMap.get(node.id) ?? 0;

        if (type !== "start" && incoming === 0) {
          const issues = nodeIssuesMap.get(node.id) || [];
          issues.push("No incoming connection.");
          nodeIssuesMap.set(node.id, issues);
        }
        if (type !== "end" && outgoing === 0) {
          const issues = nodeIssuesMap.get(node.id) || [];
          issues.push("No outgoing connection.");
          nodeIssuesMap.set(node.id, issues);
        }
      });

      // Update global issues state
      setIssues((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(nextIssues)) {
          return nextIssues;
        }
        return prev;
      });

      // Update nodes with validation issues if changed
      setNodes((currentNodes) => {
        let hasChanges = false;

        const newNodes = currentNodes.map((node: any) => {
          const newIssues = nodeIssuesMap.get(node.id) || [];
          const currentIssues = node.data.validationIssues || [];

          if (JSON.stringify(newIssues) !== JSON.stringify(currentIssues)) {
            hasChanges = true;
            return {
              ...node,
              data: { ...node.data, validationIssues: newIssues },
            };
          }
          return node;
        });

        return hasChanges ? newNodes : currentNodes;
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    addTaskNode,
    addApprovalNode,
    addAutomatedNode,
    addNodeByType,
    updateNodeData,
    deleteSelected,
    issues,
    importWorkflow,
    autoLayout,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

function applyEdgeStyles(
  edges: WorkflowEdge[],
  nodes: WorkflowNode[]
): WorkflowEdge[] {
  return edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    let edgeColor = "#71717a";

    if (sourceNode) {
      switch (sourceNode.data.type) {
        case "start":
          edgeColor = "#10b981"; // emerald-500
          break;
        case "task":
          edgeColor = "#0ea5e9"; // sky-500
          break;
        case "approval":
          edgeColor = "#f59e0b"; // amber-500
          break;
        case "automated":
          edgeColor = "#a855f7"; // purple-500
          break;
        default:
          edgeColor = "#71717a"; // zinc-500
      }
    }

    return {
      ...edge,
      type: "smoothstep",
      style: { stroke: edgeColor, strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
        width: 9,
        height: 9,
      },
    };
  });
}

function computeAutoLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const levelMap = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)?.push(edge.target);
  });

  const startNodes = nodes.filter((n) => n.data.type === "start");
  const queue: string[] = [];

  if (startNodes.length > 0) {
    startNodes.forEach((n) => {
      levelMap.set(n.id, 0);
      queue.push(n.id);
    });
  } else {
    nodes.forEach((n) => {
      levelMap.set(n.id, 0);
      queue.push(n.id);
    });
  }

  while (queue.length > 0) {
    const id = queue.shift() as string;
    const level = levelMap.get(id) ?? 0;
    const children = childrenMap.get(id) ?? [];
    children.forEach((childId) => {
      const existing = levelMap.get(childId);
      const nextLevel = level + 1;
      if (existing == null || nextLevel > existing) {
        levelMap.set(childId, nextLevel);
        queue.push(childId);
      }
    });
  }

  const grouped = new Map<number, WorkflowNode[]>();
  nodes.forEach((node) => {
    const level = levelMap.get(node.id) ?? 0;
    if (!grouped.has(level)) grouped.set(level, []);
    grouped.get(level)?.push(node);
  });

  const newNodes: WorkflowNode[] = [];
  const levelKeys = Array.from(grouped.keys()).sort((a, b) => a - b);
  levelKeys.forEach((level) => {
    const column = grouped.get(level) ?? [];
    column.forEach((node, index) => {
      const x = 160 + level * 260;
      const y = 80 + index * 150;
      newNodes.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return newNodes;
}

function addTaskAtPosition(
  current: WorkflowNode[],
  position: XYPosition
): WorkflowNode[] {
  const id = `task-${current.length + 1}`;
  const node: WorkflowNode = {
    id,
    position,
    data: {
      id,
      label: "Task",
      type: "task",
      title: "Collect Documents",
      description: "",
      assignee: "",
      dueDate: "",
      customFields: [],
    } satisfies TaskNodeData,
    type: "task",
  };
  return [...current, node];
}

function addApprovalAtPosition(
  current: WorkflowNode[],
  position: XYPosition
): WorkflowNode[] {
  const id = `approval-${current.length + 1}`;
  const node: WorkflowNode = {
    id,
    position,
    data: {
      id,
      label: "Approval",
      type: "approval",
      title: "Manager Approval",
      approverRole: "Manager",
      autoApproveThreshold: 0,
    },
    type: "approval",
  };
  return [...current, node];
}

function addAutomatedAtPosition(
  current: WorkflowNode[],
  position: XYPosition
): WorkflowNode[] {
  const id = `auto-${current.length + 1}`;
  const node: WorkflowNode = {
    id,
    position,
    data: {
      id,
      label: "Automated Step",
      type: "automated",
      title: "Send Welcome Email",
      actionId: undefined,
      params: {},
    } satisfies AutomatedStepNodeData,
    type: "automated",
  };
  return [...current, node];
}
