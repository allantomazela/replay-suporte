# Sistema Replay Suporte

Sistema de suporte para prestação de serviços a empresa Replay Sports.

## 🚀 Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Supabase** - Backend (banco de dados, autenticação, real-time)
- **React Query** - Gerenciamento de estado e cache
- **Shadcn UI** - Componentes UI
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento

## 📋 Pré-requisitos

- Node.js 18+ (recomendado: 22+)
- npm, pnpm ou yarn
- Conta no Supabase (para produção)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd replay-suporte
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp .env.example .env-dev

# Edite o arquivo .env-dev com suas credenciais
```

4. Configure o Supabase:
   - Execute o SQL em `schema.sql` no Supabase Dashboard > SQL Editor
   - Configure as variáveis de ambiente com suas credenciais do Supabase

5. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 🔐 Variáveis de Ambiente

### Obrigatórias

- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anon do Supabase

### Opcionais (mas Recomendadas)

- `VITE_ADMIN_EMAIL` - Email único do administrador
- `VITE_ADMIN_EMAILS` - Lista de emails de administradores (separados por vírgula)

**Documentação completa**: Ver `ENV_VARIABLES.md`

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento
npm run dev        # Alternativa para desenvolvimento

# Build
npm run build      # Build para produção
npm run build:dev  # Build para desenvolvimento
npm run build:prod # Build para produção (explicito)

# Qualidade de Código
npm run lint       # Executa linter
npm run lint:fix   # Corrige problemas automaticamente
npm run format     # Formata código com Prettier

# Validação
npm run validate   # Valida código antes do deploy

# Preview
npm run preview    # Visualiza build de produção localmente
```

## 🚀 Deploy para Produção

### Pré-requisitos

1. ✅ Variáveis de ambiente configuradas no servidor
2. ✅ Build testado localmente
3. ✅ RLS policies revisadas no Supabase
4. ✅ Validação executada: `npm run validate`

### Passos para Deploy

1. **Configure variáveis de ambiente no servidor**
   - Crie arquivo `.env-prod` ou configure no painel do servidor
   - Configure todas as variáveis obrigatórias

2. **Execute o build de produção**
   ```bash
   npm run build:prod
   ```

3. **Teste o build localmente**
   ```bash
   npm run preview
   ```
   - Verifique se tudo funciona corretamente
   - Teste login, navegação e funcionalidades principais

4. **Valide antes do deploy**
   ```bash
   npm run validate
   ```
   - Corrija quaisquer erros encontrados

5. **Faça deploy dos arquivos**
   - Faça upload da pasta `dist/` para seu servidor
   - Configure servidor web (Nginx, Apache, etc.) para servir os arquivos estáticos
   - Configure redirecionamento para `index.html` (SPA routing)

### Configuração do Servidor Web

#### Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Checklist Pós-Deploy

- [ ] Verificar se aplicação carrega corretamente
- [ ] Testar login/logout
- [ ] Verificar se dados carregam do Supabase
- [ ] Testar funcionalidades principais (CRUD)
- [ ] Verificar console do navegador (sem erros)
- [ ] Monitorar logs do servidor nas primeiras 24h

## 📚 Estrutura do Projeto

```
replay-suporte/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/     # Componentes React
│   ├── context/        # Context API
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e helpers
│   ├── pages/          # Páginas da aplicação
│   └── types/          # TypeScript types
├── scripts/            # Scripts utilitários
├── schema.sql          # Schema do banco de dados
└── package.json
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado no Supabase
- ✅ Sanitização XSS implementada
- ✅ Validação de inputs com Zod
- ✅ Error boundaries para tratamento de erros
- ✅ Variáveis de ambiente para configurações sensíveis

**Documentação de segurança**: Ver `SECURITY_AUDIT.md` e `SECURITY_IMPROVEMENTS.md`

## 🧪 Testes

Atualmente, o projeto não possui testes automatizados. Para adicionar:

1. Instale Vitest e React Testing Library
2. Crie testes em `src/**/*.test.tsx`
3. Execute com `npm test`

## 📖 Documentação Adicional

- `ENV_VARIABLES.md` - Variáveis de ambiente
- `SETUP.md` - Guia de configuração
- `SECURITY_AUDIT.md` - Auditoria de segurança
- `SECURITY_IMPROVEMENTS.md` - Melhorias de segurança implementadas
- `NEXT_STEPS.md` - Próximos passos e melhorias

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário da Replay Sports.

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação em `SETUP.md`
2. Verifique os logs do console do navegador
3. Verifique os logs do Supabase Dashboard
4. Execute `npm run validate` para verificar configuração

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")
