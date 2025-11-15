import prisma from '@/lib/db';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
      console.log(ctx.auth);
      return prisma.user.findMany();
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;