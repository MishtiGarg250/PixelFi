import prisma from "../lib/prisma.js";

async function resolveUser(clerkUserId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export const getUserNotificationsService = async (clerkUserId: string) => {
    const user = await resolveUser(clerkUserId);

    return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
};

export const markNotificationAsReadService = async (clerkUserId: string, notificationId: string) => {
    const user = await resolveUser(clerkUserId);

    return prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId: user.id
        },
        data: {
            read: true
        }
    });
};

export const deleteNotificationService = async (clerkUserId: string, notificationId: string) => {
    const user = await resolveUser(clerkUserId);

    return prisma.notification.deleteMany({
        where: {
            id: notificationId,
            userId: user.id
        }
    });
};
