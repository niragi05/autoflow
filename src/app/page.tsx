"use client";

import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Logout } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Workflow created successfully!");
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions());
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while creating the workflow.");
    }
  }));

  const handleCreate = () => {
    create.mutate();
  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-4">
      <h1>Hello World</h1>
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button onClick={handleCreate} disabled={create.isPending}>Create Workflow</Button>
      <Logout />
    </div>
  )
};

export default Page;