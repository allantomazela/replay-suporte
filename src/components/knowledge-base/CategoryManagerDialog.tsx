import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'

interface CategoryManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
}: CategoryManagerDialogProps) {
  const {
    knowledgeCategories,
    knowledgeArticles,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAppContext()
  const { toast } = useToast()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newCategoryName.trim()) return

    addCategory({
      name: newCategoryName,
      description: newCategoryDesc,
    })
    setNewCategoryName('')
    setNewCategoryDesc('')
    toast({
      title: 'Categoria Criada',
      description: 'A nova categoria foi adicionada com sucesso.',
    })
  }

  const startEdit = (cat: {
    id: string
    name: string
    description?: string
  }) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDesc(cat.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDesc('')
  }

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return
    updateCategory(editingId, { name: editName, description: editDesc })
    setEditingId(null)
    toast({
      title: 'Categoria Atualizada',
      description: 'As alterações foram salvas com sucesso.',
    })
  }

  const attemptDelete = (id: string) => {
    const hasArticles = knowledgeArticles.some((a) => a.categoryId === id)
    if (hasArticles) {
      toast({
        title: 'Não é possível excluir',
        description:
          'Existem artigos vinculados a esta categoria. Remova-os ou mova-os antes de excluir.',
        variant: 'destructive',
      })
      return
    }
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId)
      setDeleteId(null)
      toast({
        title: 'Categoria Excluída',
        description: 'A categoria foi removida permanentemente.',
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Crie, edite ou remova categorias da Base de Conhecimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Create New */}
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nova Categoria
              </h4>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="cat-name" className="text-xs">
                    Nome
                  </Label>
                  <Input
                    id="cat-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Tutoriais"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="cat-desc" className="text-xs">
                    Descrição
                  </Label>
                  <Input
                    id="cat-desc"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Breve descrição da categoria"
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!newCategoryName.trim()}
                  size="sm"
                  className="mt-1"
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Categorias Existentes</h4>
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                {knowledgeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-2 p-3 border rounded-md bg-card"
                  >
                    {editingId === cat.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nome da categoria"
                        />
                        <Textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Descrição"
                          className="min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3 mr-1" /> Cancelar
                          </Button>
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="h-3 w-3 mr-1" /> Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-sm">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat.description || 'Sem descrição'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {
                              knowledgeArticles.filter(
                                (a) => a.categoryId === cat.id,
                              ).length
                            }{' '}
                            artigos vinculados
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEdit(cat)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => attemptDelete(cat.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
