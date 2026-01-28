import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

export const analyzeImageWithGemini = async (base64Image: string, language: string = 'es'): Promise<GeminiAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      return JSON.parse(response.text) as GeminiAnalysisResult;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock
    return {
      is_relevant: true,
      problem_type: "road_damage",
      severity: 3,
      description: language === 'en' ? "Analysis failed (Simulated): Pothole detected." : "Análisis falló (Simulado): Hueco detectado en la vía.",
      estimated_repair_cost_soles: 500,
      safety_hazard: true
    };
  }
};