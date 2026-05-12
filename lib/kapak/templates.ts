// TODO: MySQL/Prisma hazır olunca getSablonlar() → API çağrısına dönüşür
export type KapakSablon = {
  id: string;
  name: string;
  previewUrl: string | null;
  orderIndex: number;
  isActive: boolean;
};

export const STATIK_SABLONLAR: KapakSablon[] = [
  { id: "sablon-klasik",   name: "Klasik",     previewUrl: null, orderIndex: 1, isActive: true },
  { id: "sablon-modern",   name: "Modern",     previewUrl: null, orderIndex: 2, isActive: true },
  { id: "sablon-minimal",  name: "Minimalist", previewUrl: null, orderIndex: 3, isActive: true },
  { id: "sablon-elegant",  name: "Elegant",    previewUrl: null, orderIndex: 4, isActive: true },
  { id: "sablon-bold",     name: "Bold",       previewUrl: null, orderIndex: 5, isActive: true },
];

export async function getSablonlar(): Promise<KapakSablon[]> {
  return STATIK_SABLONLAR.filter(s => s.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getSablonById(id: string): KapakSablon | undefined {
  return STATIK_SABLONLAR.find(s => s.id === id);
}
