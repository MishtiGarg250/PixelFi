import type {Request, Response} from "express";

import { getAuth } from "@clerk/express";

import {createAccountService,getUserAccountsService,} from "../service/account.service.js";

import { createAccountSchema,} from "../validators/account.validator.js";

export const createAccount = async (
  req: Request,
  res: Response
) => {
  try {

    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const validatedData =
      createAccountSchema.parse(req.body);

    const account =
      await createAccountService(
        userId,
        validatedData
      );

    return res.status(201).json({
      success: true,
      account,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to create account",
    });
  }
};

export const getUserAccounts =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const accounts =
        await getUserAccountsService(
          userId
        );

      return res.status(200).json({
        success: true,
        accounts,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch accounts",
      });
    }
  };