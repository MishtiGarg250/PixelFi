import {z} from "zod";

export const createTransactionSchema = z.object({
    amount: z.number().positive(),
    description: z.string().max(255).optional(), 
});
