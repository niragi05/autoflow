import { createTRPCRouter } from '../init';
import { workflowsRouter } from '@/features/workflows/server/route';
import { credentialsRouter } from '@/features/credentials/server/route';

export const appRouter = createTRPCRouter({
	workflows: workflowsRouter,
	credentials: credentialsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;