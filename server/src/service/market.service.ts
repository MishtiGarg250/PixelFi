import axios from 'axios';
const BASE_URL= "https://api.twelvedata.com";

export const getQuoteService = async(symbol: string)=>{
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    const response = await axios.get(`${BASE_URL}/price`,
        {
            params:{
                symbol,
                apikey: apiKey
            }
        }
    );
    return {
        symbol,
        price: Number(response.data.price)
    }
}