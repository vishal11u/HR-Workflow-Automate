import { WorkflowCanvas } from "./components/WorkflowCanvas";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">
            HR Workflow Designer
          </h1>
          <p className="text-xs text-zinc-500">
            Visually design and test internal HR workflows such as onboarding
            and approvals.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800">
            Prototype
          </span>
          <span>React + React Flow</span>
        </div>
      </header>
      
      <main className="flex-1 px-6 py-4 dot-grid-bg">
        <WorkflowCanvas />
      </main>
    </div>
  );
}
