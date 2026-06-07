import prisma from "../lib/prisma.js";

interface CreateLiabilityInput {
  name: string;
  type:
    | "MORTGAGE"
    | "CAR_LOAN"
    | "PERSONAL_LOAN"
    | "CREDIT_CARD"
    | "OTHER";
  originalAmount: number;
  outstanding: number;
  interestRate?: number;
  currency: string;
}

interface UpdateLiabilityInput {
  name?: string;
  type?:
    | "MORTGAGE"
    | "CAR_LOAN"
    | "PERSONAL_LOAN"
    | "CREDIT_CARD"
    | "OTHER";
  originalAmount?: number;
  outstanding?: number;
  interestRate?: number | null;
  currency?: string;
}

async function resolveUser(clerkUserId: string) {
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

export const getUserLiabilitiesService = async (
  clerkUserId: string
) => {
  const user = await resolveUser(clerkUserId);

  return prisma.liability.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createLiabilityService = async (
  clerkUserId: string,
  data: CreateLiabilityInput
) => {
  const user = await resolveUser(clerkUserId);

  if (data.originalAmount <= 0) {
    throw new Error(
      "Original amount must be greater than 0"
    );
  }

  if (data.outstanding < 0) {
    throw new Error(
      "Outstanding amount cannot be negative"
    );
  }

  if (
    data.outstanding >
    data.originalAmount
  ) {
    throw new Error(
      "Outstanding amount cannot exceed original amount"
    );
  }

  if (
    data.interestRate !== undefined &&
    data.interestRate < 0
  ) {
    throw new Error(
      "Interest rate cannot be negative"
    );
  }

  return prisma.liability.create({
    data: {
      userId: user.id,
      name: data.name,
      type: data.type,
      originalAmount: data.originalAmount,
      outstanding: data.outstanding,
      interestRate:
        data.interestRate ?? null,
      currency: data.currency,
    },
  });
};

export const updateLiabilityService = async (
  clerkUserId: string,
  liabilityId: string,
  data: UpdateLiabilityInput
) => {
  const user = await resolveUser(clerkUserId);

  const existing =
    await prisma.liability.findFirst({
      where: {
        id: liabilityId,
        userId: user.id,
      },
    });

  if (!existing) {
    throw new Error(
      "Liability not found or does not belong to user"
    );
  }

  if (
    data.originalAmount !== undefined &&
    data.originalAmount <= 0
  ) {
    throw new Error(
      "Original amount must be greater than 0"
    );
  }

  if (
    data.outstanding !== undefined &&
    data.outstanding < 0
  ) {
    throw new Error(
      "Outstanding amount cannot be negative"
    );
  }

  if (
    data.interestRate !== undefined &&
    data.interestRate !== null &&
    data.interestRate < 0
  ) {
    throw new Error(
      "Interest rate cannot be negative"
    );
  }

  const finalOriginal =
    data.originalAmount ??
    Number(existing.originalAmount);

  const finalOutstanding =
    data.outstanding ??
    Number(existing.outstanding);

  if (
    finalOutstanding >
    finalOriginal
  ) {
    throw new Error(
      "Outstanding amount cannot exceed original amount"
    );
  }

  return prisma.liability.update({
    where: {
      id: liabilityId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),

      ...(data.originalAmount !==
        undefined && {
        originalAmount:
          data.originalAmount,
      }),

      ...(data.outstanding !==
        undefined && {
        outstanding:
          data.outstanding,
      }),

      ...(data.interestRate !==
        undefined && {
        interestRate:
          data.interestRate,
      }),

      ...(data.currency !==
        undefined && {
        currency: data.currency,
      }),
    },
  });
};

export const deleteLiabilityService = async (
  clerkUserId: string,
  liabilityId: string
) => {
  const user = await resolveUser(clerkUserId);

  const existing =
    await prisma.liability.findFirst({
      where: {
        id: liabilityId,
        userId: user.id,
      },
    });

  if (!existing) {
    throw new Error(
      "Liability not found or does not belong to user"
    );
  }

  await prisma.liability.delete({
    where: {
      id: liabilityId,
    },
  });
};