# Implementação de Planos (Assinaturas) com Stripe

## Objetivo
Implementar sistema de assinaturas recorrentes onde clientes pagam mensalmente para ter descontos (ex: 100% off) em serviços específicos. A solução utilizará **Stripe** pela robustez em segurança, gestão de recorrência e conformidade PCI.

## Arquitetura e Segurança
1.  **Stripe Checkout/Elements**: Dados de cartão nunca tocam nosso servidor.
2.  **Webhooks Seguros**: Atualização de status via webhooks assinados (HMAC).
3.  **Backend Authority**: O Frontend apenas inicia o processo; o Backend valida e cria a sessão.
4.  **Database Mirror**: Mantemos estado local da assinatura para performance na hora de agendar, mas a verdade final é do Stripe.

## Plano de Implementação

### Fase 1: Banco de Dados (✅ Schema Definido)
- [x] Criar tabelas `plans`, `plan_discounts`, `user_subscriptions`.
- [x] Adicionar `stripe_customer_id` em `users`.

### Fase 2: Configuração Stripe (✅ Backend Mock Pronto)
- [x] Service `MockPaymentProvider` implementado (Simula checkout/webhooks).
- [x] Endpoint `POST /api/subscriptions/checkout`: Cria link de pagamento (Mock).
- [x] Endpoint `POST /api/subscriptions/mock-activate`: Ativação manual.
- [x] Seed de Planos (VIP Mensal).

### Fase 3: Lógica de Negócio (✅ Backend Pronto)
- [x] Implementado `PaymentService.checkPrice` para calcular descontos.
- [x] Endpoint `POST /api/subscriptions/check-price`: Frontend consulta preço final.
- `AppointmentController` não precisou de mudanças diretas pois o preço é consultado antes ou na hora do pagamento.

### Fase 4: Frontend (Cliente) (✅ Implementado)
- [x] Página `/planos`: Listagem e contratação.
- [x] Página `/minha-assinatura`: Gestão e status.
- [x] Integração no Agendamento: Exibe preço original riscado e valor final (0.00 ou com desconto).
- [x] API Client Setup (`subscriptionAPI`).

### Fase 5: Admin (✅ Implementado)
- [x] CRUD de Planos (Para criar ID no Stripe via API).
- [x] Visualizar assinantes (Page `/admin/assinantes`).

## Dependências Necessárias
- API Key do Stripe (Secret e Publishable).
- Stripe CLI (para testar webhooks localmente).
