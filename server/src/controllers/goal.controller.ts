import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";

import {
    createGoalService,
    getUserGoalService,
    updateGoalService,
    deleteGoalService
} from "../service/goal.service.js"

export const creatGoal = async (
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

        const goals = getUserGoalService(userId);
        return res.status(200).json({
            success: true,
            data: goals,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message:"Failed to fetch goals",
        })
    }
    
}

export const updateGoal = async (
    req: Request,
    res: Response
) => {
    try{
        const {userId} = getAuth(req);
        if(!userId){
            return res.status(401).json({
                message:"Unauthorised",
            })
        };

        const goal = await updateGoalService(
            userId,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            data: goal,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update goal",
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
        await deleteGoalService(
            userId, req.params.id
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