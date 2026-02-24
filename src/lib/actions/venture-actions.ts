"use server";

import { forbidden, notFound, redirect } from "next/navigation";

import { PermissionDeniedError, ResourceNotFoundError } from "@/lib/rbac/errors";
import { requireStudentSession } from "@/lib/rbac/guards";
import {
  createVenture,
  requestFeedbackForStudent,
  updateCanvasForStudent,
} from "@/lib/services/venture";
import { canvasSchema, createVentureSchema } from "@/lib/validation/venture";

export async function createVentureAction(formData: FormData) {
  const user = await requireStudentSession();

  const parsed = createVentureSchema.safeParse({
    title: formData.get("title"),
    idea: formData.get("idea"),
  });

  if (!parsed.success) {
    redirect("/student/ventures/new?error=invalid_input");
  }

  const venture = await createVenture(user.id, parsed.data.title, parsed.data.idea);

  redirect(`/student/ventures/${venture.id}/canvas`);
}

export async function updateCanvasAction(formData: FormData) {
  const user = await requireStudentSession();
  const ventureId = String(formData.get("ventureId") ?? "");

  const parsed = canvasSchema.safeParse({
    problem: formData.get("problem") ?? "",
    customerSegments: formData.get("customerSegments") ?? "",
    uniqueValueProposition: formData.get("uniqueValueProposition") ?? "",
    solution: formData.get("solution") ?? "",
    channels: formData.get("channels") ?? "",
    revenueStreams: formData.get("revenueStreams") ?? "",
    costStructure: formData.get("costStructure") ?? "",
    keyMetrics: formData.get("keyMetrics") ?? "",
    unfairAdvantage: formData.get("unfairAdvantage") ?? "",
  });

  if (!ventureId) {
    notFound();
  }

  if (!parsed.success) {
    redirect(`/student/ventures/${ventureId}/canvas?error=invalid_input`);
  }

  try {
    await updateCanvasForStudent(ventureId, user.id, parsed.data);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();
    }

    if (error instanceof PermissionDeniedError) {
      forbidden();
    }

    throw error;
  }

  redirect(`/student/ventures/${ventureId}/canvas?saved=1`);
}

export async function requestFeedbackAction(formData: FormData) {
  const user = await requireStudentSession();
  const ventureId = String(formData.get("ventureId") ?? "");

  if (!ventureId) {
    notFound();
  }

  try {
    await requestFeedbackForStudent(ventureId, user.id);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();
    }

    if (error instanceof PermissionDeniedError) {
      forbidden();
    }

    throw error;
  }

  redirect(`/student/ventures/${ventureId}/feedback?requested=1`);
}
