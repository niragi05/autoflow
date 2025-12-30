import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

/*
 * Hook to fetch the current user using suspense
 */ 
export const useSuspenseCurrentUser = () => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.auth.getCurrentUser.queryOptions());
}

