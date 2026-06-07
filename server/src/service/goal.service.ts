import prisma from "../lib/prisma.js";

interface CreateGoalInput {
    title: string;
    targetAmount: number;
    targetDate?: string;
}

interface UpdateGoalInput {
    title?: string;
    targetAmount?: number;
    targetDate?: string;
}

interface AddGoalContributionInput {
    amount: number;
}

async function resolveUser(clerkUserId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export const createGoalService = async (
    clerkUserId: string,
    data: CreateGoalInput
) => {
    const user = await resolveUser(clerkUserId);

    if (data.targetAmount <= 0) {
        throw new Error(
            "Target amount must be greater than 0"
        );
    }

    return prisma.goal.create({
        data: {
            userId: user.id,
            title: data.title,
            targetAmount: data.targetAmount,
            currentAmount: 0,
            targetDate: data.targetDate
                ? new Date(data.targetDate)
                : null,
        },
    });
};

export const getUserGoalService = async (
    clerkUserId: string
) => {
    const user = await resolveUser(clerkUserId);

    const goals = await prisma.goal.findMany({
        where: {
            userId: user.id,
        },
        include: {
            contributions: {
                orderBy: {
                    contributedAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return goals.map((goal) => {
        const target = Number(goal.targetAmount);
        const current = Number(goal.currentAmount);

        const progressPercent =
            target === 0
                ? 0
                : Number(
                    ((current / target) * 100).toFixed(2)
                );

        return {
            ...goal,
            progressPercent,
            status:
                progressPercent >= 100
                    ? "COMPLETED"
                    : "ACTIVE",
        };
    });
};

export const updateGoalService = async (
    clerkUserId: string,
    goalId: string,
    data: UpdateGoalInput
) => {
    const user = await resolveUser(clerkUserId);

    const goal = await prisma.goal.findFirst({
        where: {
            id: goalId,
            userId: user.id,
        },
    });

    if (!goal) {
        throw new Error(
            "Goal not found for this user"
        );
    }

    const finalTarget =
        data.targetAmount ??
        Number(goal.targetAmount);

    if (finalTarget <= 0) {
        throw new Error(
            "Target amount must be greater than 0"
        );
    }

    const updateData: any = {};

    if (data.title !== undefined) {
        updateData.title = data.title;
    }

    if (data.targetAmount !== undefined) {
        updateData.targetAmount = data.targetAmount;
    }

    if (data.targetDate !== undefined) {
        updateData.targetDate = new Date(data.targetDate);
    }

    return prisma.goal.update({
        where: {
            id: goalId,
        },
        data: updateData,
    });
};

export const addGoalContributionService = async (
    clerkUserId: string,
    goalId: string,
    data: AddGoalContributionInput
) => {
    const user = await resolveUser(clerkUserId);

    const goal = await prisma.goal.findFirst({
        where: {
            id: goalId,
            userId: user.id,
        },
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    if (data.amount <= 0) {
        throw new Error(
            "Contribution amount must be greater than 0"
        );
    }

    return prisma.$transaction(
        async (tx) => {
            await tx.goalContribution.create({
                data: {
                    goalId,
                    amount: data.amount,
                    contributedAt: new Date(),
                },
            });

            const updatedGoal =
                await tx.goal.update({
                    where: {
                        id: goalId,
                    },
                    data: {
                        currentAmount:
                            Number(goal.currentAmount) +
                            data.amount,
                    },
                });

            return updatedGoal;
        }
    );
};

export const getGoalContributionsService =
    async (
        clerkUserId: string,
        goalId: string
    ) => {
        const user =
            await resolveUser(clerkUserId);

        const goal =
            await prisma.goal.findFirst({
                where: {
                    id: goalId,
                    userId: user.id,
                },
            });

        if (!goal) {
            throw new Error("Goal not found");
        }

        return prisma.goalContribution.findMany({
            where: {
                goalId,
            },
            orderBy: {
                contributedAt: "desc",
            },
        });
    };

export const deleteGoalService = async (
    clerkUserId: string,
    goalId: string
) => {
    const user = await resolveUser(clerkUserId);

    const goal = await prisma.goal.findFirst({
        where: {
            id: goalId,
            userId: user.id,
        },
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    await prisma.$transaction(
        async (tx) => {
            await tx.goalContribution.deleteMany({
                where: {
                    goalId,
                },
            });

            await tx.goal.delete({
                where: {
                    id: goalId,
                },
            });
        }
    );
};