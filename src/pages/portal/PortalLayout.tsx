import { Outlet, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Logo Replay" 
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold text-xl tracking-tight">
              Replay Ajuda
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Área do Cliente</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Replay Sports. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
