# 🧹 Guia de Limpeza de Cache

## Problema

Após limpar o banco de dados, os dados ainda aparecem na tela porque:
1. O `AppContext` inicializa com dados MOCK
2. O cache do React Query ainda contém dados antigos
3. O localStorage pode ter dados mock salvos

## ✅ Solução Implementada

### 1. Função Global no Console

Abra o console do navegador (F12) e execute:

```javascript
window.clearReplayCache()
```

Isso irá:
- ✅ Limpar todo o cache do React Query
- ✅ Limpar localStorage (dados mock salvos)
- ✅ Limpar sessionStorage
- ✅ Invalidar todas as queries

### 2. Função no AppContext

Se você tiver acesso ao `AppContext`, pode usar:

```typescript
const { clearAllData, refreshData } = useAppContext()

// Limpar todos os dados
clearAllData()

// Recarregar dados do banco (vai buscar arrays vazios agora)
await refreshData()
```

### 3. Recarregar a Página

Após executar `window.clearReplayCache()`, recarregue a página (F5) para que o `AppContext` busque os dados vazios do banco.

## 🔄 Fluxo Completo

1. **Limpeza do banco** (já feito via MCP Supabase)
2. **Limpar cache do frontend**:
   ```javascript
   window.clearReplayCache()
   ```
3. **Recarregar a página** (F5)
4. **Verificar**: As telas devem estar vazias agora

## 📝 Notas Técnicas

### O que foi modificado:

1. **`src/context/AppContext.tsx`**:
   - `refreshData` agora limpa estados quando Supabase retorna arrays vazios
   - Adicionada função `clearAllData()` para limpar todos os dados

2. **`src/lib/react-query.tsx`**:
   - Adicionadas funções `clearAllCache()` e `invalidateAllQueries()`

3. **`src/lib/clear-cache.ts`** (novo):
   - Utilitário centralizado para limpeza de cache
   - Função global `window.clearReplayCache()` disponível

4. **`src/App.tsx`**:
   - Importa `clear-cache.ts` para inicializar função global

## ⚠️ Importante

- A função `clearReplayCache()` **não remove** dados do banco
- Ela apenas limpa cache e dados em memória/localStorage
- Após limpar, recarregue a página para ver os dados vazios do banco

## 🐛 Troubleshooting

### Dados ainda aparecem após limpar cache

1. Verifique se o banco está realmente vazio:
   ```sql
   SELECT COUNT(*) FROM clients;
   SELECT COUNT(*) FROM tickets;
   SELECT COUNT(*) FROM technicians;
   ```

2. Limpe o cache novamente:
   ```javascript
   window.clearReplayCache()
   ```

3. Recarregue a página com cache limpo (Ctrl+Shift+R ou Ctrl+F5)

4. Verifique o console do navegador para erros

### Erro: "window.clearReplayCache is not a function"

- Certifique-se de que o app foi recarregado após as mudanças
- Verifique se `src/lib/clear-cache.ts` está sendo importado em `src/App.tsx`

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy HH:mm")

