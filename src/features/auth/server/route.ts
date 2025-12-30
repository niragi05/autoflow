import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const authRouter = createTRPCRouter({
    getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
        return prisma.user.findUniqueOrThrow({
            where: {
                id: ctx.auth.user.id
            }
        })
    }),
});