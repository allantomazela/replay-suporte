import { KnowledgeArticle } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

interface RelatedArticlesProps {
  currentArticle: KnowledgeArticle
  allArticles: KnowledgeArticle[]
}

export function RelatedArticles({
  currentArticle,
  allArticles,
}: RelatedArticlesProps) {
  const related = allArticles
    .filter((a) => {
      if (a.id === currentArticle.id) return false

      // Match category
      const sameCategory = a.categoryId === currentArticle.categoryId

      // Match tags
      const hasSharedTags = a.tags.some((tag) =>
        currentArticle.tags.includes(tag),
      )

      return sameCategory || hasSharedTags
    })
    .slice(0, 3) // Limit to 3

  if (related.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Artigos Relacionados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {related.map((article) => (
          <Link
            key={article.id}
            to={`/knowledge-base/articles/${article.id}`}
            className="group block"
          >
            <div className="flex items-start gap-3">
              <div className="bg-muted p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {article.excerpt}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
