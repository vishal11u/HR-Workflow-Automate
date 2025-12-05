## HR Workflow Designer Prototype

![HR Workflow]([./assets/screens/Screenshot%202024-10-15%20200500.png](https://ikvwvnmsofbhmcowcsti.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-12-05%20at%203.20.14%20PM.jpeg))

This repository contains a small **HR Workflow Designer** prototype built with **Next.js (App Router)**, **React**, and **React Flow**.  
It lets an HR admin visually model workflows (onboarding, approvals, automated steps), configure node details, and run a mock simulation.

### How to Run

- **Install dependencies**

```bash
npm install
```

- **Start the dev server**

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### High-Level Architecture

- **App shell**  
  - `app/layout.tsx` defines the global shell and fonts.  
  - `app/page.tsx` is a server component that renders the workflow designer shell.

- **Workflow canvas & UI**  
  - `app/components/WorkflowCanvas.tsx` – main module that wires **React Flow**, the left‑hand navigation + node palette, the node configuration panel, and the workflow sandbox.  
  - Custom node renderers under `app/components/nodes/*` display Start, Task, Approval, Automated, and End nodes with a light, HR‑friendly visual style.

- **State management & graph logic**  
  - `app/hooks/useWorkflow.tsx` – encapsulates the React Flow node/edge state, initial graph, node CRUD helpers (add task/approval/automated nodes), selection, connection handling, undo/redo history, import/export integration, and auto‑layout.  
  - The hook exposes a minimal API (`nodes`, `edges`, `onNodesChange`, `onEdgesChange`, `onConnect`, `updateNodeData`, `autoLayout`, `undo`, etc.) so the canvas and forms stay decoupled.

- **Types & workflow model**  
  - `app/types/workflow.ts` – defines discriminated unions for all node types (`StartNodeData`, `TaskNodeData`, `ApprovalNodeData`, `AutomatedStepNodeData`, `EndNodeData`) and shared types such as `AutomationAction` and `SimulationResult`.  
  - Node state is strongly typed so forms and node renderers are safe and easily extensible.

- **Node configuration forms**  
  - `app/components/NodeForms.tsx` – a single entry panel (`NodeFormsPanel`) that switches between form components based on `node.type`.  
  - Each form is a controlled component:
    - **Start Node** – title + editable metadata key‑value list.
    - **Task Node** – required title, description, assignee, due date, and dynamic custom fields (key‑value).
    - **Approval Node** – title, approver role, and auto‑approve threshold.  
    - **Automated Step Node** – title, selectable action from `/automations`, and dynamic parameters based on the selected action definition.  
    - **End Node** – end message and a summary flag toggle.  
  - `KeyValueEditor` is a reusable, small utility for arbitrary key‑value lists.

- **Mock API layer**  
  - `app/api/mockClient.ts` – in‑memory mock of:
    - `GET /automations` → returns a small list of actions (`send_email`, `generate_doc`, `create_ticket`, `schedule_orientation`, `sync_hris`) with parameter definitions.
    - `POST /simulate` → accepts the current workflow graph and returns a `SimulationResult` with:
      - basic validation (must contain Start/End, must have at least one edge),
      - a simple step‑by‑step execution log over the node list.  
  - Implemented as async functions (with small `setTimeout` delays) to look and feel like real network calls without needing a backend server or MSW.

- **Workflow sandbox / testing**  
  - `app/components/SandboxPanel.tsx` – right‑hand sandbox that:
    - serializes the current `nodes` and `edges`,
    - calls the mock `simulateWorkflow` function,
    - shows validation issues and a step‑by‑step execution trace,
    - supports **export** / **import** of workflow JSON,
    - optionally reveals the raw workflow JSON in a collapsible section.

### Design Decisions & Assumptions

- **App Router + client islands** – the main page stays a server component and only the workflow designer (`WorkflowCanvas`) is client‑side, keeping Next.js defaults while still using React Flow.  
- **In‑memory mocks instead of a separate server** – to keep the prototype self‑contained and easy to run; the API signatures (`fetchAutomations`, `simulateWorkflow`) can later be swapped for real endpoints.  
- **React Flow node types mirror business node types** – each HR concept (start/task/approval/automated/end) has a dedicated React Flow node type and matching data interface, making it straightforward to add new node kinds later.  
- **Simple but extensible validation & execution model** – the simulator does basic structure checks (start/end presence, some connectivity) and a linear “execute node by node” log, while the editor highlights structural issues on nodes. In a full product, we would implement real graph traversal, branching, and failure states.

### What’s Implemented

- Visual workflow designer with React Flow canvas, custom node components, minimap, and controls.  
- Node palette with quick‑add **and drag‑from‑palette** actions for Task, Approval, and Automated nodes (Start/End are pre‑seeded).  
- Click‑to‑edit node configuration panel with type‑specific, controlled forms and dynamic fields.  
- Mock API layer for actions and simulation, integrated into the Automated node form and Sandbox panel.  
- Workflow Sandbox that validates the current graph and surfaces a readable execution log and raw JSON.  
- Live structural **validation with visual badges on nodes** (missing connections, multiple starts/ends, self‑loops).  
- **Export / Import** of workflow JSON plus lightweight **undo / redo** and **auto‑layout** of the graph.  
- Dotted‑grid canvas and iconography to roughly mirror the provided reference UI.

### Potential Extensions (If Given More Time)

- Richer validation (graph traversal for unreachable nodes, true cycle detection, dangling edges) and validation summaries grouped per issue type.  
- Workflow **version history** with named snapshots and the ability to diff versions.  
- More sophisticated simulation UI (timeline, status badges, branching paths) and pluggable test inputs (e.g., employee type, region).  
- Persist workflows to a backend or local storage, add basic multi‑workflow management, and support templates for common HR flows.  
- Role‑aware editor (e.g., HR vs Manager) with guard rails and commenting on nodes.


