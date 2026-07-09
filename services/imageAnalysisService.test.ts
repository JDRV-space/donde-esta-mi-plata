import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContentMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    return {
      models: {
        generateContent: generateContentMock,
      },
    };
  }),
  Type: {
    OBJECT: "object",
    BOOLEAN: "boolean",
    STRING: "string",
    INTEGER: "integer",
    NUMBER: "number",
  },
}));

import { analyzeImage } from "./imageAnalysisService";

const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);

describe("analyzeImage", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    process.env.GEMINI_API_KEY = "test-gemini-key";
    delete process.env.API_KEY;
  });

  afterAll(() => {
    consoleErrorMock.mockRestore();
  });

  it("rejects provider request failures instead of returning a fake report", async () => {
    generateContentMock.mockRejectedValue(new Error("network unavailable"));

    await expect(analyzeImage("base64-image", "en")).rejects.toThrow("Image analysis failed.");
  });

  it("rejects malformed relevant responses instead of guessing missing fields", async () => {
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        is_relevant: true,
        problem_type: "road_damage",
        severity: 3,
      }),
    });

    await expect(analyzeImage("base64-image", "en")).rejects.toThrow(
      "Image-analysis response is missing a description.",
    );
  });

  it("normalizes non-relevant responses so they cannot become report drafts", async () => {
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        is_relevant: false,
        relevance_reason: "Indoor photo.",
        problem_type: "road_damage",
      }),
    });

    await expect(analyzeImage("base64-image", "en")).resolves.toEqual({
      is_relevant: false,
      relevance_reason: "Indoor photo.",
      problem_type: "none",
      severity: 0,
      description: "",
      estimated_repair_cost_soles: 0,
      safety_hazard: false,
    });
  });
});
