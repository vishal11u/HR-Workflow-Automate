import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

/**
 * Helper: Get authenticated user session and organization
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("🔍 Auth Step 1 - getUser:", {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message,
  });

  if (authError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Fetch user's organization_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  console.log("🔍 Auth Step 2 - users table query:", {
    userId: user.id,
    hasUserData: !!userData,
    userData,
    userError: userError?.message,
    userErrorDetails: userError,
  });

  if (userError || !userData) {
    console.error("❌ User lookup failed:", {
      userId: user.id,
      error: userError,
      errorMessage: userError?.message,
    });
    return { error: "User not found in organization", status: 403 };
  }

  console.log("✅ Auth successful:", {
    userId: user.id,
    organizationId: userData.organization_id,
    role: userData.role,
  });

  return {
    user,
    organizationId: userData.organization_id,
    role: userData.role,
  };
}

/**
 * Helper: Verify user has access to a specific workflow
 */
export async function verifyWorkflowAccess(
  workflowId: string,
  organizationId: string
) {
  const supabase = await createServerClient();

  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("id, organization_id")
    .eq("id", workflowId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !workflow) {
    return { error: "Workflow not found or access denied", status: 404 };
  }

  return { workflow };
}

/**
 * Standardized success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standardized error response
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  body: T,
  requiredFields: (keyof T)[]
): string | null {
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  return null;
}
