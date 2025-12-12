import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'

const articleSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  content: z.string().min(20, 'O conteúdo deve ter pelo menos 20 caracteres'),
  tags: z.string().optional(), // Comma separated
})

type ArticleFormValues = z.infer<typeof articleSchema>

export default function KnowledgeBaseEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getArticleById,
    knowledgeCategories,
    addArticle,
    updateArticle,
    user,
    getKBPermissions,
  } = useAppContext()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!id
  const article = id ? getArticleById(id) : undefined

  // Permissions check
  const permissions = getKBPermissions(article?.author)

  useEffect(() => {
    if (isEditing && article && !permissions.canEdit) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para editar este artigo.',
        variant: 'destructive',
      })
      navigate('/knowledge-base')
    }
    if (!isEditing && !permissions.canCreate) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para criar artigos.',
        variant: 'destructive',
      })
      navigate('/knowledge-base')
    }
  }, [isEditing, article, permissions, navigate, toast])

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      content: '',
      tags: '',
    },
  })

  useEffect(() => {
    if (isEditing && article) {
      form.reset({
        title: article.title,
        categoryId: article.categoryId,
        content: article.content,
        tags: article.tags.join(', '),
      })
    } else if (isEditing && !article) {
      toast({
        title: 'Artigo não encontrado',
        description: 'Redirecionando para a lista...',
        variant: 'destructive',
      })
      navigate('/knowledge-base')
    }
  }, [isEditing, article, form, navigate, toast])

  const onSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    try {
      const category = knowledgeCategories.find(
        (c) => c.id === values.categoryId,
      )
      const tagsArray = values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      // Generate excerpt from content (strip HTML)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = values.content
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      const excerpt =
        plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '')

      if (isEditing && id) {
        updateArticle(id, {
          title: values.title,
          categoryId: values.categoryId,
          categoryName: category?.name || 'Geral',
          content: values.content,
          excerpt,
          tags: tagsArray,
        })
        toast({
          title: 'Artigo Atualizado',
          description: 'Uma nova versão foi salva no histórico.',
        })
        navigate(`/knowledge-base/articles/${id}`)
      } else {
        addArticle({
          title: values.title,
          categoryId: values.categoryId,
          categoryName: category?.name || 'Geral',
          content: values.content,
          excerpt,
          tags: tagsArray,
          author: user?.name || 'Sistema',
          tags: tagsArray,
        })
        toast({
          title: 'Artigo Criado',
          description: 'O novo artigo foi publicado com sucesso.',
        })
        navigate('/knowledge-base')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o artigo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link
            to={
              isEditing ? `/knowledge-base/articles/${id}` : '/knowledge-base'
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar e Voltar
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing
            ? 'Atualize o conteúdo do artigo. Uma nova versão será criada.'
            : 'Crie um novo guia ou tutorial para a base de conhecimento.'}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Artigo</FormLabel>
                    <FormControl>
                      <Input placeholder="Como configurar..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {knowledgeCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (separadas por vírgula)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tutorial, video, configuração"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Escreva o conteúdo do artigo aqui..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? 'Salvar Nova Versão' : 'Publicar Artigo'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
