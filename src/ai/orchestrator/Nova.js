import { extractTextFromPDF } from "../services/pdfService";
import { generateSummary } from "../agents/SummaryAgent";

export async function analyzeLecturePDF(file) {
  if (!file) {
    throw new Error("No PDF file was provided.");
  }

  const pdfText = await extractTextFromPDF(file);

  if (!pdfText.trim()) {
    throw new Error("No readable text was found in the PDF.");
  }

  const summary = await generateSummary(pdfText);

  return {
    pdfText,
    summary,
  };
}