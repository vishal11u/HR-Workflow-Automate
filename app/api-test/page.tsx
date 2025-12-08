"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function APITestPage() {
  const { user, loading } = useAuth();
  
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: any = {};

    // Test 1: Auth Debug
    try {
      const res = await fetch("/api/auth/debug");
      results.authDebug = await res.json();
    } catch (err: any) {
      results.authDebug = { error: err.message };
    }

    // Test 2: GET Workflows
    try {
      const res = await fetch("/api/workflows");
      const data = await res.json();
      results.getWorkflows = {
        status: res.status,
        statusText: res.statusText,
        data,
      };
    } catch (err: any) {
      results.getWorkflows = { error: err.message };
    }

    // Test 3: POST Workflow
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Workflow - " + new Date().toISOString(),
          description: "Created from API test page",
        }),
      });
      const data = await res.json();
      results.postWorkflow = {
        status: res.status,
        statusText: res.statusText,
        data,
      };
    } catch (err: any) {
      results.postWorkflow = { error: err.message };
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    if (!loading && user) {
      runTests();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">
            ❌ Not Authenticated
          </div>
          <p className="text-zinc-600">Please sign in to test the API</p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Test Page</h1>
          <p className="text-zinc-600">Testing workflows API endpoints</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-zinc-200">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">✓</span> Authenticated User
          </h2>
          <div className="text-sm text-zinc-600">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User ID:</strong>{" "}
              <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
                {user.id}
              </code>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={testing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {testing ? "Running Tests..." : "🔄 Run All Tests"}
          </button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {/* Auth Debug */}
            <TestResult
              title="1️⃣ Auth Debug (GET /api/auth/debug)"
              result={testResults.authDebug}
              successCheck={(r) => r.debug?.hasUser === true}
            />

            {/* GET Workflows */}
            <TestResult
              title="2️⃣ Get Workflows (GET /api/workflows)"
              result={testResults.getWorkflows}
              successCheck={(r) => r.status === 200 && r.data?.success === true}
            />

            {/* POST Workflow */}
            <TestResult
              title="3️⃣ Create Workflow (POST /api/workflows)"
              result={testResults.postWorkflow}
              successCheck={(r) => r.status === 201 && r.data?.success === true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TestResult({
  title,
  result,
  successCheck,
}: {
  title: string;
  result: any;
  successCheck: (r: any) => boolean;
}) {
  const isSuccess = successCheck(result);
  const statusCode = result?.status;

  return (
    <div className="bg-white rounded-lg p-6 border border-zinc-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        {statusCode && (
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              statusCode >= 200 && statusCode < 300
                ? "bg-green-100 text-green-700"
                : statusCode >= 400 && statusCode < 500
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {statusCode} {result.statusText}
          </span>
        )}
      </div>

      <div className="mb-3">
        {isSuccess ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <span className="text-xl">✅</span> Success
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <span className="text-xl">❌</span> Failed
          </div>
        )}
      </div>

      <details className="cursor-pointer">
        <summary className="text-sm text-blue-600 hover:underline mb-2">
          View Response Details
        </summary>
        <pre className="text-xs bg-zinc-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>

      {!isSuccess && result?.data?.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-900 mb-1">
            Error Message:
          </div>
          <div className="text-sm text-red-700">{result.data.error}</div>

          {result.data.error === "User not found in organization" && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-900 mb-1">
                💡 Solution:
              </div>
              <div className="text-sm text-blue-700">
                You need to add your user to the database. Check the file:
                <code className="block mt-1 bg-white px-2 py-1 rounded">
                  add-user-to-database.sql
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
