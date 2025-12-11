import { useState } from 'react'
import { Menu, Search, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarContent } from '@/components/Sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { CommandMenu } from '@/components/CommandMenu'
import { ShortcutsDialog } from '@/components/shortcuts/ShortcutsDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Mobile Menu Trigger */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80 border-r-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidebarContent
              isMobile={true}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Search Input Trigger */}
      <div className="flex-1">
        <div className="relative max-w-md md:w-full">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="relative flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm ring-offset-background hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="mr-2 h-4 w-4 opacity-50" />
            <span className="hidden sm:inline-flex">Buscar...</span>
            <span className="sm:hidden">Buscar</span>
            <kbd className="pointer-events-none absolute right-3 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShortcutsOpen(true)}
                className="hidden sm:flex"
              >
                <Keyboard className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Atalhos de Teclado</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ModeToggle />
      </div>

      {/* Dialogs */}
      <CommandMenu open={isCommandOpen} setOpen={setIsCommandOpen} />
      <ShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </header>
  )
}
