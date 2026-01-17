# Implementação de Assinaturas (Frontend)

- [x] **API Client Setup**
    - [x] Adicionar métodos de assinatura em `apps/web/src/lib/api.ts`.
- [x] **Páginas de Assinatura**
    - [x] Criar `/planos` (Listagem e Contratação).
    - [x] Criar `/minha-assinatura` (Gestão).
- [x] **Integração no Agendamento**
    - [x] Atualizar `agendamento/page.tsx` para consultar `/api/subscriptions/check-price`.
    - [x] Exibir preço riscado (ex: ~~R$ 50,00~~ R$ 0,00).
- [x] **Admin - Gestão de Planos**
    - [x] Criar `/admin/planos` (Listagem).
    - [x] Criar `/admin/planos/novo` (Criar/Editar com definição de descontos por serviço).
    - [x] Endpoint `POST /api/admin/plans`.
- [x] **Admin - Relatórios**
    - [x] Ver usuários assinantes no Dashboard.
- [ ] **Verificação Final**
    - [ ] Teste E2E manual (Assinar -> Agendar com desconto).
