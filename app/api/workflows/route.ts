import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api/utils";
import type { CreateWorkflowPayload } from "@/lib/types/database";

export const runtime = "edge";

export async function GET() {
  try {
    const authResult = await getAuthenticatedUser();

    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }

    const { organizationId } = authResult;
    const supabase = await createServerClient();

    const { data: workflows, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });

    if (error) {
      return errorResponse(`Failed to fetch workflows: ${error.message}`, 500);
    }

    return successResponse(workflows);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser();

    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }

    const { user, organizationId } = authResult;

    // Parse request body
    let body: CreateWorkflowPayload;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, ["name"]);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const supabase = await createServerClient();

    // Create workflow
    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert({
        organization_id: organizationId,
        name: body.name,
        description: body.description || null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return errorResponse(`Failed to create workflow: ${error.message}`, 500);
    }

    return successResponse(workflow, 201);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
