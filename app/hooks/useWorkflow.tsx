"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  XYPosition,
  addEdge,
  Connection,
  Edge,
  Node,
  OnConnect,
  useEdgesState,
  useNodesState,
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

  useEffect(() => {
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
  }, [setNodes]);

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
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep" }, eds));
    },
    [setEdges]
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
      setNodes(laidOutNodes);
      setEdges(snapshot.edges);
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

  const { validatedNodes, issues } = useMemo(() => {
    const nextIssues: string[] = [];
    const nextNodes = nodes.map((n) => ({
      ...n,
      data: { ...n.data, validationIssues: [] },
    }));

    const startNodes = nextNodes.filter((n) => n.data.type === "start");
    const endNodes = nextNodes.filter((n) => n.data.type === "end");

    if (startNodes.length === 0) {
      nextIssues.push("Workflow must contain a Start node.");
    }
    if (startNodes.length > 1) {
      nextIssues.push("Workflow has multiple Start nodes.");
      startNodes.forEach((n) => {
        ((n.data as any).validationIssues ??= []).push("Multiple Start nodes.");
      });
    }

    if (endNodes.length === 0) {
      nextIssues.push("Workflow must contain an End node.");
    }
    if (endNodes.length > 1) {
      nextIssues.push("Workflow has multiple End nodes.");
      endNodes.forEach((n) => {
        (n.data as any).validationIssues ??= [];
        (n.data as any).validationIssues.push("Multiple End nodes.");
      });
    }

    const outgoingMap = new Map<string, number>();
    const incomingMap = new Map<string, number>();
    edges.forEach((e) => {
      outgoingMap.set(e.source, (outgoingMap.get(e.source) ?? 0) + 1);
      incomingMap.set(e.target, (incomingMap.get(e.target) ?? 0) + 1);
      if (e.source === e.target) {
        const node = nextNodes.find((n) => n.id === e.source);
        if (node) {
          ((node.data as any).validationIssues ??= []).push(
            "Node has a self-referencing edge."
          );
        }
      }
    });

    nextNodes.forEach((node) => {
      const type = node.data.type;
      const incoming = incomingMap.get(node.id) ?? 0;
      const outgoing = outgoingMap.get(node.id) ?? 0;

      if (type !== "start" && incoming === 0) {
        ((node.data as any).validationIssues ??= []).push(
          "No incoming connection."
        );
      }
      if (type !== "end" && outgoing === 0) {
        ((node.data as any).validationIssues ??= []).push(
          "No outgoing connection."
        );
      }
    });

    return { validatedNodes: nextNodes, issues: nextIssues };
  }, [nodes, edges]);

  return {
    nodes: validatedNodes,
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
