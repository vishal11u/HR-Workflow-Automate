"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function AuthDebug() {
  const { user, loading } = useAuth();
  
  const [cookies, setCookies] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    setCookies(document.cookie);

    // Test API endpoint
    fetch("/api/auth/debug")
      .then((res) => res.json())
      .then(setApiResponse);
  }, [user]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Info</h1>

      <div className="space-y-6">
        {/* User Info */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Client-Side User Info:</h2>
          {user ? (
            <pre className="text-sm bg-zinc-100 p-3 rounded overflow-auto">
              {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No user logged in</p>
          )}
        </div>

        {/* Cookies */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Browser Cookies:</h2>
          <pre className="text-sm bg-zinc-100 p-3 rounded overflow-auto whitespace-pre-wrap break-all">
            {cookies || "No cookies found"}
          </pre>
        </div>

        {/* API Response */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">
            API Auth Check (/api/auth/debug):
          </h2>
          {apiResponse ? (
            <pre className="text-sm bg-zinc-100 p-3 rounded overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          ) : (
            <p className="text-zinc-500">Loading...</p>
          )}
        </div>

        {/* Actions */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-2">Test API Calls:</h2>
          <button
            onClick={() => {
              fetch("/api/workflows")
                .then((res) => res.json())
                .then((data) => alert(JSON.stringify(data, null, 2)))
                .catch((err) => alert("Error: " + err.message));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test GET /api/workflows
          </button>
        </div>
      </div>
    </div>
  );
}
