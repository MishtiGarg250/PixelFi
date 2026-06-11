import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  createAccountService,
  getUserAccountsService,
  deleteAccountService,
  updateAccountService,
} from "../service/account.service.js";
import { createAccountSchema } from "../validators/account.validator.js";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = createAccountSchema.parse(req.body);

    const { name, brokerName, accountType, currency, currentBalance, emergencyFund } = validatedData;

    const serviceInput: Parameters<typeof createAccountService>[1] = {
      name,
      accountType,
      currency,
      ...(brokerName !== undefined && { brokerName }),
      ...(currentBalance !== undefined && { currentBalance }),
      ...(emergencyFund !== undefined && { emergencyFund }),
    };

    const account = await createAccountService(userId, serviceInput);

    return res.status(201).json({ success: true, account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create account" });
  }
};

export const getUserAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accounts = await getUserAccountsService(userId);

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

    const accountId = req.params.accountId as string;
    await deleteAccountService(userId, accountId);

    return res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accountId = req.params.accountId as string;
    const { currentBalance, name, brokerName, emergencyFund } = req.body;

    const account = await updateAccountService(userId, accountId, {
      ...(currentBalance !== undefined && { currentBalance: Number(currentBalance) }),
      ...(name !== undefined && { name }),
      ...(brokerName !== undefined && { brokerName }),
      ...(emergencyFund !== undefined && { emergencyFund: Number(emergencyFund) }),
    });

    return res.status(200).json({ success: true, account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update account" });
  }
};