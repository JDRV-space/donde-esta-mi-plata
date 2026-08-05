import { CitizenReport, RelevantProblemType } from './types';
import { DISTRICT_COORDS } from './utils/dataProcessing';

const SAMPLE_PROBLEMS: Array<{
  label: string;
  icon: string;
  problemType: RelevantProblemType;
}> = [
  { label: 'HUECO EN PISTA', icon: 'fa-road', problemType: 'road_damage' },
  { label: 'BASURA ACUMULADA', icon: 'fa-trash', problemType: 'trash' },
  { label: 'SIN ALUMBRADO', icon: 'fa-lightbulb', problemType: 'lighting' },
  { label: 'TUBERIA ROTA', icon: 'fa-water', problemType: 'water' },
  { label: 'PARQUE DESCUIDADO', icon: 'fa-tree', problemType: 'parks' },
];

// Deterministic interface examples only. These records are not user submissions,
// municipality records, status updates, recent activity, or evidence of repairs.
export const SAMPLE_REPORTS: CitizenReport[] = Object.entries(DISTRICT_COORDS).map(
  ([district, coordinates], index) => {
    const problem = SAMPLE_PROBLEMS[index % SAMPLE_PROBLEMS.length];
    const id = String(index + 1);

    return {
      id,
      trackingId: `SAMPLE-${id.padStart(3, '0')}`,
      district,
      type: problem.label,
      icon: problem.icon,
      desc: `Ejemplo de interfaz para ${problem.label.toLowerCase()} en ${district}.`,
      lat: coordinates.lat,
      lng: coordinates.lng,
      imageUrl: '',
      analysis: {
        is_relevant: true,
        problem_type: problem.problemType,
        severity: 1,
        description: 'Ejemplo de interfaz. No corresponde a un reporte real.',
        estimated_repair_cost_soles: 0,
        safety_hazard: false,
      },
      location: coordinates,
    };
  },
);
