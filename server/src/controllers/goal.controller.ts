import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";

import {
    createGoalService,
    getUserGoalService,
    updateGoalService,
    deleteGoalService,
    addGoalContributionService
} from "../service/goal.service.js"

export const addGoalContribution = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const id = req.params.id as string;
        if (!id) {
            return res.status(400).json({ success: false, message: "Goal id is required" });
        }
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
        }
        const goal = await addGoalContributionService(userId, id, { amount: Number(amount) });
        return res.status(200).json({ success: true, data: goal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to add contribution" });
    }
};

export const createGoal = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        };

        const goal = await createGoalService(
            userId, req.body
        );
        return res.status(201).json({
            success: true,
            data: goal,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create goal",
        })
    }
};

export const getUserGoals = async (
    req: Request,
    res: Response,
) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const goals = await getUserGoalService(userId);
        return res.status(200).json({
            success: true,
            data: goals,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch goals",
        })
    }

}

export const updateGoal = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorised",
            })
        };

        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Goal id is required",
            });
        }
        const goal = await updateGoalService(
            userId,
            id,
            req.body
        );

        return res.status(200).json({
            success: true,
            data: goal,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update goal",
        })
    }
}

export const deleteGoal = async (
    req: Request,
    res: Response,
) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        };
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Goal id is required",
            });
        }
        await deleteGoalService(
            userId, id
        );

        return res.status(200).json({
            success: true,
            message: "Goal deleted",
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete goal",
        })
    }
}