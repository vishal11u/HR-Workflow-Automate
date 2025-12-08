"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  RiLockLine,
  RiMailLine,
  RiEyeLine,
  RiEyeCloseLine,
} from "react-icons/ri";
import { toast } from "sonner";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created! Please check your email to verify.");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900">
            HR Workflow Designer
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <RiMailLine className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-3 text-sm placeholder-zinc-400 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <RiLockLine className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-10 text-sm placeholder-zinc-400 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <RiEyeCloseLine className="h-5 w-5" />
                  ) : (
                    <RiEyeLine className="h-5 w-5" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-zinc-500">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-zinc-600 hover:text-emerald-600 transition"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span className="font-semibold">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span className="font-semibold">Sign up</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
