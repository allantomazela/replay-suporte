import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KnowledgeArticle } from '@/types'
import { Calendar, Eye, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: KnowledgeArticle
}

export const ArticleCard = memo(function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border group h-full flex flex-col">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <Badge variant="outline" className="shrink-0">
            {article.categoryName}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {article.views}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> {article.helpfulCount}
            </span>
          </div>
        </div>
        <Link
          to={`/knowledge-base/articles/${article.id}`}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-semibold text-lg leading-tight">
            {article.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt}
        </p>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground border-t bg-muted/20 p-4">
        <div className="flex items-center gap-2 w-full">
          <Calendar className="h-3 w-3" />
          <span>
            Atualizado{' '}
            {formatDistanceToNow(new Date(article.updatedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          <span className="ml-auto flex items-center gap-1">
            Por {article.author}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
})
