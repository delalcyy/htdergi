// Client-side localStorage draft yönetimi
// TODO: MySQL/Prisma hazır olunca → API servisi
export type DraftData = {
  id: string;
  templateId: string;
  personName: string | null;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
};

const KEY = "ht_kapak_taslaklar";

function loadAll(): Record<string, DraftData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, DraftData>) : {};
  } catch { return {}; }
}

function saveAll(data: Record<string, DraftData>): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* quota */ }
}

export function createDraft(templateId: string): DraftData {
  const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const draft: DraftData = { id, templateId, personName: null, subtitle: null, createdAt: now, updatedAt: now };
  const all = loadAll();
  all[id] = draft;
  saveAll(all);
  return draft;
}

export function getDraft(id: string): DraftData | null {
  return loadAll()[id] ?? null;
}

export function updateDraft(id: string, updates: Partial<Pick<DraftData, "personName" | "subtitle">>): void {
  const all = loadAll();
  if (!all[id]) return;
  all[id] = { ...all[id], ...updates, updatedAt: new Date().toISOString() };
  saveAll(all);
}
