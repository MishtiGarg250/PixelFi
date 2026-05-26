import type {Request, Response} from "express";
import {getQuoteService} from "../service/market.service.js";

export const getQuote = async(req: Request, res: Response) => {
    try {
        const {symbol} = req.params;
        const quote = await getQuoteService(symbol);
        return res.status(200).json({
            success: true,
            quote,
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error: "An error occurred while fetching the quote."});   
    }
}