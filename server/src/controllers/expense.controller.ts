import type {Request, Response} from "express";
import {getAuth} from "@clerk/express";
import{
    createExpenseService,
    getUserExpenseService,
    updateExpenseService,
    deleteExpenseService
} from "../service/expense.service.js";
import { producer } from "../config/kafka.js";

export const getUserExpenses = async(req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const expenses = await getUserExpenseService(userId);
        return res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching user expenses:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createExpense= async(req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if(!userId){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const expense = await createExpenseService(userId, req.body);
        
        // Fire data payload event downstream immediately into Kafka 
        try {
            await producer.send({
                topic: 'pixelfi.expense.created',
                messages: [{ value: JSON.stringify(expense) }],
            });
        } catch (kafkaError) {
            console.error("Failed to send Kafka event:", kafkaError);
        }

        return res.status(201).json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateExpense = async(req: Request, res: Response) => {
    try{
        const { userId } = getAuth(req);
        if(!userId){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const id = req.params.id as string;
        const expense = await updateExpenseService(userId, id, req.body);
        return res.status(200).json({
            success: true,
            data: expense,
        });

    }catch(error){
        console.error("Error updating expense:", error);
        return res.status(500).json({ message: "Failed to update expense" });
    }
}

export const deleteExpense = async(req: Request, res: Response) => {
    try{
        const { userId } = getAuth(req);
        if(!userId){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const id = req.params.id as string;
        const expense = await deleteExpenseService(userId, id);
        return res.status(200).json({
            success: true,
            data: expense,
        });
    }catch(error){
        console.error("Error deleting expense:", error);
        return res.status(500).json({ message: "Failed to delete expense" });
    }
}