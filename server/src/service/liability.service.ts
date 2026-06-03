import prisma from "../lib/prisma.js";

interface CreateLiabilityInput {
  name: string;
  type: "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "CREDIT_CARD" | "OTHER";
  originalAmount: number;
  outstanding: number;
  interestRate?: number | undefined;
  currency: string;
}

interface UpdateLiabilityInput {
  name?: string | undefined;
  type?: "MORTGAGE" | "CAR_LOAN" | "PERSONAL_LOAN" | "CREDIT_CARD" | "OTHER" | undefined;
  originalAmount?: number | undefined;
  outstanding?: number | undefined;
  interestRate?: number | null | undefined;
  currency?: string | undefined;
}

async function resolveUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  return user;
}

export const getUserLiabilitiesService = async (clerkUserId: string) => {
  const user = await resolveUser(clerkUserId);

  return prisma.liability.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
};

export const createLiabilityService = async (
  clerkUserId: string,
  data: CreateLiabilityInput
) => {
  const user = await resolveUser(clerkUserId);

  return prisma.liability.create({
    data: {
      userId: user.id,
      name: data.name,
      type: data.type,
      originalAmount: data.originalAmount,
      outstanding: data.outstanding,
      interestRate: data.interestRate ?? null,
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

  const existing = await prisma.liability.findFirst({
    where: { id: liabilityId, userId: user.id },
  });
  if (!existing) throw new Error("Liability not found or does not belong to user");

  return prisma.liability.update({
    where: { id: liabilityId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.originalAmount !== undefined && { originalAmount: data.originalAmount }),
      ...(data.outstanding !== undefined && { outstanding: data.outstanding }),
      ...(data.interestRate !== undefined && { interestRate: data.interestRate }),
      ...(data.currency !== undefined && { currency: data.currency }),
    },
  });
};

export const deleteLiabilityService = async (
  clerkUserId: string,
  liabilityId: string
) => {
  const user = await resolveUser(clerkUserId);

  const existing = await prisma.liability.findFirst({
    where: { id: liabilityId, userId: user.id },
  });
  if (!existing) throw new Error("Liability not found or does not belong to user");

  await prisma.liability.delete({ where: { id: liabilityId } });
};
