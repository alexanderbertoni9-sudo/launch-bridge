import { describe, expect, it } from "vitest";

import { generateFeedbackTemplate } from "@/lib/feedback/template";

describe("generateFeedbackTemplate", () => {
  const venture = {
    id: "v1",
    ownerUserId: "u1",
    title: "Campus Shuttle",
    idea: "On-demand shuttle scheduling for students.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("returns missing guidance when core fields are empty", () => {
    const result = generateFeedbackTemplate({
      venture: venture as never,
      canvas: {
        id: "c1",
        ventureId: "v1",
        problem: "",
        customerSegments: "",
        uniqueValueProposition: "",
        solution: "",
        channels: "",
        revenueStreams: "",
        costStructure: "",
        keyMetrics: "",
        unfairAdvantage: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never,
    });

    expect(result).toContain("Problem Clarity: Missing");
    expect(result).toContain("Suggested Next Step: Clarify the target customer");
  });

  it("returns later-stage suggestion when most fields are filled", () => {
    const result = generateFeedbackTemplate({
      venture: venture as never,
      canvas: {
        id: "c1",
        ventureId: "v1",
        problem: "Commute unpredictability",
        customerSegments: "Students without cars",
        uniqueValueProposition: "Reliable campus transit",
        solution: "Shared shuttle with booking app",
        channels: "Campus groups",
        revenueStreams: "Subscription",
        costStructure: "Vehicle leases",
        keyMetrics: "Active riders",
        unfairAdvantage: "University partnership",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never,
    });

    expect(result).toContain("Suggested Next Step: Run a customer interview experiment");
  });
});
