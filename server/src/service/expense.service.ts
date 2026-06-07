import prisma from "../lib/prisma.js";

interface CreateExpenseInput {
    category:
    | "FOOD"
    | "RENT"
    | "TRAVEL"
    | "SHOPPING"
    | "UTILITIES"
    | "HEALTHCARE"
    | "OTHER";

    title?: string;
    amount: number;
    currency: string;
    occurredAt: string;
    accountId?: string;
}

interface UpdateExpenseInput {
    category?:
    | "FOOD"
    | "RENT"
    | "TRAVEL"
    | "SHOPPING"
    | "UTILITIES"
    | "HEALTHCARE"
    | "OTHER";

    title?: string;
    amount?: number;
    currency?: string;

    occurredAt?: string;

    accountId?: string | null;
}

async function resolveUser(
    clerkUserId: string
) {
    const user = await prisma.user.findUnique({
        where: {
            clerkUserId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export const createExpenseService = async (
    clerkUserId: string,
    data: CreateExpenseInput
) => {
    const user = await resolveUser(
        clerkUserId
    );

    if (data.amount <= 0) {
        throw new Error(
            "Expense amount must be greater than 0"
        );
    }

    if (data.accountId) {
        const account =
            await prisma.account.findFirst({
                where: {
                    id: data.accountId,
                    userId: user.id,
                },
            });

        if (!account) {
            throw new Error(
                "Account not found or does not belong to user"
            );
        }
    }

    return prisma.$transaction(
        async (tx) => {
            if (data.accountId) {
                const account =
                    await tx.account.findUnique({
                        where: {
                            id: data.accountId,
                        },
                    });

                const currentBalance =
                    Number(
                        account?.currentBalance ?? 0
                    );

                if (
                    currentBalance < data.amount
                ) {
                    throw new Error(
                        "Insufficient account balance"
                    );
                }

                await tx.account.update({
                    where: {
                        id: data.accountId,
                    },
                    data: {
                        currentBalance:
                            currentBalance -
                            data.amount,
                    },
                });
            }

            const expenseData: any = {
                userId: user.id,

                category: data.category,

                title: data.title ?? null,

                amount: data.amount,

                currency: data.currency,

                occurredAt: new Date(data.occurredAt),
            };

            if (data.accountId !== undefined) {
                expenseData.accountId = data.accountId;
            }

            return tx.expense.create({
                data: expenseData,
            });
        }
    );
};

export const getUserExpenseService =
    async (clerkUserId: string) => {
        const user =
            await resolveUser(
                clerkUserId
            );

        return prisma.expense.findMany({
            where: {
                userId: user.id,
            },

            include: {
                account: true,
            },

            orderBy: {
                occurredAt: "desc",
            },
        });
    };

export const updateExpenseService =
    async (
        clerkUserId: string,
        expenseId: string,
        data: UpdateExpenseInput
    ) => {
        const user =
            await resolveUser(
                clerkUserId
            );

        const expense =
            await prisma.expense.findFirst({
                where: {
                    id: expenseId,
                    userId: user.id,
                },
            });

        if (!expense) {
            throw new Error(
                "Expense not found or does not belong to user"
            );
        }

        if (
            data.amount !==
            undefined &&
            data.amount <= 0
        ) {
            throw new Error(
                "Expense amount must be greater than 0"
            );
        }

        if (
            data.accountId !==
            undefined &&
            data.accountId !== null
        ) {
            const account =
                await prisma.account.findFirst({
                    where: {
                        id: data.accountId,
                        userId: user.id,
                    },
                });

            if (!account) {
                throw new Error(
                    "Account not found or does not belong to user"
                );
            }
        }

        const updateData: any = {};

        if (data.category !== undefined) {
            updateData.category = data.category;
        }

        if (data.title !== undefined) {
            updateData.title = data.title;
        }

        if (data.amount !== undefined) {
            updateData.amount = data.amount;
        }

        if (data.currency !== undefined) {
            updateData.currency = data.currency;
        }

        if (data.accountId !== undefined) {
            updateData.accountId = data.accountId;
        }

        if (data.occurredAt !== undefined) {
            updateData.occurredAt = new Date(data.occurredAt);
        }

        return prisma.expense.update({
            where: {
                id: expenseId,
            },
            data: updateData,
        });

    };

export const deleteExpenseService =
    async (
        clerkUserId: string,
        expenseId: string
    ) => {
        const user =
            await resolveUser(
                clerkUserId
            );

        const expense =
            await prisma.expense.findFirst({
                where: {
                    id: expenseId,
                    userId: user.id,
                },
            });

        if (!expense) {
            throw new Error(
                "Expense not found or does not belong to user"
            );
        }

        return prisma.expense.delete({
            where: {
                id: expenseId,
            },
        });
    };