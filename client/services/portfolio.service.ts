import {AxiosInstance} from "axios";

export interface Portfolio{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export const getPortfolios = async(api:AxiosInstance)=>{
    const res = api.get("/portfolios/");
    return (await res).data.portfolios as Portfolio[];
}

export const createPortfolio= async(api:AxiosInstance,data:{
    name:string;
    description?: string;
})=>{
    const res = await api.post("/portfolios/",data);
    return res.data.portfolios;
}