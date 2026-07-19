import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const ALLOWED_EMAILS = ["tbisht82@gmail.com", "soa4991@gmail.com"] as const;

type AuthState = {
  loading: boolean;
  session: Session | null;
  email: string | null;
  isAdmin: boolean;
};

const initialState: AuthState = {
  loading: true,
  session: null,
  email: null,
  isAdmin: false,
};

let state: AuthState = initialState;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function derive(session: Session | null): Partial<AuthState> {
  const email = session?.user?.email ?? null;
  const isAdmin =
    email !== null && (ALLOWED_EMAILS as readonly string[]).includes(email);
  return { session, email, isAdmin, loading: false };
}

supabase.auth.getSession().then(({ data }) => {
  state = { ...state, ...derive(data.session) };
  emit();
});

supabase.auth.onAuthStateChange((_event, session) => {
  state = { ...state, ...derive(session) };
  emit();
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return state;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
