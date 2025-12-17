# ✅ Checklist de Produção - Sistema Replay Suporte

Este documento lista todas as verificações e ações necessárias antes de fazer deploy em produção.

## 🔴 Crítico (Obrigatório antes do deploy)

### Segurança
- [x] Email hardcoded removido do código
- [ ] Variáveis de ambiente configuradas no servidor de produção:
  - [ ] `VITE_SUPABASE_URL` (URL de produção)
  - [ ] `VITE_SUPABASE_ANON_KEY` (Chave anon de produção)
  - [ ] `VITE_ADMIN_EMAILS` (Lista de emails de administradores)
- [ ] RLS policies revisadas e testadas no Supabase de produção
- [ ] HTTPS configurado no servidor
- [ ] CORS configurado corretamente no Supabase

### Build e Deploy
- [ ] Build de produção testado: `npm run build:prod`
- [ ] Preview do build testado: `npm run preview`
- [ ] Validação executada: `npm run validate`
- [ ] Tamanho do bundle verificado (não exceder limites)

### Testes
- [ ] Login/Logout testado
- [ ] CRUD de clientes testado
- [ ] CRUD de tickets testado
- [ ] CRUD de técnicos testado
- [ ] Base de conhecimento testada
- [ ] Exportação CSV/PDF testada
- [ ] Filtros e buscas testados
- [ ] Responsividade testada (mobile, tablet, desktop)

## 🟡 Alta Prioridade (Recomendado antes do deploy)

### Performance
- [ ] Bundle size otimizado
- [ ] Lazy loading funcionando
- [ ] Cache do React Query funcionando
- [ ] Imagens otimizadas

### Monitoramento
- [ ] Serviço de monitoramento de erros configurado (Sentry, LogRocket, etc.)
- [ ] Logs configurados no servidor
- [ ] Alertas configurados para erros críticos

### Documentação
- [ ] README.md atualizado
- [ ] Instruções de deploy documentadas
- [ ] Variáveis de ambiente documentadas

## 🟢 Média Prioridade (Pode ser feito após deploy)

### Testes Automatizados
- [ ] Framework de testes instalado
- [ ] Testes unitários criados
- [ ] Testes de integração criados

### Acessibilidade
- [ ] ARIA labels adicionados
- [ ] Navegação por teclado testada
- [ ] Leitor de tela testado

### SEO
- [ ] Meta tags completas
- [ ] Sitemap.xml criado (se aplicável)
- [ ] robots.txt configurado

## 📋 Checklist Pós-Deploy

### Primeiras 24 horas
- [ ] Monitorar logs do servidor
- [ ] Verificar console do navegador (sem erros)
- [ ] Testar funcionalidades principais
- [ ] Verificar métricas de performance
- [ ] Coletar feedback dos usuários

### Primeira semana
- [ ] Revisar logs de erros
- [ ] Verificar uso de recursos
- [ ] Ajustar configurações se necessário
- [ ] Documentar problemas encontrados

## 🛠️ Comandos Úteis

```bash
# Validar antes do deploy
npm run validate

# Build de produção
npm run build:prod

# Testar build localmente
npm run preview

# Verificar tamanho do bundle
npm run build:prod && du -sh dist/
```

## 📝 Notas

- Execute `npm run validate` antes de cada deploy
- Sempre teste o build localmente antes de fazer deploy
- Mantenha backups do banco de dados
- Documente todas as mudanças de configuração

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")

