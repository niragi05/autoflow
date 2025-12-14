import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from "react";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { WorkflowsList } from "@/features/workflows/components/workflows";

const Page = async () => {
    await requireAuth();

    prefetchWorkflows();

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<div>Error!</div>}>
                <Suspense fallback={<div>Loading...</div>}>
                    <WorkflowsList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default Page;