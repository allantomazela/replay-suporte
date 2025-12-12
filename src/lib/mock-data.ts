import {
  Client,
  Ticket,
  User,
  CustomFieldDefinition,
  KnowledgeArticle,
  KnowledgeCategory,
} from '@/types'
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
    city: 'Rio de Janeiro/RJ',
    phone: '(21) 99999-8888',
    arenaCode: 'MAR01',
    arenaName: 'Maracanã',
    active: true,
    contractType: 'Premium SLA 4h',
    technicalManager: 'Roberto Carlos',
  },
  {
    id: 'c2',
    name: 'Carlos Santos',
    city: 'São Paulo/SP',
    phone: '(11) 98888-7777',
    arenaCode: 'ALL01',
    arenaName: 'Allianz Parque',
    active: true,
    contractType: 'Standard SLA 24h',
    technicalManager: 'Marcos Assunção',
  },
  {
    id: 'c3',
    name: 'Mariana Costa',
    city: 'Rio de Janeiro/RJ',
    phone: '(21) 97777-6666',
    arenaCode: 'SJA01',
    arenaName: 'São Januário',
    active: true,
    contractType: 'Enterprise',
    technicalManager: 'Juninho P.',
  },
  {
    id: 'c4',
    name: 'Roberto Souza',
    city: 'Porto Alegre/RS',
    phone: '(51) 96666-5555',
    arenaCode: 'GRE01',
    arenaName: 'Arena do Grêmio',
    active: false,
    contractType: 'Standard SLA 24h',
    technicalManager: 'Renato P.',
  },
]

export const MOCK_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'priority',
    label: 'Prioridade',
    type: 'select',
    options: ['Baixa', 'Média', 'Alta', 'Crítica'],
    required: true,
    placeholder: 'Selecione a prioridade',
  },
  {
    id: 'problemType',
    label: 'Tipo de Problema',
    type: 'select',
    options: [
      'Hardware',
      'Software',
      'Rede',
      'Operacional',
      'Infraestrutura',
      'Outro',
    ],
    required: true,
    placeholder: 'Selecione o tipo',
  },
  {
    id: 'incidentDate',
    label: 'Data do Incidente',
    type: 'date',
    required: false,
  },
]

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
      customData: {
        priority: 'Alta',
        problemType: 'Software',
      },
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
      customData: {
        priority: 'Baixa',
        problemType: 'Operacional',
      },
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
      customData: {
        priority: 'Crítica',
        problemType: 'Infraestrutura',
      },
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
      customData: {
        priority: 'Média',
        problemType: 'Software',
      },
    },
  ]

  const statuses = ['Aberto', 'Em Andamento', 'Resolvido', 'Pendente'] as const
  const agents = [
    { id: 'u1', name: 'Ana Silva' },
    { id: 'u2', name: 'Carlos Mendes' },
    { id: 'u3', name: 'Beatriz Lima' },
  ]
  const clients = MOCK_CLIENTS
  const priorities = ['Baixa', 'Média', 'Alta', 'Crítica']
  const problemTypes = [
    'Hardware',
    'Software',
    'Rede',
    'Operacional',
    'Infraestrutura',
    'Outro',
  ]

  for (let i = 5; i <= 45; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const client = clients[Math.floor(Math.random() * clients.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = subDays(new Date(), daysAgo)
    const updatedAt =
      status === 'Resolvido'
        ? subHours(createdAt, -Math.floor(Math.random() * 48) - 1)
        : createdAt

    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const problemType =
      problemTypes[Math.floor(Math.random() * problemTypes.length)]

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
      customData: {
        priority,
        problemType,
      },
    })
  }

  return tickets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export const MOCK_TICKETS: Ticket[] = generateMockTickets()

export const MOCK_KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'cat1',
    name: 'Instalação e Configuração',
    description: 'Guias iniciais de setup',
  },
  {
    id: 'cat2',
    name: 'Solução de Problemas',
    description: 'Resolução de erros comuns',
  },
  {
    id: 'cat3',
    name: 'Tutoriais de Uso',
    description: 'Como utilizar as ferramentas',
  },
  {
    id: 'cat4',
    name: 'Integrações',
    description: 'Conectando com outros sistemas',
  },
  {
    id: 'cat5',
    name: 'Políticas e SLAs',
    description: 'Informações contratuais',
  },
]

export const MOCK_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb1',
    title: 'Como configurar o encoder de vídeo',
    excerpt:
      'Passo a passo detalhado para configurar os parâmetros de bitrate e resolução do encoder.',
    content: `
      <h2>Introdução</h2>
      <p>A configuração correta do encoder é essencial para garantir a qualidade da transmissão e gravação dos jogos. Este guia cobre os modelos mais comuns utilizados em nossas arenas.</p>
      
      <h3>Requisitos Mínimos</h3>
      <ul>
        <li>Conexão de internet estável (min. 10Mbps upload)</li>
        <li>Cabo HDMI certificado</li>
        <li>Acesso à rede local</li>
      </ul>

      <h3>Passo a Passo</h3>
      <p>1. Conecte o encoder à energia e à rede.</p>
      <p>2. Acesse o painel de administração via IP (padrão 192.168.1.100).</p>
      <p>3. Navegue até Configurações de Vídeo.</p>
      <p>4. Defina o Bitrate para 4500kbps para 1080p.</p>
      <p>5. Salve e reinicie o dispositivo.</p>

      <p>Se encontrar problemas, verifique se a porta 1935 está liberada no firewall.</p>
    `,
    categoryId: 'cat1',
    categoryName: 'Instalação e Configuração',
    author: 'Ana Silva',
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: subDays(new Date(), 10).toISOString(),
    tags: ['encoder', 'video', 'setup'],
    views: 1240,
    helpfulCount: 45,
  },
  {
    id: 'kb2',
    title: 'Erro 500 ao fazer upload de arquivos',
    excerpt:
      'Diagnóstico e solução para erros de servidor durante o envio de arquivos grandes.',
    content: `
      <h2>Sintomas</h2>
      <p>Ao tentar enviar arquivos maiores que 100MB, o sistema retorna erro HTTP 500 após cerca de 30 segundos.</p>

      <h2>Causa</h2>
      <p>Geralmente, isso é causado por um timeout no proxy reverso ou limite de tamanho de corpo da requisição no Nginx.</p>

      <h2>Solução</h2>
      <p>Entre em contato com o suporte de infraestrutura para ajustar o parâmetro <code>client_max_body_size</code> para 500M e aumentar o timeout para 300s.</p>
      
      <p>Como solução paliativa, tente dividir o arquivo em partes menores ou usar uma rede cabeada mais rápida.</p>
    `,
    categoryId: 'cat2',
    categoryName: 'Solução de Problemas',
    author: 'Carlos Mendes',
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 45).toISOString(),
    tags: ['erro', 'upload', 'servidor'],
    views: 856,
    helpfulCount: 120,
  },
  {
    id: 'kb3',
    title: 'Guia de Marcação de Eventos (Tags)',
    excerpt:
      'Aprenda como marcar gols, faltas e cartões durante a partida usando a interface web.',
    content: `
      <h2>Visão Geral</h2>
      <p>A marcação de eventos é fundamental para a geração de highlights automáticos. Nossa ferramenta permite marcação em tempo real com atalhos de teclado.</p>

      <h3>Atalhos Principais</h3>
      <ul>
        <li><strong>G</strong> - Gol</li>
        <li><strong>F</strong> - Falta</li>
        <li><strong>C</strong> - Cartão Amarelo</li>
        <li><strong>V</strong> - Cartão Vermelho</li>
        <li><strong>Espaço</strong> - Pausar/Reproduzir</li>
      </ul>

      <p>Lembre-se de sincronizar o relógio do sistema com o relógio do árbitro antes do início da partida.</p>
    `,
    categoryId: 'cat3',
    categoryName: 'Tutoriais de Uso',
    author: 'Beatriz Lima',
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    tags: ['eventos', 'tutorial', 'operacao'],
    views: 2100,
    helpfulCount: 310,
  },
  {
    id: 'kb4',
    title: 'Integração com Placar Eletrônico',
    excerpt:
      'Como conectar o sistema Replay ao placar eletrônico da arena para sincronização automática.',
    content: `
      <p>Documentação técnica para integradores.</p>
      <p>Utilizamos protocolo serial RS-232 ou WebSocket para comunicação.</p>
      <p>Consulte a API Docs para obter os endpoints de webhook disponíveis.</p>
    `,
    categoryId: 'cat4',
    categoryName: 'Integrações',
    author: 'Ana Silva',
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: subDays(new Date(), 60).toISOString(),
    tags: ['api', 'placar', 'integracao'],
    views: 430,
    helpfulCount: 12,
  },
  {
    id: 'kb5',
    title: 'Níveis de Serviço (SLA) para Suporte',
    excerpt:
      'Entenda os tempos de resposta garantidos para cada tipo de contrato.',
    content: `
      <h2>SLA de Resposta</h2>
      <ul>
        <li><strong>Crítico:</strong> 1 hora (24/7)</li>
        <li><strong>Alto:</strong> 4 horas (Horário Comercial)</li>
        <li><strong>Médio:</strong> 8 horas (Horário Comercial)</li>
        <li><strong>Baixo:</strong> 24 horas (Horário Comercial)</li>
      </ul>
      
      <p>Clientes Enterprise possuem gerente de conta dedicado e prioridade na fila.</p>
    `,
    categoryId: 'cat5',
    categoryName: 'Políticas e SLAs',
    author: 'Ana Silva',
    createdAt: subDays(new Date(), 120).toISOString(),
    updatedAt: subDays(new Date(), 120).toISOString(),
    tags: ['sla', 'contrato', 'suporte'],
    views: 150,
    helpfulCount: 5,
  },
]
