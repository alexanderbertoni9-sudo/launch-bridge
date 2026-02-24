import type { LeanCanvas, Venture } from "@prisma/client";

type TemplateInput = {
  venture: Venture;
  canvas: LeanCanvas;
};

export function generateFeedbackTemplate({ venture, canvas }: TemplateInput): string {
  const sections = [
    `Venture: ${venture.title}`,
    `Idea Summary: ${venture.idea}`,
    `Problem Clarity: ${canvas.problem ? "Defined" : "Missing"}`,
    `Customer Segments: ${canvas.customerSegments ? "Defined" : "Missing"}`,
    `Value Proposition: ${canvas.uniqueValueProposition ? "Defined" : "Missing"}`,
    `Suggested Next Step: ${suggestNextStep(canvas)}`,
  ];

  return sections.join("\n");
}

function suggestNextStep(canvas: LeanCanvas): string {
  if (!canvas.problem || !canvas.customerSegments) {
    return "Clarify the target customer and top problem before iterating the rest of the canvas.";
  }

  if (!canvas.uniqueValueProposition || !canvas.solution) {
    return "Strengthen the value proposition and map it directly to your proposed solution.";
  }

  if (!canvas.channels || !canvas.keyMetrics) {
    return "Define acquisition channels and measurable success metrics for the next experiment.";
  }

  return "Run a customer interview experiment and record evidence for problem-solution fit.";
}
