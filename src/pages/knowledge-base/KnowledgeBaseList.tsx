import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { usePagination } from '@/hooks/use-pagination'
import { Pagination } from '@/components/ui/pagination'
import { useDebounce } from '@/hooks/use-debounce'
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
  Check,
  Bell,
  BellOff,
} from 'lucide-react'
import { ArticleCard } from '@/components/knowledge-base/ArticleCard'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { CategoryManagerDialog } from '@/components/knowledge-base/CategoryManagerDialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function KnowledgeBaseList() {
  const {
    knowledgeArticles,
    knowledgeCategories,
    getKBPermissions,
    subscribe,
    unsubscribe,
    subscriptions,
    user,
  } = useAppContext()
  const permissions = getKBPermissions()
  const { toast } = useToast()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<string>('updated_desc')

  // Dialog State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  // Derived filtered/sorted articles
  const filteredArticles = useMemo(() => {
    return knowledgeArticles
      .filter((article) => {
        // Advanced Search Filter (Title, Excerpt, Content, Tags)
        const searchLower = debouncedSearchTerm.toLowerCase()
        const matchesSearch =
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchLower))

        // Multi-Category Filter
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(article.categoryId)

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        // Enhanced Sort Logic
        switch (sortOption) {
          case 'updated_desc':
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
          case 'updated_asc':
            return (
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            )
          case 'created_desc':
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          case 'created_asc':
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          case 'views_desc':
            return b.views - a.views
          case 'az':
            return a.title.localeCompare(b.title)
          case 'za':
            return b.title.localeCompare(a.title)
          default:
            return 0
        }
      })
  }, [knowledgeArticles, debouncedSearchTerm, selectedCategories, sortOption])

  // Paginação
  const {
    paginatedData: paginatedArticles,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
  } = usePagination(filteredArticles, { pageSize: 20 })

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSortOption('updated_desc')
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategories.length > 0

  // Category Subscription Logic
  const getCategorySubscription = (categoryId: string) =>
    subscriptions.find(
      (s) =>
        s.userId === user?.id &&
        s.type === 'category' &&
        s.targetId === categoryId,
    )

  const toggleCategorySubscription = (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
  ) => {
    e.stopPropagation()
    const sub = getCategorySubscription(categoryId)
    if (sub) {
      unsubscribe(sub.id)
      toast({
        title: 'Inscrição Removida',
        description: `Você não receberá mais notificações da categoria ${categoryName}.`,
      })
    } else {
      subscribe('category', categoryId, categoryName)
      toast({
        title: 'Inscrito na Categoria',
        description: `Você será notificado sobre atualizações em ${categoryName}.`,
      })
    }
  }

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
          {permissions.canManageCategories && (
            <Button
              variant="outline"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="flex-1 md:flex-none"
            >
              <Settings className="mr-2 h-4 w-4" /> Categorias
            </Button>
          )}
          {permissions.canCreate && (
            <Button asChild className="flex-1 md:flex-none">
              <Link to="/knowledge-base/new">
                <Plus className="mr-2 h-4 w-4" /> Novo Artigo
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Advanced Search */}
          <div className="relative md:col-span-6 lg:col-span-7">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, conteúdo ou tags..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Enhanced Multi-Category Filter */}
          <div className="md:col-span-3 lg:col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedCategories.length === 0
                    ? 'Todas as Categorias'
                    : `${selectedCategories.length} selecionada(s)`}
                  <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Filtrar categorias..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {knowledgeCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          onSelect={() => toggleCategory(category.id)}
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              selectedCategories.includes(category.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check className={cn('h-4 w-4')} />
                          </div>
                          <span>{category.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {selectedCategories.length > 0 && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => setSelectedCategories([])}
                            className="justify-center text-center font-medium text-muted-foreground"
                          >
                            Limpar Filtros
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Enhanced Sort */}
          <div className="md:col-span-3 lg:col-span-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_desc">Recentes</SelectItem>
                <SelectItem value="updated_asc">
                  Antigos (Atualização)
                </SelectItem>
                <SelectItem value="created_desc">
                  Criados Recentemente
                </SelectItem>
                <SelectItem value="created_asc">Criados Antigamente</SelectItem>
                <SelectItem value="views_desc">Mais Vistos</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground mr-2">
                Filtros ativos:
              </span>
              {selectedCategories.map((catId) => {
                const cat = knowledgeCategories.find((c) => c.id === catId)
                const isSubscribed = !!getCategorySubscription(catId)
                return (
                  <Badge
                    key={catId}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    {cat?.name}
                    <div
                      className={cn(
                        'cursor-pointer hover:bg-muted p-0.5 rounded-full',
                        isSubscribed && 'text-primary',
                      )}
                      onClick={(e) =>
                        toggleCategorySubscription(e, catId, cat?.name || '')
                      }
                      title={
                        isSubscribed ? 'Cancelar inscrição' : 'Receber alertas'
                      }
                    >
                      {isSubscribed ? (
                        <Bell className="h-3 w-3 fill-current" />
                      ) : (
                        <BellOff className="h-3 w-3" />
                      )}
                    </div>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                      onClick={() => toggleCategory(catId)}
                    />
                  </Badge>
                )
              })}
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Busca: "{searchTerm}"
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground shrink-0 ml-auto"
            >
              <X className="mr-2 h-3 w-3" /> Limpar Tudo
            </Button>
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {paginatedArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {paginatedArticles.length} de {totalItems} artigos
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
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

      {permissions.canManageCategories && (
        <CategoryManagerDialog
          open={isCategoryManagerOpen}
          onOpenChange={setIsCategoryManagerOpen}
        />
      )}
    </div>
  )
}
