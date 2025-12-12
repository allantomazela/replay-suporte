import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  Tag,
  Share2,
  Printer,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function KnowledgeBaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getArticleById } = useAppContext()

  const article = id ? getArticleById(id) : undefined

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Artigo não encontrado</h2>
        <p className="text-muted-foreground">
          O artigo que você procura não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/knowledge-base')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Base de
          Conhecimento
        </Button>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link to="/knowledge-base">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="text-sm py-1">{article.categoryName}</Badge>
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Atualizado em{' '}
              {format(new Date(article.updatedAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
              <Eye className="h-3 w-3" /> {article.views}
            </span>
            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
              <ThumbsUp className="h-3 w-3" /> {article.helpfulCount}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
              {/* Utilizing Dangerously Set Inner HTML for rich content simulation */}
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted/30 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-1">Este artigo foi útil?</h4>
              <p className="text-sm text-muted-foreground">
                Seu feedback nos ajuda a melhorar.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" /> Sim
              </Button>
              <Button variant="ghost" size="sm">
                Não
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
                Ações
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" /> Imprimir Artigo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
                Metadados
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>
                    {format(new Date(article.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID do Artigo:</span>
                  <span className="font-mono text-xs">{article.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
                    {article.tags.map((t) => (
                      <span
                        key={t}
                        className="bg-muted px-1.5 py-0.5 rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
