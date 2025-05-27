"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { ProfileTrigger } from "@/components/auth/profile-trigger"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableColorScheme>
      <SidebarProvider>
        <MobileSidebar/>
        <SidebarInset>
          <AuthProvider>
            <ProfileTrigger />
            <QueryClientProvider client={queryClient}>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </AuthProvider>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}