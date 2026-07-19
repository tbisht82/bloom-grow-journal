import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader as Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ALLOWED_EMAILS } from "@/lib/auth";

export function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!(ALLOWED_EMAILS as readonly string[]).includes(trimmed)) {
      setBusy(false);
      setError("This email is not invited. Sign-in is restricted to invited admins.");
      return;
    }
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: trimmed, password })
        : await supabase.auth.signUp({ email: trimmed, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup" && data.user && !data.session) {
      setError("Account created. Check your email to confirm, then sign in.");
      setMode("signin");
      return;
    }
    if (data.session) {
      setEmail("");
      setPassword("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-petal)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-display text-2xl text-foreground">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Admin access
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-primary/90 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50"
              >
                {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="mt-4 w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
