import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  createTransactionService,
  getUserTransactionsService,
  getAccountTransactionsService,
} from "../service/transaction.service.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = createTransactionSchema.parse(req.body);

    const transaction = await createTransactionService(userId, validatedData);

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create transaction" });
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transactions = await getUserTransactionsService(userId);

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

export const getAccountTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accountId = req.params.accountId as string;
    const transactions = await getAccountTransactionsService(userId, accountId);

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};