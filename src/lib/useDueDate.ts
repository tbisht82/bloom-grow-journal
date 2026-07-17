import { DUE_DATE } from "@/lib/months";
import { useLocalState } from "@/lib/useLocalState";

const KEY = "journal.dueDate";
const DEFAULT_ISO = DUE_DATE.toISOString().slice(0, 10);

export function useDueDate() {
  const [iso, setIso, hydrated] = useLocalState<string>(KEY, DEFAULT_ISO);
  const date = new Date(`${iso}T00:00:00`);
  return { date, iso, setIso, hydrated, defaultIso: DEFAULT_ISO };
}
