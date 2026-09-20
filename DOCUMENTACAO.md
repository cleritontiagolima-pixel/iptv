# Documentação Completa do Sistema IPTV

## 🌟 Visão Geral

Sistema completo de gerenciamento IPTV composto por três componentes principais:

1. **Backend API** - Servidor Node.js com TypeScript
2. **Painel Web** - Interface administrativa Next.js
3. **Aplicativo Mobile** - App React Native/Expo para Android TV e dispositivos móveis

## 🏗️ Arquitetura Técnica

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **Banco de Dados**: SQL.js (SQLite em memória)
- **Autenticação**: JWT (JSON Web Tokens)
- **Comunicação Real-time**: Socket.io
- **Agendamento**: node-cron
- **Porta**: 3001

### Frontend (Next.js 14 + TypeScript)
- **Framework**: Next.js 14 com App Router
- **Estilização**: Tailwind CSS
- **HTTP Client**: Axios
- **Socket Client**: Socket.io-client
- **Porta**: 3000

### Mobile (React Native + Expo)
- **Framework**: React Native com Expo
- **Video Player**: Expo AV
- **Navegação**: React Navigation
- **HTTP Client**: Axios
- **Socket Client**: Socket.io-client

## 📁 Estrutura de Diretórios

```
IPTV/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores da API
│   │   │   ├── authController.ts
│   │   │   ├── clientController.ts
│   │   │   └── creditController.ts
│   │   ├── models/          # Modelos de dados
│   │   │   ├── User.ts
│   │   │   ├── Client.ts
│   │   │   ├── CreditTransaction.ts
│   │   │   └── ActivityLog.ts
│   │   ├── routes/          # Rotas da API
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   └── credits.ts
│   │   ├── middleware/      # Middleware
│   │   │   └── auth.ts
│   │   ├── services/        # Serviços
│   │   │   ├── socketService.ts
│   │   │   └── schedulerService.ts
│   │   ├── database/        # Configuração DB
│   │   │   ├── connection-sqljs.ts
│   │   │   ├── schema-sqlite.sql
│   │   │   └── init.ts
│   │   ├── types/           # Tipos TypeScript
│   │   │   └── index.ts
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Páginas Next.js
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── dashboard/
│   │   ├── components/      # Componentes React
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   ├── EditClientForm.tsx
│   │   │   ├── ClientTable.tsx
│   │   │   └── CreditPanel.tsx
│   │   ├── lib/             # Utilitários
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── types/           # Tipos TypeScript
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── mobile/
│   ├── src/
│   │   ├── screens/         # Telas do app
│   │   │   ├── ActivationScreen.tsx
│   │   │   └── MainScreen.tsx
│   │   ├── services/        # Serviços
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── utils/           # Utilitários
│   │   │   └── deviceInfo.ts
│   │   └── types/           # Tipos TypeScript
│   │       └── index.ts
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── README.md
├── INSTRUÇOES.md
└── DOCUMENTACAO.md
```

## 🔐 Modelo de Dados

### Tabela: users
```sql
- id: INTEGER (PRIMARY KEY)
- name: TEXT
- email: TEXT (UNIQUE)
- password: TEXT (hashed)
- role: TEXT ('admin' | 'reseller')
- credits: REAL
- created_at: DATETIME
- updated_at: DATETIME
```

### Tabela: clients
```sql
- id: INTEGER (PRIMARY KEY)
- user_id: INTEGER (FOREIGN KEY)
- mac_address: TEXT (UNIQUE)
- app_assigned: TEXT
- m3u_url: TEXT
- xtream_username: TEXT
- xtream_password: TEXT
- xtream_server_url: TEXT
- expiration_date: TEXT
- subscription_price: REAL
- notes: TEXT
- status: TEXT ('active' | 'suspended' | 'expired')
- device_blocked: INTEGER (BOOLEAN)
- created_at: DATETIME
- updated_at: DATETIME
```

### Tabela: credit_transactions
```sql
- id: INTEGER (PRIMARY KEY)
- user_id: INTEGER (FOREIGN KEY)
- type: TEXT ('credit' | 'debit')
- amount: REAL
- description: TEXT
- created_at: DATETIME
```

### Tabela: activity_logs
```sql
- id: INTEGER (PRIMARY KEY)
- user_id: INTEGER (FOREIGN KEY)
- client_id: INTEGER (FOREIGN KEY)
- action: TEXT
- details: TEXT
- ip_address: TEXT
- created_at: DATETIME
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/profile` - Obter perfil do usuário

### Clientes
- `POST /api/clients` - Criar novo cliente
- `GET /api/clients` - Listar todos os clientes
- `GET /api/clients/:id` - Obter cliente específico
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente
- `POST /api/clients/:id/suspend` - Suspender cliente
- `POST /api/clients/:id/activate` - Ativar cliente
- `POST /api/clients/:id/block-device` - Bloquear dispositivo
- `PUT /api/clients/:id/mac-address` - Atualizar MAC address
- `GET /api/clients/stats` - Obter estatísticas

### Créditos
- `GET /api/credits/balance` - Obter saldo de créditos
- `GET /api/credits/transactions` - Obter histórico de transações
- `POST /api/credits/add` - Adicionar créditos
- `POST /api/credits/deduct` - Deduzir créditos
- `GET /api/credits/all` - Obter todas as transações (admin)

### App IPTV
- `GET /api/app/config/:mac_address` - Obter configuração do app

## 🔄 Fluxo de Comunicação

### 1. Ativação do App
```
App Mobile → Gera MAC address
App Mobile → GET /api/app/config/:mac_address
Backend → Valida MAC e retorna configuração
App Mobile → Conecta via Socket.io
Backend → Envia dados do cliente via Socket
```

### 2. Comunicação em Tempo Real
```
Painel Web → Socket.io → Backend → Socket.io → App Mobile
```

### 3. Exemplo de Fluxo Completo
```
1. Usuário cria cliente no painel
2. Backend deduz créditos e salva no DB
3. Backend notifica via Socket.io
4. App recebe atualização e ajusta comportamento
5. Scheduler verifica expirações periodicamente
6. Clientes expirados são notificados automaticamente
```

## 🛡️ Segurança

### Autenticação
- Senhas hash com bcryptjs
- Tokens JWT com expiração
- Middleware de autenticação em rotas protegidas

### Autorização
- Sistema de roles (admin/reseller)
- Verificação de permissões por endpoint
- Isolamento de dados por usuário

### Validação
- Validação de formato de MAC address
- Validação de dados de entrada
- Sanitização de queries SQL

### Logs
- Registro de todas as ações importantes
- Logs de atividade por usuário e cliente
- Rastreamento de endereços IP

## 🚀 Como Usar

### Inicialização Rápida

```bash
# Backend
cd backend
npm run dev

# Frontend (novo terminal)
cd frontend
npm run dev

# Mobile (novo terminal, opcional)
cd mobile
npm start
```

### Acesso Padrão
- **Painel**: http://localhost:3000
- **API**: http://localhost:3001
- **Login Admin**: admin@iptv.com / admin123

### Criar Primeiro Cliente

1. Faça login no painel
2. Clique em "Novo Cliente"
3. Preencha os dados:
   - MAC: AA:BB:CC:DD:EE:FF
   - Aplicativo: IBO REVENDA
   - URL M3U: http://exemplo.com/playlist.m3u
   - Expiração: 2024-12-31
   - Preço: 29.90
4. Clique em "Criar Cliente"

### Testar App Mobile

1. Inicie o app Expo
2. Escaneie o QR code
3. Insira o MAC address criado
4. Aguarde ativação automática
5. Navegue pelos canais

## 🧪 Testes Funcionais

### Teste de API
```bash
# Teste de saúde
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iptv.com","password":"admin123"}'
```

### Teste de Socket.io
1. Conecte o app mobile
2. Faça alterações no painel
3. Verifique atualizações em tempo real
4. Consulte logs do console

### Teste de Expiração
1. Crie cliente com data passada
2. Aguarde verificação do scheduler
3. Verifique se status muda para 'expired'
4. Tente ativar no app

## 🔧 Configuração

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iptv_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=iptv_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SOCKET_PORT=3002
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Mobile (app.json)
```json
{
  "expo": {
    "name": "IPTV App",
    "slug": "iptv-app",
    "version": "1.0.0"
  }
}
```

## 📊 Funcionalidades Implementadas

### ✅ Backend
- [x] Sistema de autenticação JWT
- [x] CRUD de clientes
- [x] Sistema de créditos
- [x] Bloqueio de dispositivos
- [x] Expiração automática
- [x] Socket.io para comunicação real-time
- [x] Scheduler para verificações periódicas
- [x] Logs de atividade
- [x] Validação de dados
- [x] Tratamento de erros

### ✅ Frontend
- [x] Interface moderna SaaS
- [x] Modo escuro
- [x] Responsivo
- [x] Dashboard com estatísticas
- [x] Tabela de clientes com filtros
- [x] Formulário de criação/edição
- [x] Painel de créditos
- [x] Modal de confirmação
- [x] Tratamento de erros
- [x] Loading states

### ✅ Mobile
- [x] Ativação por MAC address
- [x] Suporte a M3U
- [x] Suporte a Xtream Codes
- [x] Player de vídeo
- [x] Lista de canais
- [x] Busca e filtros
- [x] Controle parental
- [x] Tela cheia
- [x] Comunicação Socket.io
- [x] Otimização para TV

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Adicionar testes unitários
- [ ] Implementar EPG completo
- [ ] Adicionar favoritos
- [ ] Melhorar UI/UX do app

### Médio Prazo
- [ ] Multi-dispositivo por cliente
- [ ] Gravação de programas
- [ ] Analytics e relatórios
- [ ] Sistema de notificações

### Longo Prazo
- [ ] App nativo para Android TV
- [ ] Versão iOS
- [ ] Integração com payment gateways
- [ ] Sistema de afiliados

## 🐛 Troubleshooting Comum

### Backend não inicia
- Verifique se as dependências estão instaladas
- Confirme que não há conflito de porta
- Consulte os logs no terminal

### Frontend não conecta
- Verifique se o backend está rodando
- Confirme a URL da API no .env.local
- Limpe o cache do navegador

### App não ativa
- Verifique se o MAC address está correto
- Confirme se o cliente existe no painel
- Consulte os logs do Expo

### Socket não conecta
- Verifique se SOCKET_PORT está correta
- Confirme configuração de CORS
- Teste com ferramenta Socket.io

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte o README.md
2. Veja INSTRUÇOES.md
3. Verifique os logs
4. Revise a documentação da API

---

**Sistema desenvolvido para gerenciamento profissional de serviços IPTV**
