import { beforeEach, describe, expect, it, vi } from "vitest";

import { PermissionDeniedError } from "@/lib/rbac/errors";

const state = {
  ventures: [] as Array<{
    id: string;
    ownerUserId: string;
    title: string;
    idea: string;
    createdAt: Date;
    updatedAt: Date;
  }>,
  canvasByVentureId: new Map<
    string,
    {
      id: string;
      ventureId: string;
      problem: string;
      customerSegments: string;
      uniqueValueProposition: string;
      solution: string;
      channels: string;
      revenueStreams: string;
      costStructure: string;
      keyMetrics: string;
      unfairAdvantage: string;
      createdAt: Date;
      updatedAt: Date;
    }
  >(),
  feedback: [] as Array<{
    id: string;
    ventureId: string;
    requestedByUserId: string;
    source: "SYSTEM_TEMPLATE";
    content: string;
    createdAt: Date;
  }>,
};

const prismaMock = {
  venture: {
    create: vi.fn(async ({ data }: any) => {
      const now = new Date();
      const id = `v_${state.ventures.length + 1}`;
      const venture = {
        id,
        ownerUserId: data.ownerUserId,
        title: data.title,
        idea: data.idea,
        createdAt: now,
        updatedAt: now,
      };
      state.ventures.push(venture);

      state.canvasByVentureId.set(id, {
        id: `c_${state.canvasByVentureId.size + 1}`,
        ventureId: id,
        problem: "",
        customerSegments: "",
        uniqueValueProposition: "",
        solution: "",
        channels: "",
        revenueStreams: "",
        costStructure: "",
        keyMetrics: "",
        unfairAdvantage: "",
        createdAt: now,
        updatedAt: now,
      });

      return venture;
    }),
    findUnique: vi.fn(async ({ where, select, include }: any) => {
      const venture = state.ventures.find((item) => item.id === where.id);
      if (!venture) {
        return null;
      }

      if (select?.ownerUserId) {
        return { ownerUserId: venture.ownerUserId };
      }

      if (include?.leanCanvas || include?.feedbackEntries) {
        return {
          ...venture,
          leanCanvas: state.canvasByVentureId.get(venture.id) ?? null,
          feedbackEntries: state.feedback.filter((entry) => entry.ventureId === venture.id),
        };
      }

      return venture;
    }),
    findMany: vi.fn(async ({ where }: any) => {
      if (!where) {
        return state.ventures;
      }
      return state.ventures.filter((item) => item.ownerUserId === where.ownerUserId);
    }),
  },
  leanCanvas: {
    upsert: vi.fn(async ({ where, update, create }: any) => {
      const existing = state.canvasByVentureId.get(where.ventureId);
      if (existing) {
        const next = { ...existing, ...update, updatedAt: new Date() };
        state.canvasByVentureId.set(where.ventureId, next);
        return next;
      }
      state.canvasByVentureId.set(where.ventureId, create);
      return create;
    }),
  },
  feedbackEntry: {
    create: vi.fn(async ({ data }: any) => {
      const entry = {
        id: `f_${state.feedback.length + 1}`,
        ventureId: data.ventureId,
        requestedByUserId: data.requestedByUserId,
        source: data.source,
        content: data.content,
        createdAt: new Date(),
      };
      state.feedback.unshift(entry);
      return entry;
    }),
    findMany: vi.fn(async ({ where }: any) =>
      state.feedback.filter((entry) => entry.ventureId === where.ventureId),
    ),
  },
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createVenture,
  getFeedbackHistoryForStudent,
  requestFeedbackForStudent,
  updateCanvasForStudent,
} from "@/lib/services/venture";

beforeEach(() => {
  state.ventures.length = 0;
  state.feedback.length = 0;
  state.canvasByVentureId.clear();
});

describe("venture service integration flow", () => {
  it("creates venture, updates canvas, requests and retrieves feedback", async () => {
    const venture = await createVenture("student-1", "LaunchBoard", "A venture coaching app.");

    await updateCanvasForStudent(venture.id, "student-1", {
      problem: "Founders lack structured iteration.",
      customerSegments: "Student founders",
      uniqueValueProposition: "Fast mentor-grade feedback",
      solution: "Structured workflow",
      channels: "Campus incubators",
      revenueStreams: "Monthly subscription",
      costStructure: "Hosting + support",
      keyMetrics: "Weekly active teams",
      unfairAdvantage: "Partner network",
    });

    await requestFeedbackForStudent(venture.id, "student-1");
    const history = await getFeedbackHistoryForStudent(venture.id, "student-1");

    expect(history).toHaveLength(1);
    expect(history[0].content).toContain("Venture: LaunchBoard");
  });

  it("throws permission error for non-owner student", async () => {
    const venture = await createVenture("student-1", "Orbit", "Test idea for ownership checks.");

    await expect(
      updateCanvasForStudent(venture.id, "student-2", {
        problem: "p",
        customerSegments: "c",
        uniqueValueProposition: "u",
        solution: "s",
        channels: "ch",
        revenueStreams: "r",
        costStructure: "co",
        keyMetrics: "k",
        unfairAdvantage: "ua",
      }),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });
});
