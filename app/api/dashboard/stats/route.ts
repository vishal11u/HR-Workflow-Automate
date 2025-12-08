import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
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

    // Parallel requests for performance
    const [
      workflowsCount,
      jobsCount,
      recentRuns,
      successCount,
      failedCount,
      runningCount,
    ] = await Promise.all([
      supabase
        .from("workflows")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabase
        .from("scheduled_jobs")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabase
        .from("workflow_runs")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("workflow_runs")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "success"),
      supabase
        .from("workflow_runs")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "failed"),
      supabase
        .from("workflow_runs")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "running"),
    ]);

    // Handle potential errors in individual promises? Promise.all throws on first error.
    // Assuming supabase calls don't throw but return { error }.

    if (workflowsCount.error)
      console.error("Stats Error (workflows):", workflowsCount.error);

    // Calculate total Automations (runs)
    const totalRuns =
      (successCount.count || 0) +
      (failedCount.count || 0) +
      (runningCount.count || 0);

    const successRate =
      totalRuns > 0
        ? Math.round(((successCount.count || 0) / totalRuns) * 100)
        : 0;

    return successResponse({
      activeWorkflows: workflowsCount.count || 0,
      scheduledJobs: jobsCount.count || 0,
      recentRuns: recentRuns.data || [],
      runsByStatus: {
        success: successCount.count || 0,
        failed: failedCount.count || 0,
        running: runningCount.count || 0,
        pending: 0, // Placeholder
      },
      stats: {
        successRate,
        totalAutomations: totalRuns,
        pendingApprovals: 5, // Mock/placeholder or need separate approvals table
      },
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      500
    );
  }
}
