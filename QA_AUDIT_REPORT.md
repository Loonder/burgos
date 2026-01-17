# 🛡️ Relatório de Auditoria QA - Burgos Experience System

**Data:** 15/01/2026
**Responsável:** QA Senior Agent (Antigravity)
**Status do Projeto:** ⚠️ ALTO RISCO (Bloqueantes para Produção detectados)

Este documento detalha inconsistências críticas, falhas de segurança e problemas técnicos que **impede uma entrada segura em produção**.

---

## 🔴 1. Lista de ERROS CRÍTICOS (Bloqueiam Produção)

Estes itens representam vulnerabilidades graves de segurança ou estabilidade. **Não faça deploy sem corrigi-los.**

### ❌ 1. Falha Crítica de Segurança: Escalada de Privilégio (Register)
*   **Descrição:** O endpoint de cadastro permite que qualquer usuário defina seu próprio cargo (role) enviando-o no corpo da requisição.
*   **Arquivo:** `apps/api/src/controllers/auth.controller.ts` (Linha 68)
*   **Impacto:** 🚨 **CRÍTICO**. Um atacante pode criar um usuário enviando `{ role: "admin" }` e ganhar controle total do sistema imediatamente.
*   **Correção:**
    ```typescript
    // Remover role do req.body ou forçar 'cliente'
    const role = 'cliente'; // Force cliente no registro público
    ```

### ❌ 2. Armazenamento Inseguro de Credenciais (XSS Vulnerability)
*   **Descrição:** O token JWT e dados do usuário são armazenados no `localStorage` do navegador.
*   **Arquivo:** `apps/web/src/contexts/AuthContext.tsx`
*   **Impacto:** 🚨 **CRÍTICO**. Qualquer script malicioso (XSS) injetado (via npm package comprometido ou input não sanitizado) pode roubar o token e sequestrar a sessão.
*   **Correção:** Armazenar tokens em **HttpOnly Cookies** (Secure, SameSite). O frontend não deve ter acesso direto ao token.

### ❌ 3. Script de Migração Ignora Erros
*   **Descrição:** O script de migração do banco de dados captura erros e continua a execução ("IGNORING ERROR").
*   **Arquivo:** `packages/database/scripts/migrate.js`
*   **Impacto:** 🚨 **ALTO**. Se uma tabela falhar ao ser criada (ex: chave estrangeira), as próximas tabelas ou inserções falharão ou criarão dados inconsistentes. O banco ficará corrompido em produção.
*   **Correção:** O script deve usar `process.exit(1)` imediatamente ao encontrar qualquer erro SQL.

### ❌ 4. Segredos Hardcoded e Falta de Validação de ENV
*   **Descrição:** O sistema usa strings de fallback ("fallback-secret") se as variáveis de ambiente não estiverem definidas.
*   **Arquivo:** `apps/api/src/middleware/auth.ts`
*   **Impacto:** 🚨 **ALTO**. Se o deploy ocorrer com erro de configuração de variáveis, o sistema rodará com senhas conhecidas (públicas no git), permitindo falsificação de tokens.
*   **Correção:** O sistema deve **FALHAR NO START** (`throw new Error`) se segredos críticos (JWT_SECRET / DATABASE_URL) não estiverem presentes.

### ❌ 5. Vulnerabilidade de Processamento de Imagens (DoS)
*   **Descrição:** A configuração do Next.js permite carregar imagens de **qualquer** domínio (`hostname: '**'`).
*   **Arquivo:** `apps/web/next.config.js`
*   **Impacto:** 🚨 **MÉDIO/ALTO**. Permite ataques de negação de serviço (DoS) sobrecarregando o servidor de otimização de imagens do Next.js com URLs maliciosas.
*   **Correção:** Restringir `remotePatterns` apenas para os domínios confiáveis (ex: seu bucket S3/Supabase e domínios conhecidos).

---

## 🟠 2. Erros IMPORTANTES (Devem ser corrigidos antes do go-live)

Questões que afetam a qualidade, manutenção e performance.

### ⚠️ 1. Ausência de Middleware de Validação (Zod)
*   **Descrição:** A validação de input é feita manualmente dentro dos controllers (`if (!email)...`) ou não existe.
*   **Impacto:** Código repetitivo, propenso a falhas e difícil de manter.
*   **Correção:** Criar um middleware `validate(schema)` e usar schemas Zod para validar `body`, `query` e `params` antes de chegar no controller.

### ⚠️ 2. Performance de Navegação Frontend
*   **Descrição:** Uso de tags `<a>` HTML padrão em vez do componente `<Link>` do Next.js para navegação interna (`/agendamento`).
*   **Arquivo:** `apps/web/src/app/page.tsx`
*   **Impacto:** Causa "Hard Reload" da página, perdendo o estado da aplicação (SPA) e aumentando o tempo de carregamento percebido pelo usuário.
*   **Correção:** Substituir por `<Link href="...">`.

### ⚠️ 3. Performance de Imagens (LCP/CLS)
*   **Descrição:** Uso de tag `<img>` padrão em vez de `next/image`.
*   **Impacto:** Imagens não otimizadas (tamanho grande), sem lazy loading e sem prevenção de layout shift (CLS).
*   **Correção:** Usar `<Image />` component.

### ⚠️ 4. Rate Limiting Ausente
*   **Descrição:** A dependência `express-rate-limit` está instalada mas não está configurada no `index.ts`.
*   **Impacto:** API vulnerável a ataques de força bruta (Brute Force) no login e excesso de requisições.
*   **Correção:** Configurar o middleware globalmente ou nas rotas de Auth.

---

## 🟡 3. Erros NÃO CRÍTICOS (Pós-lançamento)

### ℹ️ 1. Logging Simplista
*   O Logger grava em arquivos locais (`logs/`). Em ambientes containerizados (Docker/K8s) sem volumes persistentes, esses logs serão perdidos.
*   **Recomendação:** Usar stdout/stderr (JSON format) para que ferramentas de monitoramento capturem os logs.

### ℹ️ 2. Hardcoded CORS
*   Origens CORS estão hardcoded no código.
*   **Recomendação:** Mover para variável de ambiente `ALLOWED_ORIGINS` (CSV string).

---

## 🧭 4. ROADMAP DE CORREÇÃO

### Fase 1: Blindagem (Imediato - 1 dia)
1.  [x] **CORRIGIR** `auth.controller.ts`: Remover `role` do `req.body` no registro.
2.  [x] **CORRIGIR** `migrate.js`: Adicionar `process.exit(1)` no catch.
3.  [x] **HARDENING** `auth.ts`: Adicionar validação de startup para `JWT_SECRET`.
4.  [x] **CONFIG**: Configurar `.env.production` real. (Validado em código)

### Fase 2: Segurança & Arquitetura (2 dias)
1.  [x] **REFACTOR**: Migrar Auth para HttpOnly Cookies (Requer update no Backend e Frontend).
2.  [x] **FEAT**: Implementar Middleware de Validação (Zod).
3.  [x] **SECURITY**: Ativar Rate Limiting (Login: 5 reqs/min, Geral: 100 reqs/min).

### Fase 3: Performance & UX (Pré-Go-Live)
1.  [x] **PERF**: Substituir `<img>` por `next/image` na Landing Page.
2.  [x] **PERF**: Substituir `<a>` por `<Link>`.
3.  [x] **SEO**: Verificar metatags (Title, Description) em todas as páginas públicas.
4.  [x] **SECURITY**: Restringir `remotePatterns` no `next.config.js`.

---

## ✅ 5. CHECKLIST DE GO-LIVE

- [ ] **Build:** `turbo run build` executa sem erros em ambiente limpo?
- [ ] **Testes Manuais:** O fluxo "Criar Conta -> Agendar -> Admin vê agendamento" funciona?
- [ ] **Roles:** Tente criar um usuário e acessar rota de admin (`/api/barbers` POST). Deve retornar 403.
- [ ] **Env:** `JWT_SECRET`, `DATABASE_URL` e `NEXT_PUBLIC_API_URL` estão definidos no servidor?
- [ ] **Prod:** `NODE_ENV=production` está setado?
- [ ] **Logs:** A aplicação está gerando logs acessíveis?

---

> 💡 **Dica de Senior:** *Estabilidade vence Features.* É melhor lançar sem a feature de "Música favorita" do que lançar com uma falha que permite alguém apagar seu banco de dados. Foque na FASE 1 agora.
