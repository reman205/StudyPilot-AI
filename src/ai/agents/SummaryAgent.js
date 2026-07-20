import { generateAIResponse } from "../services/aiService";
import { SYSTEM_PROMPTS, buildPrompt } from "../services/promptTemplates";

export async function generateSummary(pdfText) {
  if (!pdfText || pdfText.trim().length === 0) {
    throw new Error("No PDF text was provided.");
  }

  return await generateAIResponse({
    systemPrompt: SYSTEM_PROMPTS.summary,
    userPrompt: buildPrompt(
      "Create a complete study summary for this lecture.",
      pdfText
    ),
    temperature: 0.3,
    maxTokens: 2000,
  });
}