import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const runtime = "edge";

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      debug: {
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        sessionError: sessionError?.message,
        userError: userError?.message,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
