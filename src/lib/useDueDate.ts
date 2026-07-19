import { useSyncExternalStore } from "react";
import { DUE_DATE } from "@/lib/months";

const KEY = "journal.dueDate";
const DEFAULT_ISO = DUE_DATE.toISOString().slice(0, 10);

type Store = { iso: string; hydrated: boolean };

const SERVER_SNAPSHOT: Store = { iso: DEFAULT_ISO, hydrated: false };

let store: Store = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  let iso = DEFAULT_ISO;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string") iso = parsed;
    }
  } catch {
    /* ignore */
  }
  store = { iso, hydrated: true };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const l of listeners) l();
}

export function useDueDate() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => store,
    () => SERVER_SNAPSHOT,
  );

  const date = new Date(`${snapshot.iso}T00:00:00`);

  const setIso = (next: string) => {
    if (next === store.iso) return;
    store = { iso: next, hydrated: store.hydrated };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    emit();
  };

  return {
    date,
    iso: snapshot.iso,
    setIso,
    hydrated: snapshot.hydrated,
    defaultIso: DEFAULT_ISO,
  };
}
