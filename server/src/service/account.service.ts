
import prisma from '../lib/prisma.js';

interface CreateAccountInput{
    name: string;
    brokerName: string;
    accountType:
    | "BROKERAGE"
    | "BANK"
    | "CRYPTO";

    currency: string;
    portfolioId?: string;
}

export const createAccountService = async(
    clerkUserId: string,
    data: CreateAccountInput
) => {
    const user = await prisma.user.findUnique({
        where:{
            clerkUserId
        },
    });

    if(!user){
        throw new Error("User not found");
    }


    const account = await prisma.account.create({
        data:{
            name: data.name,
            brokerName: data.brokerName,
            accountType: data.accountType,
            currency: data.currency,
            userId: user.id,
            portfolioId: data.portfolioId,
        }
    });

    return account;
}

export const getUserAccountsService = async(clerkUserId: string) => {
    const user = await prisma.user.findUnique({
        where:{
            clerkUserId
        },
    });

    if(!user){
        throw new Error("User not found");
    }

    const accounts = await prisma.account.findMany({
        where:{
            userId: user.id
        },
        include:{
            portfolio: true,
        },
        orderBy:{
            createdAt:"desc",
        }
    });

    return accounts;
}