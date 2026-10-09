import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@visionguard.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        const detail = caughtError.response?.data?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(" ")
          : detail;

        setError(
          message ??
            `Login request failed${caughtError.response?.status ? ` (${caughtError.response.status})` : ""}.`,
        );
        return;
      }

      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 px-4 text-slate-100">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-surface-850 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-500 text-surface-950">
            <ShieldCheck aria-hidden="true" size={25} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">VisionGuard AI</h1>
            <p className="text-sm text-slate-400">Secure operator login</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              required
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in" : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
