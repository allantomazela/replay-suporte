import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { NAV_CONFIG, NavItemId } from '@/lib/nav-config'
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface MenuCustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuCustomizationDialog({
  open,
  onOpenChange,
}: MenuCustomizationDialogProps) {
  const { navOrder, navPreferences, updateNavOrder, updateNavPreference } =
    useAppContext()

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...navOrder]
    if (direction === 'up') {
      if (index === 0) return
      const temp = newOrder[index - 1]
      newOrder[index - 1] = newOrder[index]
      newOrder[index] = temp
    } else {
      if (index === newOrder.length - 1) return
      const temp = newOrder[index + 1]
      newOrder[index + 1] = newOrder[index]
      newOrder[index] = temp
    }
    updateNavOrder(newOrder)
  }

  const toggleVisibility = (
    id: NavItemId,
    type: 'visible' | 'mobileVisible',
  ) => {
    updateNavPreference(id, { [type]: !navPreferences[id][type] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Personalizar Menu</DialogTitle>
          <DialogDescription>
            Reorganize os itens e escolha o que exibir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-sm font-medium text-muted-foreground mb-2">
            <div>Item</div>
            <div className="text-center">Visível</div>
            <div className="text-center">Mobile</div>
            <div className="text-center">Ordem</div>
          </div>

          <div className="space-y-2">
            {navOrder.map((id, index) => {
              const item = NAV_CONFIG[id]
              const prefs = navPreferences[id]
              const Icon = item.icon

              return (
                <div
                  key={id}
                  className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center p-2 rounded-md border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex justify-center">
                    <Switch
                      checked={prefs.visible}
                      onCheckedChange={() => toggleVisibility(id, 'visible')}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Switch
                      checked={prefs.mobileVisible}
                      onCheckedChange={() =>
                        toggleVisibility(id, 'mobileVisible')
                      }
                    />
                  </div>

                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === navOrder.length - 1}
                      onClick={() => moveItem(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Concluído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
