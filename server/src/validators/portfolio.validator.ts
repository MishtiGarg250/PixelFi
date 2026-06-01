import {z} from "zod";
export const createPortfolioSchema = z.object({
    name: z
        .string()
        .min(3)
        .max(50),

    description: z.string()
        .max(200)
        .optional(),
})

export const updatePortfolioSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(200).nullable().optional(),
});