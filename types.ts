export interface BudgetRecord {
  district: string;
  year: number;
  category: string;
  pia: number;
  pim: number;
  devengado: number; // Spent
  avance_pct: number;
  latitude: number;
  longitude: number;
}

export interface AggregatedDistrictData {
  district: string;
  latitude: number;
  longitude: number;
  total_pim: number; // Presupuesto Institucional Modificado (Allocated)
  total_devengado: number; // Spent
  execution_pct: number; // Total execution %
  categories: Record<string, {
    pim: number;
    devengado: number;
    pct: number;
  }>;
}

export interface GeminiAnalysisResult {
  is_relevant: boolean; // True if it's a civic/infra issue, False if it's a selfie/cat/etc
  relevance_reason?: string; // Why it was rejected
  problem_type: "road_damage" | "lighting" | "trash" | "water" | "parks" | "building" | "other" | "none";
  severity: number; // 1-5
  description: string;
  estimated_repair_cost_soles: number;
  safety_hazard: boolean;
}

export interface CitizenReport {
  id: string;
  trackingId: string;
  district: string;
  type: string; // Legacy/Display type, but we prefer using analysis.problem_type
  hoursAgo: number; // For localized time display
  status: 'pending' | 'verified';
  icon: string;
  desc: string; // Legacy/Display desc, but we prefer generating it
  user_note?: string; // Unstructured input from user
  lat?: number;
  lng?: number;
  timestamp: Date;
  imageUrl: string;
  analysis: GeminiAnalysisResult;
  location: { lat: number; lng: number };
}

export const CATEGORY_MAPPING: Record<string, string> = {
  'road_damage': 'TRANSPORTE',
  'lighting': 'ORDEN PUBLICO Y SEGURIDAD',
  'trash': 'AMBIENTE',
  'water': 'SANEAMIENTO',
  'parks': 'CULTURA Y DEPORTE', // Or AMBIENTE depending on nuance
  'building': 'VIVIENDA Y DESARROLLO URBANO',
  'other': 'PLANEAMIENTO, GESTION Y RESERVA DE CONTINGENCIA',
  'none': 'OTROS'
};