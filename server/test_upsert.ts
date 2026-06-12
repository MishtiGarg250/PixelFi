import prisma from './src/lib/prisma.js';

async function run() {
  try {
    const clerkUserId = "user_3EFoVVEjOcvgF0E69ChXma93lM6";
    const email = "gargmishti9@gmail.com";
    const username = "gargmishti9";

    await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email,
        firstName: "",
        lastName: "",
        imageUrl: "",
      },
      create: {
        clerkUserId,
        email,
        username,
        firstName: "",
        lastName: "",
        imageUrl: "",
      },
    });
    console.log("Upsert succeeded");
  } catch (error) {
    console.error(error);
  }
}

run().finally(() => prisma.$disconnect());
