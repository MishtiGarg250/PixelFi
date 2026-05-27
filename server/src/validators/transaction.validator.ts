import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  marketAssetId: z.string().min(1),
  type: z.enum(["BUY", "SELL", "DIVIDEND", "DEPOSIT", "WITHDRAWAL"]),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fees: z.number().min(0).optional(),
  currency: z.string().min(3).max(5),
  executedAt: z.string().datetime(),
});
