import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
} from "@/lib/api/utils";

export const runtime = "edge";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }
    const { organizationId } = authResult;

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON", 400);
    }

    const supabase = await createServerClient();

    const { data: job, error } = await supabase
      .from("scheduled_jobs")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", organizationId) // Security check
      .select()
      .single();

    if (error) return errorResponse(error.message, 500);

    return successResponse(job);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return errorResponse(
        authResult.error ?? "Authentication failed",
        authResult.status
      );
    }
    const { organizationId } = authResult;

    const supabase = await createServerClient();

    const { error } = await supabase
      .from("scheduled_jobs")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) return errorResponse(error.message, 500);

    return successResponse({ message: "Job deleted successfully" });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      500
    );
  }
}
