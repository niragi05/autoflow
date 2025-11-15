import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Logout } from "./logout";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-4">
      <h1>Hello World</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Logout />
    </div>
  )
};

export default Page;