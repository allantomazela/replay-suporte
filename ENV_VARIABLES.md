# Variáveis de Ambiente - Sistema Replay Suporte

Este documento descreve todas as variáveis de ambiente necessárias para o funcionamento do sistema.

## 📋 Variáveis Obrigatórias

### Supabase

```env
# URL do projeto Supabase
# Exemplo: https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_URL=

# Chave Anon (pública) do Supabase
# Encontre esta chave em: Supabase Dashboard > Settings > API > anon public
VITE_SUPABASE_ANON_KEY=
```

**Onde encontrar**:
- Acesse o Supabase Dashboard
- Vá em Settings > API
- Copie a URL do projeto e a chave "anon public"

---

## 🔧 Variáveis Opcionais

### Configuração de Administradores

```env
# Email único do administrador (opcional)
# Use esta variável para um único email de admin
VITE_ADMIN_EMAIL=admin@example.com

# OU use esta variável para múltiplos emails (separados por vírgula)
# Exemplo: VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
VITE_ADMIN_EMAILS=
```

**Nota**: Se ambas as variáveis forem definidas, ambas serão consideradas. O email único também pode ser incluído na lista de múltiplos emails.

**Prioridade**:
1. `VITE_ADMIN_EMAILS` (lista de emails)
2. `VITE_ADMIN_EMAIL` (email único)
3. Email legado hardcoded (será removido em versão futura)

---

## 📝 Como Usar

### 1. Criar arquivo .env

Na raiz do projeto, crie um arquivo `.env`:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### 2. Adicionar variáveis

Copie o conteúdo abaixo e preencha com seus valores:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Admin Configuration (Opcional)
VITE_ADMIN_EMAIL=seu-email@example.com
# OU
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 3. Reiniciar servidor

Após criar ou modificar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

## ⚠️ Importante

1. **Nunca commite o arquivo `.env`** - Ele já está no `.gitignore`
2. **Variáveis começam com `VITE_`** - Isso é necessário para que o Vite as exponha ao cliente
3. **Valores sensíveis** - A chave anon é pública, mas ainda assim deve ser protegida
4. **Ambientes diferentes** - Use arquivos `.env-dev`, `.env-homolog`, `.env-prod` conforme necessário

---

## 🔐 Segurança

- ✅ Arquivo `.env` está no `.gitignore`
- ✅ Variáveis são validadas antes de uso
- ✅ URLs do Supabase são validadas
- ✅ Chaves são validadas quanto ao formato

---

## 🐛 Troubleshooting

### Variáveis não carregam

1. Verifique se o arquivo está na raiz do projeto
2. Verifique se as variáveis começam com `VITE_`
3. Reinicie o servidor de desenvolvimento
4. Limpe o cache: `rm -rf node_modules/.vite` (Linux/Mac) ou `Remove-Item -Recurse -Force node_modules\.vite` (Windows)

### Erro de validação

- **URL inválida**: Verifique se a URL termina com `.supabase.co`
- **Chave inválida**: Verifique se a chave tem pelo menos 50 caracteres e começa com `eyJ` ou `sb_`

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

