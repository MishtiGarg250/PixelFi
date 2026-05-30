"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";


export function useUser() {
    const { getToken } = useAuth();
    return useQuery({

        queryKey: ["user"],
        queryFn: async () => {
            const token = await getToken();
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
                {
                    headers: {
                        Authorization:`Bearer ${token}`
                    }
                }
            );
            return res.data.user;
        }
    });
}