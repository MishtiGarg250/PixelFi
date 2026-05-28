import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  createAccountService,
  getPortfolioAccountsService,
  deleteAccountService,
} from "../service/account.service.js";
import { createAccountSchema } from "../validators/account.validator.js";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { portfolioId } = req.params;
    const validatedData = createAccountSchema.parse(req.body);

    const account = await createAccountService(userId, portfolioId, validatedData);

    return res.status(201).json({ success: true, account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create account" });
  }
};

export const getPortfolioAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { portfolioId } = req.params;
    const accounts = await getPortfolioAccountsService(userId, portfolioId);

    return res.status(200).json({ success: true, accounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch accounts" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { portfolioId, accountId } = req.params;
    await deleteAccountService(userId, portfolioId, accountId);

    return res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};