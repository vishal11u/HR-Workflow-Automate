import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  verifyWorkflowAccess,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api/utils";
import type { SaveWorkflowPayload } from "@/lib/types/database";

export const runtime = "edge";

 
export async function POST(
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
    let body: SaveWorkflowPayload;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    // Validate payload
    const validationError = validateRequiredFields(body, ["nodes", "edges"]);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
      return errorResponse("nodes and edges must be arrays", 400);
    }

    const supabase = await createServerClient();

    // Step 1: Delete old nodes and edges
    await Promise.all([
      supabase.from("workflow_nodes").delete().eq("workflow_id", workflowId),
      supabase.from("workflow_edges").delete().eq("workflow_id", workflowId),
    ]);

    // Step 2: Insert new nodes
    if (body.nodes.length > 0) {
      const nodesToInsert = body.nodes.map((node) => ({
        id: node.id,
        workflow_id: workflowId,
        type: node.type,
        position: node.position,
        data: node.data || {},
      }));

      const { error: nodesError } = await supabase
        .from("workflow_nodes")
        .insert(nodesToInsert);

      if (nodesError) {
        return errorResponse(
          `Failed to insert nodes: ${nodesError.message}`,
          500
        );
      }
    }

    // Step 3: Insert new edges
    if (body.edges.length > 0) {
      const edgesToInsert = body.edges.map((edge) => ({
        id: edge.id,
        workflow_id: workflowId,
        source: edge.source,
        target: edge.target,
      }));

      const { error: edgesError } = await supabase
        .from("workflow_edges")
        .insert(edgesToInsert);

      if (edgesError) {
        return errorResponse(
          `Failed to insert edges: ${edgesError.message}`,
          500
        );
      }
    }

    // Step 4: Update workflow timestamp
    const { data: workflow, error: updateError } = await supabase
      .from("workflows")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", workflowId)
      .select()
      .single();

    if (updateError) {
      return errorResponse(
        `Failed to update workflow: ${updateError.message}`,
        500
      );
    }

    return successResponse({
      workflow,
      nodesCount: body.nodes.length,
      edgesCount: body.edges.length,
      message: "Workflow saved successfully",
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
