import {
  AutomationAction,
  SimulationRequest,
  SimulationResult,
} from "../types/workflow";

// In-memory mock API layer to keep things simple and self-contained.
const mockAutomations: AutomationAction[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject"] },
  {
    id: "generate_doc",
    label: "Generate Document",
    params: ["template", "recipient"],
  },
  {
    id: "create_ticket",
    label: "Create IT Ticket",
    params: ["system", "priority", "summary"],
  },
  {
    id: "schedule_orientation",
    label: "Schedule Orientation",
    params: ["date", "location"],
  },
  {
    id: "sync_hris",
    label: "Sync to HRIS",
    params: ["employeeId", "system"],
  },
];

export async function fetchAutomations(): Promise<AutomationAction[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockAutomations;
}

export async function simulateWorkflow(
  payload: SimulationRequest
): Promise<SimulationResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const issues: string[] = [];

  const hasStart = payload.nodes.some((n) => n.data?.type === "start");
  const hasEnd = payload.nodes.some((n) => n.data?.type === "end");

  if (!hasStart) issues.push("Workflow must contain a Start node.");
  if (!hasEnd) issues.push("Workflow must contain an End node.");

  // Very simple connectivity check (no graph traversal for brevity)
  if (payload.edges.length === 0) {
    issues.push("No connections found between steps.");
  }

  const steps = payload.nodes.map((node, index) => ({
    id: node.id,
    label: node.data?.title ?? node.data?.label ?? `Step ${index + 1}`,
    type: node.data?.type,
    status: issues.length ? ("pending" as const) : ("completed" as const),
    message: issues.length
      ? "Execution halted due to validation issues."
      : "Step executed successfully in mock simulation.",
  }));

  return {
    valid: issues.length === 0,
    issues,
    steps,
  };
}
