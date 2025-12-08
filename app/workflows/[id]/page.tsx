"use client";

import { use } from "react";
import { WorkflowCanvas } from "@/app/components/WorkflowCanvas";
// import { WorkflowHeader } from "@/components/workflows/WorkflowHeader";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { RiLoader4Line } from "react-icons/ri";

export default function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, loading } = useAuth();
  const { id } = use(params);

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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="flex-1">
        <WorkflowCanvas workflowId={id} />
      </main>
    </div>
  );
}
