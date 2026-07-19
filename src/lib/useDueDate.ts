import { useSyncExternalStore } from "react";
import { DUE_DATE } from "@/lib/months";
import { supabase } from "@/lib/supabase";

const KEY = "due_date";
const DEFAULT_ISO = DUE_DATE.toISOString().slice(0, 10);

type Store = { iso: string; hydrated: boolean };

const SERVER_SNAPSHOT: Store = { iso: DEFAULT_ISO, hydrated: false };

let store: Store = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setStore(next: Store) {
  store = next;
  emit();
}

let booted = false;
async function boot() {
  if (booted) return;
  booted = true;
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();
  const iso = data?.value ?? DEFAULT_ISO;
  setStore({ iso, hydrated: true });
}

if (typeof window !== "undefined") {
  void boot();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDueDate() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => store,
    () => SERVER_SNAPSHOT,
  );

  const date = new Date(`${snapshot.iso}T00:00:00`);

  const setIso = async (next: string) => {
    if (next === store.iso) return;
    setStore({ iso: next, hydrated: store.hydrated });
    await supabase
      .from("app_settings")
      .upsert({ key: KEY, value: next, updated_at: new Date().toISOString() })
      .eq("key", KEY);
  };

  return {
    date,
    iso: snapshot.iso,
    setIso,
    hydrated: snapshot.hydrated,
    defaultIso: DEFAULT_ISO,
  };
}
