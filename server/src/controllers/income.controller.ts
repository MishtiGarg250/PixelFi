import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
    createIncomeService,
    getUserIncomesService,
    updateIncomeService,
    deleteIncomeService,
} from "../service/income.service.js";

export const getUserIncomes = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const incomes = await getUserIncomesService(userId);
        return res.status(200).json(incomes);
    } catch (error) {
        console.error("Error fetching user incomes:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createIncome = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const income = await createIncomeService(userId, req.body);
        return res.status(201).json(income);
    } catch (error) {
        console.error("Error creating income:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateIncome = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const id = req.params.id as string;
        const income = await updateIncomeService(userId, id, req.body);
        return res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error("Error updating income:", error);
        return res.status(500).json({ message: "Failed to update income" });
    }
};

export const deleteIncome = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const id = req.params.id as string;
        const income = await deleteIncomeService(userId, id);
        return res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error("Error deleting income:", error);
        return res.status(500).json({ message: "Failed to delete income" });
    }
};
