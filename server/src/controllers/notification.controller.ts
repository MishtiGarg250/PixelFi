import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { getUserNotificationsService, markNotificationAsReadService, deleteNotificationService } from "../service/notification.service.js";

export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const notifications = await getUserNotificationsService(userId);
        return res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const id = req.params.id as string | undefined;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Notification ID is required" });
        }

        await markNotificationAsReadService(userId, id);
        return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const id = req.params.id as string | undefined;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Notification ID is required" });
        }

        await deleteNotificationService(userId, id);
        return res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
