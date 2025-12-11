import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { NAV_CONFIG } from '@/lib/nav-config'
import { useAppContext } from '@/context/AppContext'
import { NavLink, useLocation } from 'react-router-dom'
import { Settings, LogOut, ChevronsUpDown, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { MenuCustomizationDialog } from '@/components/settings/MenuCustomizationDialog'
import { useIsMobile } from '@/hooks/use-mobile'

export function Sidebar() {
  const { user, logout, navOrder, navPreferences } = useAppContext()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()
  const isMobile = useIsMobile()

  return (
    <>
      <ShadcnSidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-400 text-sidebar-primary-foreground shadow-lg shadow-orange-500/20">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-base tracking-tight">
                    Replay
                  </span>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    Suporte Técnico
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="gap-1 px-2 py-2">
            {navOrder.map((id) => {
              const item = NAV_CONFIG[id]
              const prefs = navPreferences[id]

              // Visibility Check
              if (!prefs.visible) return null
              if (isMobile && !prefs.mobileVisible) return null

              const isActive = location.pathname.startsWith(item.path)

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className="transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm"
                  >
                    <NavLink to={item.path}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border shadow-sm">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold">
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        {user?.role === 'admin' ? 'Administrador' : 'Agente'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg">
                          {user?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setIsSettingsOpen(true)}
                      className="gap-2 cursor-pointer"
                    >
                      <Settings className="size-4" />
                      Personalizar Menu
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </ShadcnSidebar>

      <MenuCustomizationDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
