import type {Request, Response} from "express";
import {getAuth} from "@clerk/express";
import {getUserHoldingsService} from "../service/holdings.service.js";

export const getUserHoldings = async(req: Request, res: Response) => {
    try{
        const {userId} = getAuth(req);
        if(!userId){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const holdings = await getUserHoldingsService(userId);

        return res.status(200).json({
            success: true,
            holdings,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "failed to fetch holdings"
        })
    }
}