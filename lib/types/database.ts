export interface Database {
  public: {
    Tables: {
      workflows: {
        Row: Workflow;
        Insert: WorkflowInsert;
        Update: WorkflowUpdate;
      };
      workflow_nodes: {
        Row: WorkflowNode;
        Insert: WorkflowNodeInsert;
        Update: WorkflowNodeUpdate;
      };
      workflow_edges: {
        Row: WorkflowEdge;
        Insert: WorkflowEdgeInsert;
        Update: WorkflowEdgeUpdate;
      };
      workflow_versions: {
        Row: WorkflowVersion;
        Insert: WorkflowVersionInsert;
        Update: WorkflowVersionUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      scheduled_jobs: {
        Row: ScheduledJob;
        Insert: ScheduledJobInsert;
        Update: ScheduledJobUpdate;
      };
      workflow_runs: {
        Row: WorkflowRun;
        Insert: WorkflowRunInsert;
        Update: WorkflowRunUpdate;
      };
    };
  };
}

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInsert {
  id?: string;
  organization_id: string;
  name: string;
  description?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowUpdate {
  name?: string;
  description?: string | null;
  updated_at?: string;
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  created_at: string;
}

export interface WorkflowNodeInsert {
  id?: string;
  workflow_id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  created_at?: string;
}

export interface WorkflowNodeUpdate {
  type?: string;
  position?: { x: number; y: number };
  data?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  workflow_id: string;
  source: string;
  target: string;
  created_at: string;
}

export interface WorkflowEdgeInsert {
  id?: string;
  workflow_id: string;
  source: string;
  target: string;
  created_at?: string;
}

export interface WorkflowEdgeUpdate {
  source?: string;
  target?: string;
}

export interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  snapshot: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  created_at: string;
  created_by: string;
}

export interface WorkflowVersionInsert {
  id?: string;
  workflow_id: string;
  version_number?: number;
  snapshot: {
    nodes: any[];
    edges: any[];
  };
  created_at?: string;
  created_by: string;
}

export interface WorkflowVersionUpdate {
  snapshot?: {
    nodes: any[];
    edges: any[];
  };
}

export interface User {
  id: string;
  organization_id: string;
  role: string;
  email: string;
  created_at: string;
}

export interface UserInsert {
  id?: string;
  organization_id: string;
  role: string;
  email: string;
  created_at?: string;
}

export interface UserUpdate {
  organization_id?: string;
  role?: string;
  email?: string;
}

export interface ScheduledJob {
  id: string;
  organization_id: string;
  workflow_id: string;
  name: string;
  schedule_expression: string;
  next_run_at: string | null;
  status: "active" | "paused";
  last_run_status: "success" | "failed" | "pending" | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledJobInsert {
  id?: string;
  organization_id: string;
  workflow_id: string;
  name: string;
  schedule_expression: string;
  next_run_at?: string | null;
  status?: "active" | "paused";
  last_run_status?: "success" | "failed" | "pending" | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledJobUpdate {
  name?: string;
  schedule_expression?: string;
  next_run_at?: string | null;
  status?: "active" | "paused";
  last_run_status?: "success" | "failed" | "pending" | null;
  updated_at?: string;
}

export interface WorkflowRun {
  id: string;
  organization_id: string;
  workflow_id: string;
  job_id: string | null;
  status: "pending" | "running" | "success" | "failed";
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  trigger_type: "manual" | "scheduled" | "api";
  created_at: string;
}

export interface WorkflowRunInsert {
  id?: string;
  organization_id: string;
  workflow_id: string;
  job_id?: string | null;
  status: "pending" | "running" | "success" | "failed";
  started_at?: string;
  completed_at?: string | null;
  error_message?: string | null;
  trigger_type?: "manual" | "scheduled" | "api";
  created_at?: string;
}

export interface WorkflowRunUpdate {
  status?: "pending" | "running" | "success" | "failed";
  completed_at?: string | null;
  error_message?: string | null;
}

/**
 * API Response Types
 */

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Request Payload Types
 */

export interface SaveWorkflowPayload {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}

export interface CreateVersionPayload {
  snapshot: {
    nodes: any[];
    edges: any[];
  };
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
}

export interface UpdateWorkflowPayload {
  name?: string;
  description?: string;
}
