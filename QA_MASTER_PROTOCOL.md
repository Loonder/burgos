# Protocolo Mestre de Garantia de Qualidade e Segurança (QA/Sec)

Este documento define os padrões rigorosos de teste, segurança e qualidade para o ecossistema "Burgos Experience", simulando uma auditoria de nível Enterprise.

---

## 1. Segurança (Security Hardening)
**Objetivo:** Zero vulnerabilidades críticas (OWASP Top 10).

### 1.1 Auditoria de Código & Dependências
- [ ] **Dependency Scan (SCA):** Rodar `npm audit` em CI/CD para bloquear deploys com vulnerabilidades críticas.
- [ ] **Secret Scanning:** Garantir que nenhum `.env` ou chave privada (Stripe SK, JWT Secret) seja comitado no Git.
    - *Ação:* Verificar `.gitignore` e histórico do git.
- [ ] **SQL Injection Prevention:**
    - Uso estrito de ORM/Query Builders (Supabase/Prisma/TypeORM) com parâmetros parametrizados.
    - *Verificação:* O `AdminPlanController` usa `supabase.from().insert()`, o que utiliza *prepared statements* internamente.

### 1.2 Controle de Acesso (IDOR & RBAC)
- [ ] **Teste IDOR (Insecure Direct Object Reference):**
    - Tentar acessar `/api/subscriptions/me` com token de outro usuário.
    - Tentar deletar plano `/api/admin/plans/:id` como usuário 'cliente'.
    - *Mitigação:* Middleware `authorize('admin')` e `req.user.id` extraído do token (nunca do body) em rotas sensíveis.
- [ ] **Rate Limiting:**
    - Implementar `express-rate-limit` em rotas de Login e Checkout para evitar Bruteforce e Card Testing (Carding).

### 1.3 Proteção de Dados (PII & PCI-DSS)
- [ ] **PCI-DSS Compliance:**
    - NUNCA trafegar números de cartão de crédito no backend próprio.
    - Utilizar Stripe Elements (Frontend) para tokenização direta.
    - O backend recebe apenas `price_id` e `customer_id`.

---

## 2. Garantia de Qualidade (QA Strategy)
**Objetivo:** Experiência de uso fluida e livre de regressões.

### 2.1 Testes Automatizados (Pirâmide de Testes)
- [ ] **Unitários (Jest):**
    - Testar `PaymentService.checkPrice(original, discount_rules)` isoladamente.
    - Casos de borda: Regra de desconto nula, serviço não coberto, percentual inválido (>100%).
- [ ] **Integração (Supertest + Test DB):**
    - Fluxo: Criar Plano -> Assinar Mock -> Verificar Status Ativo -> Agendar com Desconto.
- [ ] **E2E (Cypress/Playwright):**
    - Simular usuário real: Login -> Navegar para /planos -> Clicar Assinar -> Ver Confirmação -> Logout.

### 2.2 Testes de Carga e Performance
- [ ] **Simulação de Black Friday:**
    - Ferramenta: k6 ou JMeter.
    - Cenário: 1000 usuários consultando horários (`/available-slots`) simultaneamente.
    - *Meta:* Resposta < 200ms para p95.
    - *Otimização:* Índices no banco em `appointments(date, barber_id)` e cache Redis para slots.

---

## 3. Qualidade de Código (Software Craftsmanship)
**Objetivo:** Manutenibilidade e Escalabilidade.

### 3.1 Padrões e Linting
- [ ] **Strict Typography:** `tsconfig` com `strict: true`.
- [ ] **No Dead Code:** Remover imports e funções não utilizadas regularmente (SonarQube).
- [ ] **Error Handling Centralizado:**
    - Middleware de erro global no Express (`app.use((err, req, res, next) => ...)`).
    - Logs estruturados (JSON) com `winston` ou `pino` para ingestão em Datadog/ELK.

### 3.2 Arquitetura
- [ ] **Service Pattern:** Lógica de negócio isolada em `services/` (ex: `PaymentService`), Controllers apenas orquestram HTTP.
- [ ] **Dependency Injection:** Para facilitar mocks nos testes unitários (como feito no `PaymentController` usando singleton/inversão).

---

## 4. Funções Avançadas (Senior/Lead Level)
**O que diferencia um sistema "OK" de um "World Class".**

### 4.1 Idempotência em Transações Financeiras
- **Cenário:** Webhook do Stripe chega 2 vezes para o mesmo pagamento.
- **Solução:** Tabela `processed_webhooks(event_id)`. Se ID já existe, retornar 200 OK imediatamente sem processar novamente.
- *Status:* Implementado parcialmente no conceito, necessita tabela dedicada.

### 4.2 Graceful Degradation (Circuit Breaker)
- **Cenário:** API do Stripe cai.
- **Comportamento:** O sistema não deve travar o agendamento; deve permitir agendar com "Pagamento na Loja" ou alertar "Pagamento online indisponível momentaneamente".

### 4.3 Observabilidade (Tracing Distribuído)
- Implementar `OpenTelemetry` para rastrear uma requisição desde o Frontend -> API -> Database -> Stripe, identificando gargalos de latência.

---

**Status Final da Entrega Atual:**
- **Segurança:** ✅ Auth (JWT), RBAC (Admin), Sanitização de SQL (Via ORM).
- **QA:** ✅ Testes Manuais de Fluxo, ✅ Linting/Build estático.
- **Tech Debt:** ⚠️ Implementar Webhook Idempotency real e Testes Automatizados (Jest/Cypress).
