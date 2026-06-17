import {useEffect, useState} from "react";
import { insightsService, type AIInsight} from "@/services/insights.service";
import {toast} from "sonner";

export function useAIInsights(userId: string | undefined){
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading,setLoading] = useState(true);
    const [connected,setConnected] = useState(false);
    
    useEffect(()=>{
        if(!userId) return;

        // Load initail historical snapshots
        insightsService.getHistoricalInsights(userId)
        .then((data)=> setInsights(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));


        // Mount real-time message stream via service pipeline
        const unsubscribe = insightsService.subscribeToStream(
            userId,
            (newInsight) =>{
                setInsights((prev) => [newInsight,...prev].slice(0,25));
                setConnected(true);
                toast.info(`[ALERT]: ${newInsight.title}`,{
                    description: newInsight.message,
                })
            },
            ()=> setConnected(false)
        );

        setConnected(true);

        return ()=>{
            unsubscribe();
        }
    },[userId]);

    return {insights,loading, connected};
}