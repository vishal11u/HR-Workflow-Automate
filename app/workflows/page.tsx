"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { WorkflowList } from "@/components/workflows/WorkflowList";
import { RiLoader4Line } from "react-icons/ri";

export default function WorkflowsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <RiLoader4Line className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <WorkflowList />;
}
