import { useEffect, useRef, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update if content is substantially different to avoid cursor jumps
      // This is a simple check, ideally we would use a more robust comparison
      if (
        editorRef.current.innerHTML === '' ||
        value !== editorRef.current.innerHTML
      ) {
        editorRef.current.innerHTML = value
      }
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <div className="flex items-center gap-1 p-1 border-b bg-muted/40 overflow-x-auto">
        <Toggle
          size="sm"
          onClick={() => execCommand('bold')}
          aria-label="Negrito"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={() => execCommand('italic')}
          aria-label="Itálico"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Toggle
          size="sm"
          onClick={() => execCommand('formatBlock', 'H2')}
          aria-label="Título 1"
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={() => execCommand('formatBlock', 'H3')}
          aria-label="Título 2"
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Toggle
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          aria-label="Lista com marcadores"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          aria-label="Lista numerada"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => execCommand('undo')}
            type="button"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => execCommand('redo')}
            type="button"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'p-4 min-h-[200px] outline-none prose prose-sm max-w-none dark:prose-invert',
          !value && 'relative',
        )}
      />
      {!value && !isFocused && placeholder && (
        <div className="absolute p-4 top-[45px] text-muted-foreground pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  )
}
