import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  getUserLiabilitiesService,
  createLiabilityService,
  updateLiabilityService,
  deleteLiabilityService,
} from "../service/liability.service.js";
import {
  createLiabilitySchema,
  updateLiabilitySchema,
} from "../validators/liability.validator.js";

export const getUserLiabilities = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const liabilities = await getUserLiabilitiesService(userId);
    return res.status(200).json({ success: true, liabilities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch liabilities" });
  }
};

export const createLiability = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const validatedData = createLiabilitySchema.parse(req.body);
    const liability = await createLiabilityService(userId, validatedData);
    return res.status(201).json({ success: true, liability });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create liability" });
  }
};

export const updateLiability = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const liabilityId = req.params.liabilityId as string;
    const validatedData = req.body;
    const liability = await updateLiabilityService(userId, liabilityId, validatedData);
    return res.status(200).json({ success: true, liability });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update liability" });
  }
};

export const deleteLiability = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const liabilityId = req.params.liabilityId as string;
    await deleteLiabilityService(userId, liabilityId);
    return res.status(200).json({ success: true, message: "Liability deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete liability" });
  }
};
