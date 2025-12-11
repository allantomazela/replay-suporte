import * as React from 'react'
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  FileText,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { DialogProps } from '@radix-ui/react-dialog'

interface CommandMenuProps extends DialogProps {
  setOpen: (open: boolean) => void
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const navigate = useNavigate()
  const { clients, tickets } = useAppContext()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem
            onSelect={() => runCommand(() => navigate('/dashboard'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Clientes">
          {clients.slice(0, 5).map((client) => (
            <CommandItem
              key={client.id}
              onSelect={() =>
                runCommand(() => navigate(`/clients/${client.id}`))
              }
            >
              <Users className="mr-2 h-4 w-4" />
              <span>{client.name}</span>
              <span className="ml-2 text-muted-foreground text-xs">
                {client.club}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Atendimentos Recentes">
          {tickets.slice(0, 5).map((ticket) => (
            <CommandItem
              key={ticket.id}
              onSelect={() =>
                runCommand(() => navigate(`/tickets/${ticket.id}`))
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>
                #{ticket.id} - {ticket.title}
              </span>
              <span className="ml-2 text-muted-foreground text-xs">
                {ticket.clientName}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
