# 🚀 Guia de Deploy - Sistema Replay Suporte

Este guia fornece instruções passo a passo para fazer deploy do sistema em produção.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Build de produção testado localmente
- ✅ Variáveis de ambiente configuradas
- ✅ Supabase configurado e RLS policies aplicadas
- ✅ Validação executada: `npm run validate`

## 🔧 Passo 1: Configurar Variáveis de Ambiente

### No Servidor de Produção

Crie um arquivo `.env-prod` ou configure as variáveis no painel do servidor:

```env
VITE_SUPABASE_URL=https://seu-projeto-producao.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-producao
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**⚠️ IMPORTANTE**: Use credenciais de PRODUÇÃO, não de desenvolvimento!

## 🏗️ Passo 2: Build de Produção

Execute o build:

```bash
npm run build:prod
```

Isso criará os arquivos otimizados na pasta `dist/`.

## 🧪 Passo 3: Testar Build Localmente

Antes de fazer deploy, teste o build:

```bash
npm run preview
```

Acesse `http://localhost:4173` e teste:
- Login
- Navegação
- Funcionalidades principais
- Console do navegador (sem erros)

## ✅ Passo 4: Validação Final

Execute a validação:

```bash
npm run validate
```

Corrija quaisquer erros encontrados antes de prosseguir.

## 📤 Passo 5: Deploy

### Opção A: Servidor Web Tradicional (Nginx/Apache)

1. **Fazer upload dos arquivos**:
   - Faça upload da pasta `dist/` para o servidor
   - Coloque em `/var/www/html` ou diretório configurado

2. **Configurar servidor web**:

#### Nginx

Crie/edite `/etc/nginx/sites-available/replay-suporte`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/replay-suporte/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/replay-suporte /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Apache

Crie `.htaccess` na pasta `dist/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache de assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

### Opção B: Vercel/Netlify

1. **Vercel**:
   ```bash
   npm i -g vercel
   vercel --prod
   ```
   Configure variáveis de ambiente no painel da Vercel.

2. **Netlify**:
   - Conecte o repositório
   - Configure build command: `npm run build:prod`
   - Configure publish directory: `dist`
   - Adicione variáveis de ambiente no painel

## 🔒 Passo 6: Configurar HTTPS

**Obrigatório para produção!**

### Com Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Atualizar Nginx para HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # ... resto da configuração
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

## ✅ Passo 7: Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Aplicação carrega corretamente
- [ ] Login funciona
- [ ] Dados carregam do Supabase
- [ ] CRUD funciona (clientes, tickets, técnicos)
- [ ] Console do navegador sem erros
- [ ] HTTPS funcionando
- [ ] Performance aceitável

## 📊 Passo 8: Monitoramento

### Configurar Monitoramento de Erros

1. **Sentry** (recomendado):
   - Crie conta em sentry.io
   - Instale: `npm install @sentry/react`
   - Configure em `src/main.tsx`

2. **Logs do Servidor**:
   - Configure logs do Nginx/Apache
   - Monitore erros 500, 404, etc.

### Métricas a Monitorar

- Tempo de carregamento inicial
- Erros no console
- Taxa de erro de requisições
- Uso de recursos do servidor

## 🔄 Atualizações Futuras

Para atualizar a aplicação:

1. Faça as mudanças no código
2. Execute `npm run build:prod`
3. Teste localmente com `npm run preview`
4. Execute `npm run validate`
5. Faça upload da nova pasta `dist/`
6. Reinicie o servidor web se necessário

## 🆘 Troubleshooting

### Problema: Página em branco

**Solução**:
- Verifique se `index.html` está sendo servido corretamente
- Verifique console do navegador para erros
- Verifique se variáveis de ambiente estão configuradas

### Problema: Erro 404 em rotas

**Solução**:
- Configure redirecionamento para `index.html` (SPA routing)
- Verifique configuração do servidor web

### Problema: Erro ao conectar ao Supabase

**Solução**:
- Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Verifique CORS no Supabase Dashboard
- Verifique se RLS policies estão corretas

### Problema: Build muito grande

**Solução**:
- Execute análise: `npm run build:prod -- --analyze`
- Verifique se code splitting está funcionando
- Considere lazy loading adicional

## 📝 Checklist Final

Antes de considerar o deploy completo:

- [ ] Build de produção testado
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS configurado
- [ ] Servidor web configurado
- [ ] RLS policies aplicadas no Supabase
- [ ] Monitoramento configurado
- [ ] Backup do banco de dados configurado
- [ ] Documentação atualizada

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

