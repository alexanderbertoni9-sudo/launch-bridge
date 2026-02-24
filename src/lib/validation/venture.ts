import { z } from "zod";

export const createVentureSchema = z.object({
  title: z.string().min(3).max(120),
  idea: z.string().min(10).max(5000),
});

export const canvasSchema = z.object({
  problem: z.string().max(3000),
  customerSegments: z.string().max(3000),
  uniqueValueProposition: z.string().max(3000),
  solution: z.string().max(3000),
  channels: z.string().max(3000),
  revenueStreams: z.string().max(3000),
  costStructure: z.string().max(3000),
  keyMetrics: z.string().max(3000),
  unfairAdvantage: z.string().max(3000),
});

export type CanvasInput = z.infer<typeof canvasSchema>;
