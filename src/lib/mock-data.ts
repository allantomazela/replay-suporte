import { Client, Ticket, User } from '@/types'
import { subDays, subHours } from 'date-fns'

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Ana Silva',
  email: 'ana.silva@replaysports.com',
  role: 'admin',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Fernando Oliveira',
    email: 'fernando@flamengo.com.br',
    phone: '(21) 99999-8888',
    club: 'Flamengo',
    acquisitionDate: '2023-01-15',
    active: true,
  },
  {
    id: 'c2',
    name: 'Carlos Santos',
    email: 'carlos@palmeiras.com.br',
    phone: '(11) 98888-7777',
    club: 'Palmeiras',
    acquisitionDate: '2023-03-20',
    active: true,
  },
  {
    id: 'c3',
    name: 'Mariana Costa',
    email: 'mariana@vasco.com.br',
    phone: '(21) 97777-6666',
    club: 'Vasco da Gama',
    acquisitionDate: '2023-06-10',
    active: true,
  },
  {
    id: 'c4',
    name: 'Roberto Souza',
    email: 'roberto@gremio.net',
    phone: '(51) 96666-5555',
    club: 'Grêmio',
    acquisitionDate: '2023-08-05',
    active: false,
  },
]

// Generate more realistic mock tickets
const generateMockTickets = (): Ticket[] => {
  const tickets: Ticket[] = [
    {
      id: 't1',
      clientId: 'c1',
      clientName: 'Fernando Oliveira',
      title: 'Erro no upload de vídeo',
      description:
        'Ao tentar subir um vídeo de análise tática, o sistema apresenta erro 500.',
      solutionSteps:
        'Verificado logs do servidor. Problema de permissão na pasta de uploads. Corrigido permissões.',
      status: 'Resolvido',
      createdAt: subDays(new Date(), 5).toISOString(),
      updatedAt: subDays(new Date(), 4).toISOString(),
      responsibleId: 'u1',
      responsibleName: 'Ana Silva',
      attachments: [],
    },
    {
      id: 't2',
      clientId: 'c2',
      clientName: 'Carlos Santos',
      title: 'Dúvida sobre relatório',
      description:
        'Cliente não está encontrando a opção de exportar relatório em PDF.',
      status: 'Em Andamento',
      createdAt: subDays(new Date(), 2).toISOString(),
      updatedAt: subDays(new Date(), 1).toISOString(),
      responsibleId: 'u1',
      responsibleName: 'Ana Silva',
      attachments: [],
    },
    {
      id: 't3',
      clientId: 'c1',
      clientName: 'Fernando Oliveira',
      title: 'Sistema lento no login',
      description: 'Demora de mais de 30 segundos para efetuar login.',
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responsibleId: 'u1',
      responsibleName: 'Ana Silva',
      attachments: [],
    },
    {
      id: 't4',
      clientId: 'c3',
      clientName: 'Mariana Costa',
      title: 'Solicitação de nova feature',
      description: 'Gostaria de adicionar marcações de tempo nos vídeos.',
      status: 'Pendente',
      createdAt: subDays(new Date(), 10).toISOString(),
      updatedAt: subDays(new Date(), 10).toISOString(),
      responsibleId: 'u1',
      responsibleName: 'Ana Silva',
      attachments: [],
    },
  ]

  // Add generated tickets
  const statuses = ['Aberto', 'Em Andamento', 'Resolvido', 'Pendente'] as const
  const agents = [
    { id: 'u1', name: 'Ana Silva' },
    { id: 'u2', name: 'Carlos Mendes' },
    { id: 'u3', name: 'Beatriz Lima' },
  ]
  const clients = MOCK_CLIENTS

  for (let i = 5; i <= 35; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const client = clients[Math.floor(Math.random() * clients.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = subDays(new Date(), daysAgo)
    const updatedAt =
      status === 'Resolvido'
        ? subHours(createdAt, -Math.floor(Math.random() * 48) - 1)
        : createdAt

    tickets.push({
      id: `t${i}`,
      clientId: client.id,
      clientName: client.name,
      title: `Atendimento Simulado ${i}`,
      description: 'Descrição automática para fins de teste de relatório.',
      status: status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      responsibleId: agent.id,
      responsibleName: agent.name,
      attachments: [],
    })
  }

  return tickets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export const MOCK_TICKETS: Ticket[] = generateMockTickets()
