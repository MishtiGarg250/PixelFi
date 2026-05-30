"use client";
import {useAuth} from "@clerk/nextjs";
import {api} from "@/lib/api";

export function useApi(){
    const {getToken} = useAuth();

    const getApi = async()=>{
        const token = await getToken();

        api.defaults.headers.common[
            "Authorization"
        ]=`Bearer ${token}`

        return api;
    }
    return {getApi};
}