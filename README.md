# Sistema IPTV - Painel de Gerenciamento e Aplicativo

Sistema completo de gerenciamento IPTV com painel web administrativo e aplicativo mobile para Android TV e dispositivos móveis.

## 📋 Funcionalidades

### Painel de Gerenciamento (Web)
- ✅ Gerenciamento completo de clientes IPTV
- ✅ Sistema de créditos para revendedores
- ✅ Visualização de status das linhas (ativas, expiradas, suspensas)
- ✅ Bloqueio de dispositivos por endereço MAC
- ✅ Gerenciamento automático de expiração
- ✅ Interface moderna SaaS com modo escuro
- ✅ Responsivo e otimizado para uso
- ✅ Suporte a playlists M3U e Xtream Codes

### Aplicativo IPTV (Mobile/TV)
- ✅ Login/ativação por endereço MAC
- ✅ Suporte a playlists M3U e Xtream Codes
- ✅ Interface otimizada para TV (D-Pad)
- ✅ Reprodução de streams em tempo real
- ✅ Busca e filtro de canais
- ✅ Controle parental com PIN
- ✅ Tela cheia e controle de proporção
- ✅ Comunicação em tempo real com o painel

## 🏗️ Arquitetura

- **Backend**: Node.js + Express + TypeScript + SQL.js (SQLite)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo
- **Comunicação**: Socket.io (tempo real)
- **Banco de Dados**: SQL.js (SQLite em memória - não requer instalação externa)

## 📦 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo CLI (para desenvolvimento mobile)

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
# Instalar dependências do projeto raiz
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Instalar dependências do mobile
cd ../mobile
npm install
```

### 2. Iniciar os Serviços

**Windows:**
```bash
# Duplo clique em start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manualmente (3 terminais):**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Mobile (opcional)
cd mobile
npm start
```

## 👤 Acesso Padrão

Após a primeira inicialização, o sistema criará automaticamente um usuário admin:

- **Email**: admin@iptv.com
- **Senha**: admin123

⚠️ **Importante**: Altere esta senha após o primeiro login!

## 🌐 Endpoints

- **Painel Web**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📱 Uso do Aplicativo Mobile

### Desenvolvimento

```bash
cd mobile
npm start
```

Escaneie o QR code com o app Expo no seu celular ou use um emulador.

### Plataformas Suportadas
- Android
- iOS
- Web
- Android TV

## 🔧 Configuração de Clientes

### Via Painel Web

1. Acesse o painel: http://localhost:3000
2. Faça login com suas credenciais
3. Clique em "Novo Cliente"
4. Preencha os dados:
   - Endereço MAC do dispositivo
   - Tipo de conexão (M3U ou Xtream Codes)
   - URL ou credenciais do servidor
   - Data de expiração
   - Preço da assinatura

### Via API

```bash
POST /api/clients
Headers: Authorization: Bearer <token>
Body: {
  "mac_address": "XX:XX:XX:XX:XX:XX",
  "app_assigned": "IBO REVENDA",
  "m3u_url": "http://exemplo.com/playlist.m3u",
  "expiration_date": "2024-12-31",
  "subscription_price": 29.90
}
```

## 🔄 Fluxo de Comunicação

1. **App IPTV** inicia e gera/obtém MAC address
2. App se conecta ao backend via Socket.io
3. Backend valida MAC e retorna configuração
4. App carrega playlist e inicia reprodução
5. **Painel Web** pode enviar comandos em tempo real:
   - Bloquear/desbloquear dispositivo
   - Suspender/ativar linha
   - Atualizar configuração
6. App recebe atualizações e ajusta comportamento

## 🛡️ Segurança

- Autenticação via JWT
- Criptografia de senhas com bcrypt
- Validação de MAC address
- Bloqueio de dispositivo
- Expiração automática de assinaturas
- Logs de atividade

## 📊 Estrutura do Projeto

```
IPTV/
├── backend/              # API Backend
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── models/       # Modelos de dados
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middleware
│   │   ├── services/     # Serviços (Socket, Scheduler)
│   │   ├── database/     # Configuração DB (SQL.js)
│   │   └── types/        # Tipos TypeScript
│   └── package.json
├── frontend/             # Painel Web
│   ├── src/
│   │   ├── app/          # Páginas Next.js
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Utilitários
│   │   └── types/        # Tipos TypeScript
│   └── package.json
├── mobile/               # App Mobile
│   ├── src/
│   │   ├── screens/      # Telas
│   │   ├── components/   # Componentes
│   │   ├── services/     # Serviços (API, Socket)
│   │   └── utils/        # Utilitários
│   └── package.json
├── README.md             # Documentação principal
├── INSTRUÇOES.md         # Instruções detalhadas
├── DOCUMENTACAO.md       # Documentação técnica
├── start.bat             # Script de inicialização Windows
└── start.sh              # Script de inicialização Linux/Mac
```

## 🧪 Testes

### Testar Backend

```bash
# Teste de saúde
curl http://localhost:3001/health

# Teste de login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iptv.com","password":"admin123"}'
```

### Testar Integração

1. Crie um cliente no painel
2. Anote o MAC address gerado
3. No app mobile, use o MAC address para ativação
4. Verifique se o app carrega os canais
5. No painel, suspenda o cliente
6. Verifique se o app para de funcionar

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se as dependências estão instaladas
- Confirme que não há conflito de porta
- Consulte os logs no terminal

### Frontend não conecta no backend
- Confirme NEXT_PUBLIC_API_URL no .env.local
- Verifique se o backend está rodando
- Verifique configurações de CORS

### App mobile não ativa
- Verifique se o MAC address está correto
- Confirme se o cliente existe no painel
- Verifique se o backend está acessível
- Confirme se o Socket.io está conectado

## 📚 Documentação Adicional

- **INSTRUÇOES.md** - Instruções detalhadas de configuração e teste
- **DOCUMENTACAO.md** - Documentação técnica completa da API

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 🤝 Suporte

Para suporte, consulte:
1. README.md (este arquivo)
2. INSTRUÇOES.md (instruções detalhadas)
3. DOCUMENTACAO.md (documentação técnica)

---

Desenvolvido com ❤️ para gestão de serviços IPTV
