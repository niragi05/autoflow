import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { prefetchCurrentUser } from "@/features/auth/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

const Layout = ({ children } : { children: React.ReactNode }) => {
    prefetchCurrentUser(); // Prefetch on server
    
    return (
        <SidebarProvider>
            <HydrateClient>
                <Suspense fallback={<div className="w-64" />}>
                    <AppSidebar />
                </Suspense>
                <SidebarInset className="bg-accent/20">
                    {children}
                </SidebarInset>
            </HydrateClient>
        </SidebarProvider>
    )
}

export default Layout;