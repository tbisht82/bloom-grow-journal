import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { SignInModal } from "@/components/SignInModal";

export function AdminAuth() {
  const { loading, email, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50"
            >
              ·
            </motion.span>
          ) : email ? (
            <motion.div
              key="signed-in"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-3 rounded-full border border-border/40 bg-card/80 px-3 py-1.5 text-xs backdrop-blur-sm"
            >
              <span className={isAdmin ? "text-primary" : "text-muted-foreground"}>
                {isAdmin ? "Admin" : "Signed in"}
              </span>
              <span className="max-w-[140px] truncate text-muted-foreground" title={email}>
                {email}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-muted-foreground transition hover:text-foreground"
              >
                Switch
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="signed-out"
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-full border border-border/40 bg-card/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm transition hover:text-foreground"
            >
              Admin
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <SignInModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
