export type NodeType = "start" | "task" | "approval" | "automated" | "end";

export interface BaseNodeData {
  id: string;
  label: string;
  type: NodeType;
  validationIssues?: string[];
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface StartNodeData extends BaseNodeData {
  type: "start";
  title: string;
  metadata: KeyValue[];
}

export interface TaskNodeData extends BaseNodeData {
  type: "task";
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData extends BaseNodeData {
  type: "approval";
  title: string;
  approverRole: string;
  autoApproveThreshold?: number;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface AutomatedStepNodeData extends BaseNodeData {
  type: "automated";
  title: string;
  actionId?: string;
  params: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  type: "end";
  endMessage?: string;
  summaryFlag: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

export interface SimulationRequest {
  nodes: any[];
  edges: any[];
}

export interface SimulationStep {
  id: string;
  label: string;
  type: NodeType;
  status: "pending" | "completed" | "skipped" | "error";
  message: string;
}

export interface SimulationResult {
  valid: boolean;
  issues: string[];
  steps: SimulationStep[];
}
