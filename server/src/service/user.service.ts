import prisma from "../lib/prisma.js";
import { clerkClient } from "@clerk/express";

export const getCurrentUserService = async (
  clerkUserId: string
) => {
  const clerkUser =
    await clerkClient.users.getUser(clerkUserId);

  const email =
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error(
      "Clerk user has no email address"
    );
  }

  const username: string =
  clerkUser.username ??
  email.split("@")[0] ??
  `user_${Date.now()}`;

  return prisma.user.upsert({
    where: {
      clerkUserId,
    },
    update: {
      email,
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      imageUrl: clerkUser.imageUrl ?? "",
    },
    create: {
      clerkUserId,
      email,
      username,
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      imageUrl: clerkUser.imageUrl ?? "",
    },
  });
};

export const updateUserService = async (
  clerkUserId: string,
  data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    baseCurrency?: string;
  }
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Check username uniqueness if provided
  if (data.username && data.username !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) throw new Error("Username already taken");
  }

  return prisma.user.update({
    where: { clerkUserId },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.username !== undefined && { username: data.username }),
      ...(data.baseCurrency !== undefined && { baseCurrency: data.baseCurrency.toUpperCase() }),
    },
  });
};