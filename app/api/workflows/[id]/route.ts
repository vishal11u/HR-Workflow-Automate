import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  verifyWorkflowAccess,
  successResponse,
  errorResponse,
} from "@/lib/api/utils";
import type { UpdateWorkflowPayload } from "@/lib/types/database";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }

    const { organizationId } = authResult;
    const { id: workflowId } = await context.params;

    // Verify access
    const accessResult = await verifyWorkflowAccess(workflowId, organizationId);
    if ("error" in accessResult) {
      return errorResponse(
        accessResult.error ?? "Access denied",
        accessResult.status
      );
    }

    const supabase = await createServerClient();

    // Fetch workflow with nodes and edges
    const [workflowResult, nodesResult, edgesResult] = await Promise.all([
      supabase.from("workflows").select("*").eq("id", workflowId).single(),
      supabase.from("workflow_nodes").select("*").eq("workflow_id", workflowId),
      supabase.from("workflow_edges").select("*").eq("workflow_id", workflowId),
    ]);

    if (workflowResult.error) {
      return errorResponse(
        `Failed to fetch workflow: ${workflowResult.error.message}`,
        500
      );
    }

    // Combine all data
    const fullWorkflow = {
      ...workflowResult.data,
      nodes: nodesResult.data || [],
      edges: edgesResult.data || [],
    };

    return successResponse(fullWorkflow);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }

    const { organizationId } = authResult;
    const { id: workflowId } = await context.params;

    // Verify access
    const accessResult = await verifyWorkflowAccess(workflowId, organizationId);
    if ("error" in accessResult) {
      return errorResponse(
        accessResult.error ?? "Access denied",
        accessResult.status
      );
    }

    // Parse request body
    let body: UpdateWorkflowPayload;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    // Ensure at least one field to update
    if (!body.name && body.description === undefined) {
      return errorResponse(
        "At least one field (name or description) must be provided",
        400
      );
    }

    const supabase = await createServerClient();

    // Update workflow
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;

    const { data: workflow, error } = await supabase
      .from("workflows")
      .update(updateData)
      .eq("id", workflowId)
      .select()
      .single();

    if (error) {
      return errorResponse(`Failed to update workflow: ${error.message}`, 500);
    }

    return successResponse(workflow);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }

    const { organizationId } = authResult;
    const { id: workflowId } = await context.params;

    // Verify access
    const accessResult = await verifyWorkflowAccess(workflowId, organizationId);
    if ("error" in accessResult) {
      return errorResponse(
        accessResult.error ?? "Access denied",
        accessResult.status
      );
    }

    const supabase = await createServerClient();

    // Delete nodes and edges first (foreign key constraints)
    await Promise.all([
      supabase.from("workflow_nodes").delete().eq("workflow_id", workflowId),
      supabase.from("workflow_edges").delete().eq("workflow_id", workflowId),
    ]);

    // Delete workflow
    const { error } = await supabase
      .from("workflows")
      .delete()
      .eq("id", workflowId);

    if (error) {
      return errorResponse(`Failed to delete workflow: ${error.message}`, 500);
    }

    return successResponse({ message: "Workflow deleted successfully" });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
