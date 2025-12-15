import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { NAV_CONFIG, NavItemConfig } from '@/lib/nav-config'
import { useAppContext } from '@/context/AppContext'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Settings,
  LogOut,
  ChevronsUpDown,
  ChevronRight,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user, logout, navOrder, navPreferences, iconSet, customIcons } =
    useAppContext()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()
  const isMobile = useIsMobile()

  // Helper to render icon based on settings
  const renderIcon = (item: NavItemConfig) => {
    const customIconUrl = customIcons[item.id]
    if (customIconUrl) {
      return (
        <img
          src={customIconUrl}
          alt={item.label}
          className="size-4 object-contain rounded-[2px]"
        />
      )
    }

    const Icon = item.icon
    const strokeWidth = iconSet === 'bold' ? 3 : iconSet === 'minimal' ? 1.5 : 2

    return <Icon className="size-4" strokeWidth={strokeWidth} />
  }

  // Recursive Item Renderer
  const SidebarItem = ({
    item,
    isSub = false,
  }: {
    item: NavItemConfig
    isSub?: boolean
  }) => {
    if (!item) return null

    // Check Roles
    if (
      item.allowedRoles &&
      user?.role &&
      !item.allowedRoles.includes(user.role)
    ) {
      return null
    }

    // Deprecated adminOnly check fallback
    if (item.adminOnly && user?.role !== 'admin') {
      return null
    }

    const prefs = navPreferences[item.id]
    if (!prefs?.visible) return null
    if (isMobile && !prefs?.mobileVisible) return null

    const hasChildren = item.children && item.children.length > 0
    const isActive = location.pathname === item.path

    // Check if any child matches current path for expanding parent
    const isChildActive =
      hasChildren &&
      item.children?.some((childId) => {
        const child = NAV_CONFIG[childId]
        return location.pathname === child.path
      })

    const isGroupActive = isActive || isChildActive

    if (hasChildren) {
      return (
        <Collapsible
          asChild
          defaultOpen={isGroupActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={isGroupActive}
                className={cn(
                  'transition-all duration-200',
                  isGroupActive &&
                  'bg-sidebar-accent text-sidebar-accent-foreground font-semibold',
                )}
              >
                {renderIcon(item)}
                <span>{item.label}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children!.map((childId) => (
                  <SidebarItem
                    key={childId}
                    item={NAV_CONFIG[childId]}
                    isSub={true}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    // Leaf Item
    if (isSub) {
      return (
        <SidebarMenuSubItem key={item.id}>
          <SidebarMenuSubButton
            asChild
            isActive={isActive}
            className={cn(
              'transition-all duration-200',
              isActive &&
              'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2',
            )}
          >
            <NavLink to={item.path}>
              {renderIcon(item)}
              <span>{item.label}</span>
            </NavLink>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      )
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className={cn(
            'transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-sidebar-accent/50',
            isActive &&
            'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm border-l-4 border-primary rounded-l-none pl-3',
          )}
        >
          <NavLink to={item.path}>
            {renderIcon(item)}
            <span>{item.label}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

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
                <img
                  src="/logo.svg"
                  alt="Logo Replay"
                  className="h-12 w-12 object-contain"
                />
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
              return <SidebarItem key={id} item={item} />
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
                    <Avatar className="h-12 w-12 rounded-lg border-2 border-sidebar-border shadow-md ring-2 ring-sidebar-accent/20">
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.name}
                        className="object-cover"
                        loading="eager"
                      />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        {user?.role === 'admin' ? 'Administrador' : user?.role}
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
