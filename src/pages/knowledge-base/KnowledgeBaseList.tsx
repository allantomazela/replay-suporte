import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  X,
  Plus,
  Settings,
} from 'lucide-react'
import { ArticleCard } from '@/components/knowledge-base/ArticleCard'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { CategoryManagerDialog } from '@/components/knowledge-base/CategoryManagerDialog'

export default function KnowledgeBaseList() {
  const { knowledgeArticles, knowledgeCategories } = useAppContext()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortOption, setSortOption] = useState<string>('updated')

  // Dialog State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  // Derived filtered/sorted articles
  const filteredArticles = useMemo(() => {
    return knowledgeArticles
      .filter((article) => {
        // Search Filter
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchLower))

        // Category Filter
        const matchesCategory =
          categoryFilter === 'all' || article.categoryId === categoryFilter

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        // Sort Logic
        switch (sortOption) {
          case 'updated':
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
          case 'created':
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          case 'views':
            return b.views - a.views
          case 'az':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
  }, [knowledgeArticles, searchTerm, categoryFilter, sortOption])

  const handleResetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setSortOption('updated')
  }

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'all'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Base de Conhecimento
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Encontre guias, tutoriais e soluções para os problemas mais comuns
            do Replay.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="flex-1 md:flex-none"
          >
            <Settings className="mr-2 h-4 w-4" /> Categorias
          </Button>
          <Button asChild className="flex-1 md:flex-none">
            <Link to="/knowledge-base/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Artigo
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="relative md:col-span-6 lg:col-span-7">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, conteúdo ou tags..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3 lg:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {knowledgeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="md:col-span-3 lg:col-span-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recentes</SelectItem>
                <SelectItem value="created">Data de Criação</SelectItem>
                <SelectItem value="views">Mais Vistos</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Encontrados <strong>{filteredArticles.length}</strong> artigos
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-3 w-3" /> Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Category Tags (Quick Filter) */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90 text-sm py-1 px-3"
          onClick={() => setCategoryFilter('all')}
        >
          Todas
        </Badge>
        {knowledgeCategories.map((cat) => (
          <Badge
            key={cat.id}
            variant={categoryFilter === cat.id ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80 transition-colors text-sm py-1 px-3"
            onClick={() => setCategoryFilter(cat.id)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10 border-dashed">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não encontramos nenhum resultado para sua busca. Tente termos
            diferentes ou limpe os filtros.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={handleResetFilters}
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      <CategoryManagerDialog
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
      />
    </div>
  )
}
