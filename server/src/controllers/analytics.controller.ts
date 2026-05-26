import type {
  Request,
  Response,
} from "express";

import { getAuth }
from "@clerk/express";

import {
  getNetWorthService,
  getAllocationService,
  getPerformanceService,
} from "../service/analytics.service.js";

export const getNetWorth =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { userId } =
        getAuth(req);

      if (!userId) {

        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const analytics =
        await getNetWorthService(
          userId
        );

      return res.status(200).json({
        success: true,
        analytics,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch net worth",
      });
    }
  };

export const getAllocation =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { userId } =
        getAuth(req);

      if (!userId) {

        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const allocation =
        await getAllocationService(
          userId
        );

      return res.status(200).json({
        success: true,
        allocation,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch allocation",
      });
    }
  };

export const getPerformance =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { userId } =
        getAuth(req);

      if (!userId) {

        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const performance =
        await getPerformanceService(
          userId
        );

      return res.status(200).json({
        success: true,
        performance,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch performance",
      });
    }
  };