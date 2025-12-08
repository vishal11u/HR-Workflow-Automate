import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api/utils";

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

    const { data: jobs, error } = await supabase
      .from("scheduled_jobs")
      .select(
        `
        *,
        workflows (
          name
        )
      `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Transform response to flatten workflow name if needed, or keep as is.
    // Client expects workflowName property? Or we can map it in the client.
    // The JOIN returns workflows as an object or array. Since it is many-to-one (job -> workflow), it returns an object.

    const formattedJobs = jobs?.map((job) => ({
      ...job,
      workflowName: (job.workflows as any)?.name || "Unknown Workflow",
    }));

    return successResponse(formattedJobs);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
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

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON", 400);
    }

    const validationError = validateRequiredFields(body, [
      "workflow_id",
      "name",
      "schedule_expression",
    ]);
    if (validationError) return errorResponse(validationError, 400);

    const supabase = await createServerClient();

    // Calculate next_run_at? For now let's set it to null or calculate via library if we had one.
    // Or just accept what client sends (not ideal).
    // Let's assume the user sets it or we leave it null for the runner to pick up.
    // Ideally we'd use a cron parser here. But for now, we'll store it.

    const { data: job, error } = await supabase
      .from("scheduled_jobs")
      .insert({
        organization_id: organizationId,
        workflow_id: body.workflow_id,
        name: body.name,
        schedule_expression: body.schedule_expression,
        next_run_at: new Date().toISOString(), // Mocking next run for now
        status: body.status || "active",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return errorResponse(error.message, 500);

    return successResponse(job, 201);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      500
    );
  }
}
