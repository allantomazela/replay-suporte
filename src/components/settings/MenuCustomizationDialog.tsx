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
import { ArrowUp, ArrowDown, Upload, X, Check } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRef } from 'react'

interface MenuCustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuCustomizationDialog({
  open,
  onOpenChange,
}: MenuCustomizationDialogProps) {
  const {
    navOrder,
    navPreferences,
    updateNavOrder,
    updateNavPreference,
    iconSet,
    updateIconSet,
    customIcons,
    uploadCustomIcon,
    resetCustomIcon,
  } = useAppContext()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUploadId = useRef<string | null>(null)

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
    updateNavPreference(id, { [type]: !navPreferences[id]?.[type] })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && currentUploadId.current) {
      const reader = new FileReader()
      reader.onloadend = () => {
        uploadCustomIcon(currentUploadId.current!, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerUpload = (id: string) => {
    currentUploadId.current = id
    fileInputRef.current?.click()
  }

  // Get all items that can be customized (Top level + children)
  // For ordering, we only show top level.
  // For visibility/icons, we show everything.
  const allItems = Object.values(NAV_CONFIG)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalizar Menu Lateral</DialogTitle>
          <DialogDescription>
            Ajuste a ordem, visibilidade e aparência dos itens do menu.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order">Ordem e Visibilidade</TabsTrigger>
            <TabsTrigger value="appearance">Ícones e Estilo</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-sm font-medium text-muted-foreground mb-2">
              <div>Item</div>
              <div className="text-center">Visível</div>
              <div className="text-center">Mobile</div>
              <div className="text-center">Ordem</div>
            </div>

            <div className="space-y-2">
              {navOrder.map((id, index) => {
                const item = NAV_CONFIG[id]
                const prefs = navPreferences[id] || {
                  visible: true,
                  mobileVisible: true,
                }
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
            <p className="text-xs text-muted-foreground mt-2">
              * Itens agrupados (submenus) herdam a visibilidade do pai.
            </p>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Estilo do Conjunto de Ícones</Label>
              <Select
                value={iconSet}
                onValueChange={(val: any) => updateIconSet(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão (Outline)</SelectItem>
                  <SelectItem value="bold">Bold (Espesso)</SelectItem>
                  <SelectItem value="minimal">Minimalista (Fino)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ícones Personalizados</Label>
              <p className="text-sm text-muted-foreground">
                Faça upload de ícones específicos para substituir os padrões.
              </p>

              <div className="grid gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
                {allItems.map((item) => {
                  const hasCustom = !!customIcons[item.id]
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div className="flex items-center gap-3">
                        {hasCustom ? (
                          <img
                            src={customIcons[item.id]}
                            alt={item.label}
                            className="h-6 w-6 object-contain bg-muted rounded-md p-0.5"
                          />
                        ) : (
                          <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-md">
                            <Icon className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {hasCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive"
                            onClick={() => resetCustomIcon(item.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => triggerUpload(item.id)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleFileChange}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Concluído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
