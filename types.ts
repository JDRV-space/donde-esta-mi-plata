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

export type RelevantProblemType = "road_damage" | "lighting" | "trash" | "water" | "parks" | "building" | "other";
export type ProblemType = RelevantProblemType | "none";

export type ImageAnalysisResult =
  | {
      is_relevant: true;
      problem_type: RelevantProblemType;
      severity: number; // 1-5
      description: string;
      estimated_repair_cost_soles: number;
      safety_hazard: boolean;
    }
  | {
      is_relevant: false;
      relevance_reason?: string;
      problem_type: "none";
      severity: 0;
      description: "";
      estimated_repair_cost_soles: 0;
      safety_hazard: false;
    };

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
  analysis: ImageAnalysisResult;
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
