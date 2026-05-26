import prisma from "../lib/prisma.js";

export const getCurrentUserService = async (
  clerkUserId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  return user;
};