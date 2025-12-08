import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  verifyWorkflowAccess,
  successResponse,
  errorResponse,
} from "@/lib/api/utils";

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

    // Fetch all versions for this workflow
    const { data: versions, error } = await supabase
      .from("workflow_versions")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("version_number", { ascending: false });

    if (error) {
      return errorResponse(`Failed to fetch versions: ${error.message}`, 500);
    }

    return successResponse(versions || []);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
