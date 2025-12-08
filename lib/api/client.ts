import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowVersion,
  ApiResponse,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  SaveWorkflowPayload,
  CreateVersionPayload,
} from "@/lib/types/database";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Request failed");
  }

  return result.data;
}

export const workflowApi = {
  /**
   * Get all workflows for the current user's organization
   */
  async getAll(): Promise<Workflow[]> {
    return apiFetch<Workflow[]>("/api/workflows");
  },

  /**
   * Create a new workflow
   */
  async create(payload: CreateWorkflowPayload): Promise<Workflow> {
    return apiFetch<Workflow>("/api/workflows", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get a single workflow with all nodes and edges
   */
  async getById(id: string): Promise<
    Workflow & {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
    }
  > {
    return apiFetch(`/api/workflows/${id}`);
  },

  /**
   * Update workflow metadata (name, description)
   */
  async update(id: string, payload: UpdateWorkflowPayload): Promise<Workflow> {
    return apiFetch<Workflow>(`/api/workflows/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a workflow and all its nodes/edges
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiFetch(`/api/workflows/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Save workflow graph (nodes + edges)
   */
  async saveGraph(
    id: string,
    payload: SaveWorkflowPayload
  ): Promise<{
    workflow: Workflow;
    nodesCount: number;
    edgesCount: number;
    message: string;
  }> {
    return apiFetch(`/api/workflows/${id}/save`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Create a version snapshot of the workflow
   */
  async createVersion(
    id: string,
    payload: CreateVersionPayload
  ): Promise<WorkflowVersion> {
    return apiFetch<WorkflowVersion>(`/api/workflows/${id}/version`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get all versions of a workflow
   */
  async getVersions(id: string): Promise<WorkflowVersion[]> {
    return apiFetch<WorkflowVersion[]>(`/api/workflows/${id}/versions`);
  },
};

export const schedulerApi = {
  async getAll(): Promise<any[]> {
    return apiFetch("/api/scheduled-jobs");
  },

  async create(payload: any): Promise<any> {
    return apiFetch("/api/scheduled-jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: any): Promise<any> {
    return apiFetch(`/api/scheduled-jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<void> {
    return apiFetch(`/api/scheduled-jobs/${id}`, {
      method: "DELETE",
    });
  },
};

export const analyticsApi = {
  async getStats(): Promise<{
    activeWorkflows: number;
    scheduledJobs: number;
    recentRuns: any[];
    runsByStatus: Record<string, number>;
  }> {
    return apiFetch("/api/dashboard/stats");
  },
};
