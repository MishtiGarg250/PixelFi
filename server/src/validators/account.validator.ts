import {z} from "zod";
export const createAccountSchema = z.object({
    name: z
    .string()
    .min(2)
    .max(100),

    brokerName: z.string()
    .min(2)
    .max(100),

    accountType:
    z.enum(["BROKERAGE", "BANK", "CRYPTO"]),

    currency: z
    .string()
    .min(3)
    .max(5),
    
    portfolioId: z.string().optional()
})