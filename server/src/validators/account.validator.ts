import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(2).max(100),
  brokerName: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  accountType: z.enum(["BROKERAGE", "BANK", "CRYPTO"]),
  currency: z.string().min(3).max(5),
  currentBalance: z.number().nonnegative().optional(),
  emergencyFund: z.number().nonnegative().optional(),
});