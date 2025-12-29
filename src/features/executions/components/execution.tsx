'use client';

import { ExecutionStatus } from "@/generated/prisma/enums";
import { CheckCircle2Icon, Clock4Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSuspenseExecution } from "../hooks/use-executions";


const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
        default:
            return <Clock4Icon className="size-5 text-muted-foreground" />;
    }
}

export const ExecutionView = ({ executionId }: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShowStackTrace] = useState(false);

    const duration = execution.completedAt ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000) : null;

    const formatStatus = (status: ExecutionStatus) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                        <CardTitle>
                            {formatStatus(execution.status)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Execution for {execution.workflow.name}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Workflow
                        </p>
                        <Link href={`/workflows/${execution.workflowId}`} className="text-sm text-primary hover:underline" prefetch>
                            {execution.workflow.name}
                        </Link>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Started
                        </p>
                        <p className="text-sm">
                            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                        </p>
                    </div>

                    {execution.completedAt && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Completed
                            </p>
                            <p className="text-sm">
                                {formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                            </p>
                        </div>
                    )}

                    {duration && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Duration
                            </p>
                            <p className="text-sm">
                                {duration} seconds
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Event ID
                        </p>
                        <p className="text-sm">
                            {execution.inngestEventId}
                        </p>
                    </div>
                </div>

                {execution.error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
                        <div>
                            <p className="text-sm font-medium text-red-900">
                                Error
                            </p>
                            <p className="text-xs text-red-900 font-mono">
                                {execution.error}
                            </p>
                        </div>

                        {execution.errorStack && (
                            <Collapsible
                                open={showStackTrace}
                                onOpenChange={setShowStackTrace}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs text-red-900 hover:bg-red-100 hover:text-red-900 mb-2">
                                        {showStackTrace ? "Hide Stack Trace" : "View Stack Trace"}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="text-xs text-red-900 font-mono bg-red-100 p-2 rounded-md overflow-x-auto max-h-96 max-w-full overflow-y-auto">
                                        {execution.errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        )}

                        {execution.output && (
                            <div className="mt-6 p-4 bg-muted rounded-md">
                                <p className="text-sm bg-muted rounded-md">
                                    Output
                                </p>
                                <pre className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md overflow-x-auto">
                                    {JSON.stringify(execution.output, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}