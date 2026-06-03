import { z } from "zod";

export const createLiabilitySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["MORTGAGE", "CAR_LOAN", "PERSONAL_LOAN", "CREDIT_CARD", "OTHER"]),
  originalAmount: z.number().positive(),
  outstanding: z.number().min(0),
  interestRate: z.number().min(0).max(100).optional(),
  currency: z.string().min(3).max(5),
});

export const updateLiabilitySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(["MORTGAGE", "CAR_LOAN", "PERSONAL_LOAN", "CREDIT_CARD", "OTHER"]).optional(),
  originalAmount: z.number().positive().optional(),
  outstanding: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).nullable().optional(),
  currency: z.string().min(3).max(5).optional(),
});
