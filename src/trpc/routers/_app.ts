import { createTRPCRouter } from '../init';
import { workflowsRouter } from '@/features/workflows/server/route';
import { credentialsRouter } from '@/features/credentials/server/route';
import { executionsRouter } from '@/features/executions/server/route';
import { authRouter } from '@/features/auth/server/route';

export const appRouter = createTRPCRouter({
	auth: authRouter,
	workflows: workflowsRouter,
	credentials: credentialsRouter,
	executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;