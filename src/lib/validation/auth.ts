import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  expectedRole: z.enum(["STUDENT", "ADMIN"]).optional(),
});

export const signupSchema = credentialsSchema
  .omit({ expectedRole: true })
  .extend({
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });
