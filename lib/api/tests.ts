/**
 * 1. Setup - Get authenticated first
 */
async function setup() {
  console.log("🚀 Starting API Tests...");
  console.log("Make sure you are logged in via Supabase Auth!");
}

/**
 * 2. Test: Create a new workflow
 */
async function testCreateWorkflow() {
  console.log("\n📝 Test: Create Workflow");

  try {
    const response = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Workflow - " + new Date().toISOString(),
        description: "Created via API test",
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Workflow created:", result.data);
      return result.data.id; // Return workflow ID for next test
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 3. Test: Get all workflows
 */
async function testGetAllWorkflows() {
  console.log("\n📋 Test: Get All Workflows");

  try {
    const response = await fetch("/api/workflows");
    const result = await response.json();

    if (result.success) {
      console.log(`✅ Found ${result.data.length} workflows`);
      console.table(result.data);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 4. Test: Get single workflow
 */
async function testGetWorkflow(workflowId: string) {
  console.log("\n🔍 Test: Get Workflow by ID");

  try {
    const response = await fetch(`/api/workflows/${workflowId}`);
    const result = await response.json();

    if (result.success) {
      console.log("✅ Workflow loaded:", result.data);
      console.log(`   Nodes: ${result.data.nodes.length}`);
      console.log(`   Edges: ${result.data.edges.length}`);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 5. Test: Update workflow
 */
async function testUpdateWorkflow(workflowId: string) {
  console.log("\n✏️ Test: Update Workflow");

  try {
    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Workflow - " + new Date().toISOString(),
        description: "Updated via API test",
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Workflow updated:", result.data);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 6. Test: Save workflow graph
 */
async function testSaveWorkflowGraph(workflowId: string) {
  console.log("\n💾 Test: Save Workflow Graph");

  const sampleNodes = [
    {
      id: "node-1",
      type: "start",
      position: { x: 100, y: 100 },
      data: { label: "Start", type: "start" },
    },
    {
      id: "node-2",
      type: "action",
      position: { x: 300, y: 100 },
      data: { label: "Send Email", type: "action", action: "send_email" },
    },
    {
      id: "node-3",
      type: "end",
      position: { x: 500, y: 100 },
      data: { label: "End", type: "end" },
    },
  ];

  const sampleEdges = [
    { id: "edge-1", source: "node-1", target: "node-2" },
    { id: "edge-2", source: "node-2", target: "node-3" },
  ];

  try {
    const response = await fetch(`/api/workflows/${workflowId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: sampleNodes,
        edges: sampleEdges,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Workflow saved:", result.data);
      console.log(`   ${result.data.nodesCount} nodes`);
      console.log(`   ${result.data.edgesCount} edges`);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 7. Test: Create version
 */
async function testCreateVersion(workflowId: string) {
  console.log("\n📦 Test: Create Version");

  const snapshot = {
    nodes: [
      {
        id: "node-1",
        type: "start",
        position: { x: 100, y: 100 },
        data: { label: "Start" },
      },
    ],
    edges: [],
  };

  try {
    const response = await fetch(`/api/workflows/${workflowId}/version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Version created:", result.data);
      console.log(`   Version number: ${result.data.version_number}`);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 8. Test: Get all versions
 */
async function testGetVersions(workflowId: string) {
  console.log("\n📚 Test: Get All Versions");

  try {
    const response = await fetch(`/api/workflows/${workflowId}/versions`);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ Found ${result.data.length} versions`);
      console.table(
        result.data.map((v: any) => ({
          version: v.version_number,
          created_at: v.created_at,
          nodes: v.snapshot.nodes.length,
          edges: v.snapshot.edges.length,
        }))
      );
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * 9. Test: Delete workflow
 */
async function testDeleteWorkflow(workflowId: string) {
  console.log("\n🗑️ Test: Delete Workflow");

  const confirm = window.confirm(
    "Are you sure you want to delete this workflow?"
  );

  if (!confirm) {
    console.log("⏭️ Skipped");
    return;
  }

  try {
    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Workflow deleted");
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

/**
 * Run all tests sequentially
 */
export async function runAllTests() {
  await setup();

  // Create a workflow
  const workflowId = await testCreateWorkflow();

  if (!workflowId) {
    console.error("❌ Cannot continue - workflow creation failed");
    return;
  }

  // Wait a bit between tests
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  await wait(500);
  await testGetAllWorkflows();

  await wait(500);
  await testGetWorkflow(workflowId);

  await wait(500);
  await testUpdateWorkflow(workflowId);

  await wait(500);
  await testSaveWorkflowGraph(workflowId);

  await wait(500);
  await testCreateVersion(workflowId);

  await wait(500);
  await testGetVersions(workflowId);

  console.log("\n✅ All tests complete!");
  console.log(`📝 Test Workflow ID: ${workflowId}`);
}

// Export individual test functions
export {
  testCreateWorkflow,
  testGetAllWorkflows,
  testGetWorkflow,
  testUpdateWorkflow,
  testSaveWorkflowGraph,
  testCreateVersion,
  testGetVersions,
  testDeleteWorkflow,
};
