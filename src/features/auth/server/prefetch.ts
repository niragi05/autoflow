import { prefetch, trpc } from "@/trpc/server";

/*
 * Prefetch the current user
 */
export const prefetchCurrentUser = () => {
    return prefetch(trpc.auth.getCurrentUser.queryOptions());
};