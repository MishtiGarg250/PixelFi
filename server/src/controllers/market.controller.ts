import type {Request, Response} from "express";
import {
    getCompanyProfileService,
    getQuoteService,
    searchFinnhubSymbolsService,
} from "../service/market.service.js";

export const getQuote = async(req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol as string;
        const quote = await getQuoteService(symbol);
        return res.status(200).json({
            success: true,
            quote,
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error: "An error occurred while fetching the quote."});   
    }
};

export const getCompanyProfile = async(req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol as string;
        const profile = await getCompanyProfileService(symbol);
        return res.status(200).json({
            success: true,
            profile,
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the company profile." });
    }
};

export const searchSymbols = async(req: Request, res: Response) => {
    try {
        const query = (req.query.q as string) ?? "";
        const results = await searchFinnhubSymbolsService(query);
        return res.status(200).json({
            success: true,
            results,
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while searching symbols." });
    }
};
