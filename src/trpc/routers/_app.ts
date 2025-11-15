import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
	getWorkflows: protectedProcedure.query(({ ctx }) => {
		console.log(ctx.auth);
		return prisma.workflow.findMany();
	}),
	createWorkflow: protectedProcedure.mutation(() => {
		inngest.send({
			name: "test/hello.world",
			data: {
				email: "nmasalia@asu.edu"
			}
		})

		return { success: true, message: "Job queued" }
	})
});
// export type definition of API
export type AppRouter = typeof appRouter;