import { useState } from 'react'
import { Search, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { CommandMenu } from '@/components/CommandMenu'
import { ShortcutsDialog } from '@/components/shortcuts/ShortcutsDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export function Header() {
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 transition-all">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      {/* Search Input Trigger */}
      <div className="flex-1">
        <div className="relative max-w-md md:w-full">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="relative flex h-9 w-full items-center rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground shadow-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          >
            <Search className="mr-2 h-4 w-4 opacity-50" />
            <span className="hidden sm:inline-flex">Buscar...</span>
            <span className="sm:hidden">Buscar</span>
            <kbd className="pointer-events-none absolute right-3 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
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
                className="hidden sm:flex h-9 w-9"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Atalhos de Teclado</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <NotificationCenter />
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
