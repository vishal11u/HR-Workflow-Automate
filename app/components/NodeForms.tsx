"use client";

import { useEffect, useState } from "react";
import {
  ApprovalNodeData,
  AutomatedStepNodeData,
  AutomationAction,
  EndNodeData,
  KeyValue,
  StartNodeData,
  TaskNodeData,
  WorkflowNodeData,
} from "../types/workflow";
import { fetchAutomations } from "../api/mockClient";

interface Props {
  node: WorkflowNodeData | null;
  onChange: (data: Partial<WorkflowNodeData>) => void;
}

export function NodeFormsPanel({ node, onChange }: Props) {
  const [actions, setActions] = useState<AutomationAction[]>([]);

  useEffect(() => {
    fetchAutomations().then(setActions).catch(() => {
      setActions([]);
    });
  }, []);

  if (!node) {
    return (
      <div className="h-full rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
        Select a node to configure its details.
      </div>
    );
  }

  switch (node.type) {
    case "start":
      return (
        <StartForm
          data={node as StartNodeData}
          onChange={onChange}
        />
      );
    case "task":
      return (
        <TaskForm
          data={node as TaskNodeData}
          onChange={onChange}
        />
      );
    case "approval":
      return (
        <ApprovalForm
          data={node as ApprovalNodeData}
          onChange={onChange}
        />
      );
    case "automated":
      return (
        <AutomatedForm
          data={node as AutomatedStepNodeData}
          actions={actions}
          onChange={onChange}
        />
      );
    case "end":
      return (
        <EndForm
          data={node as EndNodeData}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

interface SimpleFormProps<T> {
  data: T;
  onChange: (data: Partial<WorkflowNodeData>) => void;
}

function StartForm({ data, onChange }: SimpleFormProps<StartNodeData>) {
  const updateMetadata = (metadata: KeyValue[]) =>
    onChange({ metadata } as Partial<WorkflowNodeData>);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-zinc-900">Start Node</h2>
        <p className="text-xs text-zinc-500">
          Define how the workflow is initiated.
        </p>
      </header>
      <label className="block text-xs font-medium text-zinc-700">
        Start title
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.title}
          onChange={(e) =>
            onChange({ title: e.target.value } as Partial<WorkflowNodeData>)
          }
        />
      </label>
      <KeyValueEditor
        label="Metadata"
        items={data.metadata}
        onChange={updateMetadata}
      />
    </div>
  );
}

function TaskForm({ data, onChange }: SimpleFormProps<TaskNodeData>) {
  const updateCustomFields = (customFields: KeyValue[]) =>
    onChange({ customFields } as Partial<WorkflowNodeData>);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-zinc-900">Task Node</h2>
        <p className="text-xs text-zinc-500">
          Configure a human task such as collecting documents.
        </p>
      </header>
      <label className="block text-xs font-medium text-zinc-700">
        Title *
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.title}
          onChange={(e) =>
            onChange({ title: e.target.value } as Partial<WorkflowNodeData>)
          }
          required
        />
      </label>
      <label className="block text-xs font-medium text-zinc-700">
        Description
        <textarea
          className="mt-1 w-full resize-none rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.description ?? ""}
          onChange={(e) =>
            onChange({
              description: e.target.value,
            } as Partial<WorkflowNodeData>)
          }
          rows={3}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-medium text-zinc-700">
          Assignee
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            value={data.assignee ?? ""}
            onChange={(e) =>
              onChange({
                assignee: e.target.value,
              } as Partial<WorkflowNodeData>)
            }
          />
        </label>
        <label className="block text-xs font-medium text-zinc-700">
          Due date
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            value={data.dueDate ?? ""}
            onChange={(e) =>
              onChange({
                dueDate: e.target.value,
              } as Partial<WorkflowNodeData>)
            }
          />
        </label>
      </div>
      <KeyValueEditor
        label="Custom fields"
        items={data.customFields}
        onChange={updateCustomFields}
      />
    </div>
  );
}

function ApprovalForm({ data, onChange }: SimpleFormProps<ApprovalNodeData>) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-zinc-900">Approval Node</h2>
        <p className="text-xs text-zinc-500">
          Configure who approves this step and thresholds.
        </p>
      </header>
      <label className="block text-xs font-medium text-zinc-700">
        Title
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.title}
          onChange={(e) =>
            onChange({ title: e.target.value } as Partial<WorkflowNodeData>)
          }
        />
      </label>
      <label className="block text-xs font-medium text-zinc-700">
        Approver role
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.approverRole}
          onChange={(e) =>
            onChange({
              approverRole: e.target.value,
            } as Partial<WorkflowNodeData>)
          }
        />
      </label>
      <label className="block text-xs font-medium text-zinc-700">
        Auto-approve threshold
        <input
          type="number"
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.autoApproveThreshold ?? 0}
          onChange={(e) =>
            onChange(
              {
                autoApproveThreshold: Number(e.target.value),
              } as Partial<WorkflowNodeData>,
            )
          }
        />
      </label>
    </div>
  );
}

interface AutomatedFormProps extends SimpleFormProps<AutomatedStepNodeData> {
  actions: AutomationAction[];
}

function AutomatedForm({ data, onChange, actions }: AutomatedFormProps) {
  const selectedAction = actions.find((a) => a.id === data.actionId) ?? null;

  const handleActionChange = (id: string) => {
    const action = actions.find((a) => a.id === id);
    const nextParams: Record<string, string> = {};
    if (action) {
      action.params.forEach((p) => {
        nextParams[p] = data.params[p] ?? "";
      });
    }
    onChange({
      actionId: id || undefined,
      params: nextParams,
    } as Partial<WorkflowNodeData>);
  };

  const handleParamChange = (key: string, value: string) => {
    onChange({
      params: {
        ...data.params,
        [key]: value,
      },
    } as Partial<WorkflowNodeData>);
  };

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-zinc-900">Automated Step</h2>
        <p className="text-xs text-zinc-500">
          Choose a system action and provide parameters.
        </p>
      </header>
      <label className="block text-xs font-medium text-zinc-700">
        Title
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.title}
          onChange={(e) =>
            onChange({ title: e.target.value } as Partial<WorkflowNodeData>)
          }
        />
      </label>
      <label className="block text-xs font-medium text-zinc-700">
        Action
        <select
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm bg-white"
          value={data.actionId ?? ""}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          <option value="">Select an action</option>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      {selectedAction && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-700">Parameters</div>
          {selectedAction.params.map((param) => (
            <label
              key={param}
              className="block text-xs font-medium text-zinc-700"
            >
              {param}
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
                value={data.params[param] ?? ""}
                onChange={(e) => handleParamChange(param, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function EndForm({ data, onChange }: SimpleFormProps<EndNodeData>) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-zinc-900">End Node</h2>
        <p className="text-xs text-zinc-500">
          Configure how the workflow should complete.
        </p>
      </header>
      <label className="block text-xs font-medium text-zinc-700">
        End message
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={data.endMessage ?? ""}
          onChange={(e) =>
            onChange({
              endMessage: e.target.value,
            } as Partial<WorkflowNodeData>)
          }
        />
      </label>
      <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
        <input
          type="checkbox"
          className="h-3 w-3 rounded border-zinc-300"
          checked={data.summaryFlag}
          onChange={(e) =>
            onChange({
              summaryFlag: e.target.checked,
            } as Partial<WorkflowNodeData>)
          }
        />
        Show summary at completion
      </label>
    </div>
  );
}

interface KeyValueEditorProps {
  label: string;
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
}

function KeyValueEditor({ label, items, onChange }: KeyValueEditorProps) {
  const handleItemChange = (index: number, patch: Partial<KeyValue>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-700">{label}</span>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-50"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-zinc-400">No entries yet.</p>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-1">
            <input
              placeholder="Key"
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
              value={item.key}
              onChange={(e) =>
                handleItemChange(index, { key: e.target.value })
              }
            />
            <span className="px-1 text-xs text-zinc-400">=</span>
            <input
              placeholder="Value"
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
              value={item.value}
              onChange={(e) =>
                handleItemChange(index, { value: e.target.value })
              }
            />
            <button
              type="button"
              className="ml-1 rounded-md border border-zinc-200 px-1 text-xs text-zinc-500 hover:bg-zinc-50"
              onClick={() => handleRemove(index)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


