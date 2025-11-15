"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [session, setSession] = useState<{ user: any; session: any } | null>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setSession(data);
    });
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      {JSON.stringify(session)}
      {session && (
        <Button onClick={handleLogout}>
          Logout
        </Button>
      )}
    </div>
  )
};

export default Page;