"use client";

import {useQuery, useMutation,useQueryClient} from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getPortfolios ,createPortfolio} from "@/services/portfolio.service";

export function usePortfolios(){
    const {getApi} = useApi();

    const queryClient = useQueryClient();
    const portfolios = useQuery({ 
        queryKey:["portfolios"],
        queryFn: async()=>{
            const api = await getApi();
            return getPortfolios(api);
        }
    });

    const create = useMutation({
        mutationFn: async(data:{
            name: string;
            description?: string;
        })=>{
            const api = await getApi();
            return createPortfolio(
                api,data
            );
        },

        onSuccess:()=>{
            queryClient.invalidateQueries({
                queryKey:["portfolios"]
            });
        }
    });

    return {portfolios,create};
    
}