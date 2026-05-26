
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
    fees?: number;
    currency: string;
    executedAt: string;
}

export const createTransactionService = async(clerkUserId: string,
    data: createTransactionInput
)=>{

    // find new user
    const user = await prisma.user.findUnique({
        where:{
            clerkUserId
        },
    });
    if(!user){
        throw new Error("User not found");
    }

    // verify account ownership
    const account = await prisma.account.findFirst({
        where:{
            id: data.accountId,
            userId: user.id
        }
    })
    if(!account){
        throw new Error("Account not found or not owned by user");
    };

    // verify asset exists
    const asset = await prisma.asset.findUnique({
        where:{
            id: data.assetId,
        },
    });

    if(!asset){
        throw new Error("Asset not found");
    }

    // create transaction
    const transaction = await prisma.transaction.create({
        data:{
            accountId: data.accountId,
            assetId: data.assetId,
            type: data.type,
            quantity: data.quantity,
            price: data.price,
            fees: data.fees || 0,
            currency: data.currency,
            executedAt: new Date(data.executedAt),
        },
        include:{
            asset: true,
            account: true,
        },
    });

    return transaction;
}


export const getUserTransactionService = async(clerkUserId: string)=>{
    const user = await prisma.user.findUnique({
        where:{
            clerkUserId
        },
    });

    if(!user){
        throw new Error("User not found");
    }
    const transactions = await prisma.transaction.findMany({
        where:{
            account:{
                userId: user.id
            },
        },
        include:{
            asset: true,
            account: true,
        },
        orderBy:{
            executedAt: "desc"
        },
    });
    return transactions;
}