import prisma from "../lib/prisma.js";
import { clerkClient } from "@clerk/express";

export const getCurrentUserService = async (
  clerkUserId: string
) => {
  let user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    try {
      // Fetch details from Clerk and sync user database record dynamically
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        throw new Error("Clerk user has no email address.");
      }

      const username = clerkUser.username || email.split("@")[0] || `user_${Date.now()}`;

      user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          username,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          imageUrl: clerkUser.imageUrl || "",
        },
      });
      console.log(`Successfully synchronized Clerk user ${clerkUserId} to database.`);
    } catch (error) {
      console.error("Error syncing Clerk user to local database:", error);
      throw error;
    }
  }

  return user;
};