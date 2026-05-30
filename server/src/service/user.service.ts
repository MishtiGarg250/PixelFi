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