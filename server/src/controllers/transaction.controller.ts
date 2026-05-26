import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { createTransactionService,getUserTransactionService } from '../service/transaction.service.js';
import { createTransactionSchema } from '../validators/transaction.validator.js';

export const createTransaction= async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const validatedData = createTransactionSchema.parse(req.body);
        const transaction = await createTransactionService(userId, validatedData);
        return res.status(201).json({
            success: true,
            data: transaction,
        });

    }catch (error) {       
         return res.status(401).json({ message: 'Unauthorized' });
    } 
}

export const getUserTransactions = async(req: Request, res: Response)=>{
    try{
        const { userId } = getAuth(req);
        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const transactions = await getUserTransactionService(userId);
        return res.status(200).json({
            success: true,
            data: transactions,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message:"Failed to fetch transactions",
        })
    }
}