import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  verifyWorkflowAccess,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api/utils";
import type { CreateVersionPayload } from "@/lib/types/database";

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

    const { user, organizationId } = authResult;
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
    let body: CreateVersionPayload;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    // Validate payload
    const validationError = validateRequiredFields(body, ["snapshot"]);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    if (!body.snapshot.nodes || !body.snapshot.edges) {
      return errorResponse("snapshot must include nodes and edges", 400);
    }

    const supabase = await createServerClient();

    // Get the latest version number for this workflow
    const { data: latestVersion } = await supabase
      .from("workflow_versions")
      .select("version_number")
      .eq("workflow_id", workflowId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = latestVersion
      ? latestVersion.version_number + 1
      : 1;

    // Insert new version
    const { data: version, error } = await supabase
      .from("workflow_versions")
      .insert({
        workflow_id: workflowId,
        version_number: nextVersionNumber,
        snapshot: body.snapshot,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(`Failed to create version: ${error.message}`, 500);
    }

    return successResponse(version, 201);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
