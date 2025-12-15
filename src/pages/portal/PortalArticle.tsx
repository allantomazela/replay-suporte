import { useAppContext } from '@/context/AppContext'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { sanitizeHTML } from '@/lib/sanitize'

export default function PortalArticle() {
  const { id } = useParams<{ id: string }>()
  const { getArticleById } = useAppContext()
  const article = id ? getArticleById(id) : undefined

  if (!article || !article.isPublic) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O artigo que você procura não existe ou não está disponível.
        </p>
        <Button asChild>
          <Link to="/portal">Voltar para o início</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6 pl-0">
        <Link to="/portal">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="space-y-4 mb-8">
        <Badge variant="secondary">{article.categoryName}</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(article.updatedAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-none">
        <CardContent className="p-0 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.content) }} />
        </CardContent>
      </Card>
    </div>
  )
}
