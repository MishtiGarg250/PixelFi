import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  marketAssetId: z.string().min(1).optional(),
  type: z.enum(["BUY", "SELL", "DIVIDEND", "DEPOSIT", "WITHDRAWAL", "INTEREST", "TRANSFER"]),
  quantity: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  amount: z.number().positive().optional(),
  fees: z.number().min(0).optional(),
  currency: z.string().min(3).max(5),
  executedAt: z.string().datetime(),
});
