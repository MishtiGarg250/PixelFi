import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";

export function useNotifications() {
    const { getToken, isLoaded } = useAuth();
    const queryClient = useQueryClient();

    const fetchNotifications = async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const res = await api.get("/notifications", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    };

    const query = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        enabled: isLoaded,
    });

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const res = await api.put(
                `/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteNotification = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const res = await api.delete(`/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return {
        notifications: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        markAsRead,
        deleteNotification,
    };
}
