# Burgos Experience System

Sistema de experiência premium para Barbearia Burgos.

## 🏗️ Estrutura do Projeto

```
burgos-experience-system/
├── apps/
│   ├── web/              # Next.js - Aplicação web (cliente, barbeiro, admin)
│   ├── desktop/          # Electron - Aplicação da recepção
│   └── api/              # Node.js - API REST + WebSocket
├── packages/
│   ├── database/         # PostgreSQL schema & migrations
│   ├── ui/               # Componentes React compartilhados
│   ├── types/            # TypeScript types compartilhados
│   └── config/           # Configurações compartilhadas (ESLint, Tailwind)
└── docs/                 # Documentação
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- npm 9+

### Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:migrate
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## 📦 Aplicações

### Web App (apps/web)
```bash
cd apps/web
npm run dev
# Acesse: http://localhost:3000
```

### Desktop App (apps/desktop)
```bash
cd apps/desktop
npm run dev
# Abre aplicação Electron
```

### API Server (apps/api)
```bash
cd apps/api
npm run dev
# API: http://localhost:3001
# WebSocket: ws://localhost:3001
```

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Desktop**: Electron
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL, Prisma ORM
- **Build**: Turborepo, TypeScript

## 📚 Documentação

Consulte a pasta `/docs` para documentação completa.

## 🔒 Variáveis de Ambiente

Copie `.env.example` para `.env.local` em cada app e configure:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

## 🎯 Features

- ✅ Sistema multi-role (Cliente, Barbeiro, Recepcionista, Admin)
- ✅ Agendamento inteligente
- ✅ Check-in automatizado
- ✅ Integração Spotify (experiência personalizada)
- ✅ Processamento de pagamentos
- ✅ Aplicação desktop para recepção
- ✅ Real-time sync (WebSocket)
- ✅ PWA mobile

---

**Feito com 💈 para Barbearia Burgos**
