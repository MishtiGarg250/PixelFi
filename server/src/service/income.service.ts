import prisma from "../lib/prisma.js";

interface CreateIncomeInput {
    source:
    | "SALARY"
    | "BONUS"
    | "FREELANCE"
    | "DIVIDEND"
    | "INTEREST"
    | "RENTAL"
    | "OTHER";
    amount: number;
    currency: string;
    receivedAt: string;
    accountId?: string;
}

interface UpdateIncomeInput {
    source?:
    | "SALARY"
    | "BONUS"
    | "FREELANCE"
    | "DIVIDEND"
    | "INTEREST"
    | "RENTAL"
    | "OTHER";
    amount?: number;
    currency?: string;
    receivedAt?: string;
    accountId?: string | null;
}

async function resolveUser(clerkUserId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });
    if (!user) throw new Error("User not found");
    return user;
}

export const createIncomeService = async (
    clerkUserId: string,
    data: CreateIncomeInput
) => {
    const user = await resolveUser(clerkUserId);

    if (data.amount <= 0) {
        throw new Error("Income amount must be greater than 0");
    }

    if (data.accountId) {
        const account = await prisma.account.findFirst({
            where: { id: data.accountId, userId: user.id },
        });
        if (!account) {
            throw new Error("Account not found or does not belong to user");
        }
    }

    return prisma.$transaction(async (tx) => {
        if (data.accountId) {
            const account = await tx.account.findUnique({
                where: { id: data.accountId },
            });
            const currentBalance = Number(account?.currentBalance ?? 0);
            await tx.account.update({
                where: { id: data.accountId },
                data: { currentBalance: currentBalance + data.amount },
            });
        }

        const incomeData: any = {
            userId: user.id,
            source: data.source,
            amount: data.amount,
            currency: data.currency,
            receivedAt: new Date(data.receivedAt),
        };

        if (data.accountId !== undefined) {
            incomeData.accountId = data.accountId;
        }

        return tx.income.create({ data: incomeData });
    });
};

export const getUserIncomesService = async (clerkUserId: string) => {
    const user = await resolveUser(clerkUserId);

    return prisma.income.findMany({
        where: { userId: user.id },
        include: { account: true },
        orderBy: { receivedAt: "desc" },
    });
};

export const updateIncomeService = async (
    clerkUserId: string,
    incomeId: string,
    data: UpdateIncomeInput
) => {
    const user = await resolveUser(clerkUserId);

    const income = await prisma.income.findFirst({
        where: { id: incomeId, userId: user.id },
    });

    if (!income) {
        throw new Error("Income not found or does not belong to user");
    }

    if (data.amount !== undefined && data.amount <= 0) {
        throw new Error("Income amount must be greater than 0");
    }

    if (data.accountId !== undefined && data.accountId !== null) {
        const account = await prisma.account.findFirst({
            where: { id: data.accountId, userId: user.id },
        });
        if (!account) {
            throw new Error("Account not found or does not belong to user");
        }
    }

    const updateData: any = {};
    if (data.source !== undefined) updateData.source = data.source;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.accountId !== undefined) updateData.accountId = data.accountId;
    if (data.receivedAt !== undefined) {
        updateData.receivedAt = new Date(data.receivedAt);
    }

    return prisma.income.update({
        where: { id: incomeId },
        data: updateData,
    });
};

export const deleteIncomeService = async (
    clerkUserId: string,
    incomeId: string
) => {
    const user = await resolveUser(clerkUserId);

    const income = await prisma.income.findFirst({
        where: { id: incomeId, userId: user.id },
    });

    if (!income) {
        throw new Error("Income not found or does not belong to user");
    }

    return prisma.income.delete({ where: { id: incomeId } });
};
