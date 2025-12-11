import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const shortcuts = [
    { key: '⌘ + K', description: 'Abrir Busca Global' },
    { key: '⌘ + D', description: 'Ir para Dashboard' },
    { key: '⌘ + P', description: 'Ir para Perfil' },
    { key: 'Esc', description: 'Fechar janelas e modais' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos do Teclado
          </DialogTitle>
          <DialogDescription>
            Agilize sua navegação com os seguintes atalhos:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid gap-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm font-medium">
                  {shortcut.description}
                </span>
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
