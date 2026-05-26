import prisma from "../lib/prisma.js";

interface createTransactionInput {
    accountId: string;
    assetId: string;
    type:
        | "BUY"
        | "SELL"
        | "DEPOSIT"
        | "WITHDRAWAL"
        | "DIVIDEND"

    quantity: number;
    price: number;
    

}