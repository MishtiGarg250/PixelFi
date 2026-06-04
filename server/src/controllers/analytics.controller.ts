import type { Request,
  Response,
} from "express";

import { getAuth } from "@clerk/express";

import {
  getNetWorthService,
  getAllocationService,
  getPerformanceService,
  getDashboardService,
  getRiskScoreService,
  getDiversificationService,
} from "../service/analytics.service.js";

// Net worth is the total value of a user's financial assets minus their liabilities, providing a snapshot of their overall financial health at a specific point in time. It includes the value of investments, cash, and other assets, minus any debts or obligations.

export const getNetWorth = async ( req: Request,res: Response) => {

    try {

      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const analytics =  await getNetWorthService(userId);

      return res.status(200).json({
        success: true,
        analytics,
      });

    }catch(error){

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch net worth",
      });
    }
  };

// Allocation is the distribution of a user's investments across different asset classes (e.g., stocks, bonds, cash) and sectors (e.g., technology, healthcare). It provides insights into the diversification and risk level of a user's portfolio, helping them make informed decisions about their investments.

export const getAllocation =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const allocation =  await getAllocationService(userId);

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

// Perfomance is a measure of how well a user's portfolio has performed over a specific period of time, typically expressed as a percentage gain or loss. It takes into account factors such as asset appreciation, dividends, and interest income, and can be used to evaluate the effectiveness of investment strategies and make informed decisions about future investments.

export const getPerformance = async ( req: Request, res: Response ) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const performance = await getPerformanceService(userId);

      return res.status(200).json({
        success: true,
        performance,
      });

    }catch(error){

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch performance",
      });
    }
  };

// Dashboard analytics is a collection of key metrics and insights that provide an overview of a user's financial health and portfolio performance. It typically includes information such as net worth, asset allocation, performance trends, risk score, diversification score, and recent transactions. The dashboard analytics help users understand their financial situation at a glance and make informed decisions about their investments and financial goals.

export const getDashboard = async ( req: Request, res: Response) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const dashboard = await getDashboardService(userId);

      return res.status(200).json({
        success: true,
        dashboard,
      });

    } catch(error){

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch dashboard analytics",
      });
    }
  };

// Risk score is a measure of the overall risk level of a user's portfolio, based on factors such as asset allocation, volatility, and historical performance. A higher risk score indicates a more aggressive portfolio, which may have higher potential returns but also higher potential losses.

export const getRiskScore =
  async (
    req: Request,
    res: Response
  ) => {

    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const risk = await getRiskScoreService(userId);

      return res.status(200).json({
        success: true,
        risk,
      });

    }catch(error){
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch risk score",
      });
    }
  };

// Diversification score is a measure of how well diversified a user's portfolio is, based on the allocation of their assets across different categories (e.g., stocks, bonds, cash). A higher diversification score indicates a more balanced portfolio, which can help reduce risk and improve long-term returns.

export const getDiversification = async (req: Request,res: Response) => {
    try {

      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const diversification = await getDiversificationService(userId);

      return res.status(200).json({
        success: true,
        diversification,
      });

    }catch(error){

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch diversification score",
      });
    }
  };