import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const appRouter = createTRPCRouter({
	testAi: protectedProcedure.mutation(async () => {
		const { text } = await generateText({
			model: google("gemini-2.5-flash"),
			prompt: "Write a recipe to make protein bagels.",
		})

		return text;
	}),
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