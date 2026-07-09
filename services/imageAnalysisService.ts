import { GoogleGenAI, Type } from "@google/genai";
import type { ImageAnalysisResult, ProblemType, RelevantProblemType } from "../types";

const VALID_PROBLEM_TYPES = new Set<ProblemType>([
  "road_damage",
  "lighting",
  "trash",
  "water",
  "parks",
  "building",
  "other",
  "none",
]);

const RELEVANT_PROBLEM_TYPES = new Set<RelevantProblemType>([
  "road_damage",
  "lighting",
  "trash",
  "water",
  "parks",
  "building",
  "other",
]);

class ImageAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageAnalysisError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getImageAnalysisApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new ImageAnalysisError("Image-analysis API key is not configured.");
  }

  return apiKey;
};

const parseImageAnalysisResult = (rawText: string): ImageAnalysisResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new ImageAnalysisError("Image-analysis provider returned invalid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new ImageAnalysisError("Image-analysis provider returned a non-object response.");
  }

  if (typeof parsed.is_relevant !== "boolean") {
    throw new ImageAnalysisError("Image-analysis response is missing is_relevant.");
  }

  const problemType = parsed.problem_type;
  if (typeof problemType !== "string" || !VALID_PROBLEM_TYPES.has(problemType as ProblemType)) {
    throw new ImageAnalysisError("Image-analysis response has an invalid problem_type.");
  }

  if (!parsed.is_relevant) {
    return {
      is_relevant: false,
      relevance_reason: typeof parsed.relevance_reason === "string" ? parsed.relevance_reason : undefined,
      problem_type: "none",
      severity: 0,
      description: "",
      estimated_repair_cost_soles: 0,
      safety_hazard: false,
    };
  }

  if (!RELEVANT_PROBLEM_TYPES.has(problemType as RelevantProblemType)) {
    throw new ImageAnalysisError("Image-analysis response marked the image relevant without a reportable problem_type.");
  }

  if (
    typeof parsed.severity !== "number" ||
    !Number.isInteger(parsed.severity) ||
    parsed.severity < 1 ||
    parsed.severity > 5
  ) {
    throw new ImageAnalysisError("Image-analysis response has an invalid severity.");
  }

  if (typeof parsed.description !== "string" || parsed.description.trim() === "") {
    throw new ImageAnalysisError("Image-analysis response is missing a description.");
  }

  if (
    typeof parsed.estimated_repair_cost_soles !== "number" ||
    !Number.isFinite(parsed.estimated_repair_cost_soles) ||
    parsed.estimated_repair_cost_soles < 0
  ) {
    throw new ImageAnalysisError("Image-analysis response has an invalid repair-cost estimate.");
  }

  if (typeof parsed.safety_hazard !== "boolean") {
    throw new ImageAnalysisError("Image-analysis response is missing safety_hazard.");
  }

  return {
    is_relevant: true,
    problem_type: problemType as RelevantProblemType,
    severity: parsed.severity,
    description: parsed.description,
    estimated_repair_cost_soles: parsed.estimated_repair_cost_soles,
    safety_hazard: parsed.safety_hazard,
  };
};

export const analyzeImage = async (base64Image: string, language: string = 'es'): Promise<ImageAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: getImageAnalysisApiKey() });

  // Map language code to human readable language name for the prompt
  const langName = language === 'qu' ? 'Quechua' : (language === 'en' ? 'English' : 'Spanish');

  const prompt = `
  Actúa como un experto en infraestructura pública y presupuesto municipal de Lima, Perú.
  Analiza la imagen proporcionada.

  PASO 1: RELEVANCIA
  Determina si la imagen muestra un problema de infraestructura pública, servicios ciudadanos, limpieza pública o seguridad (ej. huecos, basura, postes caídos, veredas rotas, parques sucios).
  Si la imagen es una selfie, una mascota, un interior de casa privada, o no tiene relación con gestión municipal, marca "is_relevant" como false.

  PASO 2: CATEGORIZACIÓN (Solo si es relevante)
  Clasifica el problema en una de las categorías definidas.
  Estima la severidad del 1 al 5.
  Estima el costo de reparación en Soles (PEN) basado en precios de mercado peruanos.

  Guía de clasificación (problem_type):
  - road_damage: huecos, pistas en mal estado, baches
  - lighting: alumbrado público deficiente
  - trash: basura acumulada, desmonte
  - water: aniegos, rotura de tuberías matrices
  - parks: áreas verdes descuidadas
  - building: infraestructura pública dañada (puentes, muros)
  - other: otros temas municipales

  Genera una descripción técnica corta en el idioma: ${langName}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_relevant: {
              type: Type.BOOLEAN,
              description: "True only if image shows public infrastructure issues or civic problems.",
            },
            relevance_reason: {
              type: Type.STRING,
              description: `If not relevant, explain why in ${langName} (e.g. 'This is a photo of a cat').`,
            },
            problem_type: {
              type: Type.STRING,
              enum: ["road_damage", "lighting", "trash", "water", "parks", "building", "other", "none"],
            },
            severity: {
              type: Type.INTEGER,
              description: "Severity from 1 to 5",
            },
            description: {
              type: Type.STRING,
              description: `A short technical description in ${langName}, max 30 words`,
            },
            estimated_repair_cost_soles: {
              type: Type.NUMBER,
            },
            safety_hazard: {
              type: Type.BOOLEAN,
            },
          },
          required: ["is_relevant", "problem_type", "severity", "description", "estimated_repair_cost_soles", "safety_hazard"],
        },
      },
    });

    if (response.text) {
      return parseImageAnalysisResult(response.text);
    }

    throw new Error("Empty response from image-analysis provider");
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error instanceof ImageAnalysisError
      ? error
      : new ImageAnalysisError("Image analysis failed.");
  }
};
