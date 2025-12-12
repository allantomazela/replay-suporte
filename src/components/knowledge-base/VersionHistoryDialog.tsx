import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KnowledgeArticle, KnowledgeArticleVersion } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RotateCcw, Clock } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { useToast } from '@/hooks/use-toast'

interface VersionHistoryDialogProps {
  article: KnowledgeArticle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersionHistoryDialog({
  article,
  open,
  onOpenChange,
}: VersionHistoryDialogProps) {
  const { restoreArticleVersion, getKBPermissions, user } = useAppContext()
  const { toast } = useToast()
  const permissions = getKBPermissions(article.author)

  const handleRestore = async (version: KnowledgeArticleVersion) => {
    await restoreArticleVersion(article.id, version.id)
    toast({
      title: 'Versão Restaurada',
      description: `O artigo foi revertido para a versão ${version.versionNumber}.`,
    })
    onOpenChange(false)
  }

  const versions = [...(article.versions || [])].reverse()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Versões</DialogTitle>
          <DialogDescription>
            Veja e restaure versões anteriores deste artigo.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Current Version */}
            <div className="border rounded-lg p-4 bg-muted/30 border-l-4 border-l-primary">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    Versão Atual
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Ativa
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Editado por {article.author || 'Desconhecido'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(article.updatedAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* History */}
            {versions.length > 0 ? (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        Versão {version.versionNumber}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Editado por {version.updatedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(version.updatedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                    {permissions.canRestore && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        className="gap-2"
                      >
                        <RotateCcw className="h-3 w-3" /> Restaurar
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">
                      Título: {version.title}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma versão anterior registrada.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
