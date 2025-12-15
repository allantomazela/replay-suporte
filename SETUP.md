# Guia de Configuração e Verificação - Sistema Replay Suporte

Este documento descreve todas as verificações e configurações necessárias para rodar a aplicação através do Cursor.

## ✅ Verificações Realizadas

### 1. Ambiente de Desenvolvimento
- ✅ **Node.js**: v22.14.0 (requerido: 18+)
- ✅ **npm**: 11.4.2
- ⚠️ **Dependências**: Não instaladas (node_modules não existe)

### 2. Estrutura do Projeto
- ✅ Estrutura de pastas completa
- ✅ Arquivos de configuração presentes:
  - `package.json` ✓
  - `vite.config.ts` ✓
  - `tsconfig.json` ✓
  - `tailwind.config.ts` ✓
  - `postcss.config.js` ✓

### 3. Configuração do Supabase
- ✅ Cliente Supabase configurado em `src/lib/supabase.ts`
- ✅ Suporte para configuração via:
  - Variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
  - localStorage (através do componente SupabaseWizard)
- ⚠️ **Arquivos .env não encontrados** - necessário criar

### 4. Configuração do Servidor
- ✅ Vite configurado para rodar na porta **8080** (não 5173 como mencionado no README)
- ✅ Host configurado para `::` (aceita conexões de qualquer interface)

## 📋 Passos para Configuração

### Passo 1: Instalar Dependências

```bash
npm install
```

**Nota**: O projeto possui `pnpm-lock.yaml`, mas também pode usar npm. Se preferir usar pnpm:

```bash
pnpm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Importante**: 
- Substitua `seu-projeto.supabase.co` pela URL do seu projeto Supabase
- Substitua `sua-chave-anon-aqui` pela sua chave anon do Supabase
- Essas credenciais podem ser encontradas no dashboard do Supabase em: Settings > API

### Passo 3: Verificar Configuração do Supabase

A aplicação oferece duas formas de configurar o Supabase:

1. **Via Variáveis de Ambiente** (recomendado para produção):
   - Crie o arquivo `.env` conforme o Passo 2
   - As variáveis serão carregadas automaticamente pelo Vite

2. **Via Interface (SupabaseWizard)**:
   - A aplicação possui um componente de configuração integrado
   - As credenciais são salvas no localStorage
   - Útil para desenvolvimento e testes rápidos

### Passo 4: Iniciar o Servidor de Desenvolvimento

```bash
npm start
# ou
npm run dev
```

A aplicação estará disponível em: **http://localhost:8080**

**Nota**: O README menciona a porta 5173, mas o `vite.config.ts` está configurado para a porta 8080.

## 🔍 Verificações Adicionais Recomendadas

### 1. Verificar Conexão com Supabase

Após iniciar a aplicação, verifique se a conexão com o Supabase está funcionando:

- Acesse a aplicação
- Verifique o console do navegador para erros de conexão
- Use a função `checkSupabaseConnection()` disponível em `src/lib/supabase.ts`

### 2. Verificar Estrutura do Banco de Dados

A aplicação requer as seguintes tabelas no Supabase:

**Tabelas Principais:**
- `profiles` - Perfis de usuários (extensão de auth.users)
- `clients` - Clientes/arenas
- `tickets` - Chamados de suporte
- `knowledge_categories` - Categorias da base de conhecimento
- `knowledge_articles` - Artigos da base de conhecimento
- `kb_subscriptions` - Assinaturas de notificações
- `system_logs` - Logs do sistema
- `performance_metrics` - Métricas de performance

**Schema SQL Completo:**

O schema SQL completo está disponível em `src/lib/seed-data.ts` na constante `SCHEMA_SQL`. 

**Como criar as tabelas:**

1. Acesse o Supabase Dashboard > SQL Editor
2. Copie o conteúdo de `SCHEMA_SQL` do arquivo `src/lib/seed-data.ts`
3. Execute o SQL no editor
4. Ou use o componente SupabaseWizard na aplicação (aba "Schema") que exibe o SQL completo

**Importante:** O schema inclui:
- Definição de todas as tabelas
- Row Level Security (RLS) habilitado
- Políticas de segurança baseadas em roles
- Triggers para atualização automática de timestamps
- Trigger para criação automática de profiles ao criar usuários

### 3. Verificar RLS (Row Level Security)

O código verifica permissões RLS. Certifique-se de que as políticas de segurança estão configuradas corretamente no Supabase.

## 🚨 Problemas Comuns e Soluções

### Problema: "Failed to fetch" ao conectar ao Supabase
**Solução**: 
- Verifique se a URL do Supabase está correta
- Verifique se a chave anon está correta
- Verifique se há problemas de CORS no Supabase

### Problema: Porta 8080 já em uso
**Solução**: 
- Altere a porta no `vite.config.ts`:
```typescript
server: {
  port: 3000, // ou outra porta disponível
}
```

### Problema: Erros de TypeScript
**Solução**:
- Execute `npm run lint` para verificar problemas
- Execute `npm run lint:fix` para corrigir automaticamente

### Problema: Variáveis de ambiente não carregam
**Solução**:
- Certifique-se de que o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento após criar/modificar o `.env`
- Variáveis devem começar com `VITE_` para serem expostas ao cliente

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento
npm run dev        # Alternativa para desenvolvimento

# Build
npm run build      # Build para produção
npm run build:dev  # Build para desenvolvimento

# Qualidade de Código
npm run lint       # Executa linter
npm run lint:fix   # Corrige problemas automaticamente
npm run format     # Formata código com Prettier

# Preview
npm run preview    # Visualiza build de produção localmente
```

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` no controle de versão
- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente diferentes para dev, homolog e produção
- A chave `VITE_SUPABASE_ANON_KEY` é pública (anon key), mas ainda assim deve ser protegida

## 📚 Recursos Adicionais

- [Documentação do Vite](https://vite.dev)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do React Router](https://reactrouter.com)
- [Documentação do Shadcn UI](https://ui.shadcn.com)

## ✅ Checklist Final

Antes de começar a desenvolver, certifique-se de:

- [ ] Node.js 18+ instalado (✅ v22.14.0 detectado)
- [ ] npm instalado (✅ v11.4.2 detectado)
- [ ] Dependências instaladas (`npm install`) ⚠️ **PENDENTE**
- [ ] Arquivo `.env` criado com credenciais do Supabase ⚠️ **PENDENTE**
- [ ] Schema do banco de dados criado no Supabase ⚠️ **PENDENTE**
- [ ] Servidor de desenvolvimento iniciado (`npm start`)
- [ ] Aplicação acessível em http://localhost:8080
- [ ] Conexão com Supabase funcionando
- [ ] RLS configurado corretamente (incluído no schema SQL)

---

## 📊 Resumo da Verificação

### Status Atual do Projeto

| Item | Status | Observações |
|------|--------|-------------|
| Node.js | ✅ OK | v22.14.0 (requerido: 18+) |
| npm | ✅ OK | v11.4.2 |
| Estrutura do Projeto | ✅ OK | Todos os arquivos presentes |
| Configuração Vite | ✅ OK | Porta 8080 configurada |
| Cliente Supabase | ✅ OK | Configurado em `src/lib/supabase.ts` |
| Dependências | ⚠️ PENDENTE | Executar `npm install` |
| Arquivo .env | ⚠️ PENDENTE | Criar com credenciais do Supabase |
| Schema do Banco | ⚠️ PENDENTE | Executar SQL no Supabase |

### Próximos Passos Imediatos

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Criar arquivo .env:**
   - Copiar `.env.example` para `.env` (se existir)
   - Ou criar manualmente com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

3. **Configurar banco de dados:**
   - Acessar Supabase Dashboard
   - Executar o SQL do schema (disponível em `src/lib/seed-data.ts`)

4. **Iniciar aplicação:**
   ```bash
   npm start
   ```

---

**Última atualização**: Verificação realizada automaticamente

