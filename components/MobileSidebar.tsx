import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Users, Medal, LayoutDashboard } from "lucide-react"

// Menu Items
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Connect",
    url: "/social",
    icon: Users,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Medal,
  },
]

export function MobileSidebar() {
  const { isMobile } = useSidebar();
  if (!isMobile) {
    return
  }
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Fitness Logger</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
