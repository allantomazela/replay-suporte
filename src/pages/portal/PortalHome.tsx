import { useAppContext } from '@/context/AppContext'
import { Input } from '@/components/ui/input'
import { Search, ArrowRight, FileText } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PortalHome() {
  const { knowledgeArticles, knowledgeCategories } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')

  const publicArticles = knowledgeArticles.filter((a) => a.isPublic)

  const filteredArticles = publicArticles
    .filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5)

  const categoriesWithArticles = knowledgeCategories.filter((cat) =>
    publicArticles.some((a) => a.categoryId === cat.id),
  )

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Como podemos ajudar?
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="h-12 pl-12 bg-background text-foreground shadow-lg border-0"
              placeholder="Busque por artigos, tutoriais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
        {/* Search Results or Popular Articles */}
        {searchTerm ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Resultados da busca</h2>
            <div className="grid gap-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/portal/article/${article.id}`}
                    className="block group"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhum artigo encontrado.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithArticles.map((cat) => (
                <Link
                  key={cat.id}
                  to="#" // In a real app, this would go to a category page
                  className="block group h-full"
                >
                  <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {cat.description}
                      </p>
                      <div className="text-xs font-medium text-muted-foreground flex items-center">
                        {
                          publicArticles.filter((a) => a.categoryId === cat.id)
                            .length
                        }{' '}
                        artigos <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Artigos Populares</h2>
              <div className="grid gap-4">
                {publicArticles
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map((article) => (
                    <Link
                      key={article.id}
                      to={`/portal/article/${article.id}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="bg-primary/10 p-3 rounded-md text-primary shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {article.categoryName}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
