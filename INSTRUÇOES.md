# Instruções de Configuração e Teste

## 🗄️ Configuração do PostgreSQL

### Windows

1. **Instalar PostgreSQL**
   - Baixe e instale PostgreSQL: https://www.postgresql.org/download/windows/
   - Durante a instalação, defina uma senha para o usuário `postgres`

2. **Criar Banco de Dados**
   ```bash
   # Abrir SQL Shell (psql)
   # Digite a senha do postgres quando solicitado
   
   CREATE DATABASE iptv_management;
   \q
   ```

3. **Configurar Backend**
   - Abra o arquivo `backend/.env`
   - Altere as configurações do banco de dados:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=iptv_management
   DB_USER=postgres
   DB_PASSWORD=sua_senha_aqui
   ```

### Linux/Mac

1. **Instalar PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Mac (com Homebrew)
   brew install postgresql
   brew services start postgresql
   ```

2. **Criar Banco de Dados**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE iptv_management;
   \q
   ```

3. **Configurar Backend**
   - Mesmo processo do Windows

## 🚀 Iniciar o Sistema

### Windows
```bash
# Duplo clique no arquivo start.bat
# Ou execute no terminal:
start.bat
```

### Linux/Mac
```bash
# Dar permissão de execução
chmod +x start.sh

# Executar
./start.sh
```

### Manualmente (3 terminais)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Mobile (opcional):**
```bash
cd mobile
npm start
```

## 🧪 Testes Funcionais

### 1. Teste de Backend

```bash
# Testar saúde do backend
curl http://localhost:3001/health

# Resposta esperada:
# {"status":"ok","timestamp":"..."}
```

### 2. Teste de Autenticação

**Registrar novo usuário:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Revendedor",
    "email": "teste@email.com",
    "password": "123456",
    "role": "reseller"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iptv.com",
    "password": "admin123"
  }'
```

### 3. Teste de Criação de Cliente

```bash
# Substitua TOKEN pelo token recebido no login
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "app_assigned": "IBO REVENDA",
    "m3u_url": "http://exemplo.com/playlist.m3u",
    "expiration_date": "2024-12-31",
    "subscription_price": 29.90,
    "notes": "Cliente teste"
  }'
```

### 4. Teste do Painel Web

1. Acesse: http://localhost:3000
2. Faça login com `admin@iptv.com` / `admin123`
3. Verifique se o dashboard carrega
4. Crie um novo cliente
5. Verifique se aparece na tabela
6. Teste suspender/ativar cliente
7. Teste bloqueio de dispositivo
8. Teste gerenciamento de créditos

### 5. Teste do Aplicativo Mobile

**No terminal do mobile:**
```bash
cd mobile
npm start
```

**No emulador ou dispositivo:**
1. Abra o app Expo
2. Escaneie o QR code
3. Aguarde a ativação automática
4. Se falhar, insira o MAC address manualmente
5. Verifique se carrega a tela principal

**Testar comunicação:**
1. No painel web, suspenda o cliente
2. No app, verifique se para de funcionar
3. No painel, ative novamente
4. No app, verifique se volta a funcionar

## 📱 Testes Específicos

### Teste de Expiração Automática

1. Crie um cliente com data de expiração no passado
2. Verifique se o status muda para "expired" automaticamente
3. Tente ativar o app com esse MAC
4. Verifique se recebe erro de expiração

### Teste de Bloqueio de Dispositivo

1. Crie um cliente e ative no app
2. No painel, bloqueie o dispositivo
3. No app, verifique se para de funcionar
4. No painel, desbloqueie
5. No app, verifique se volta a funcionar

### Teste de Créditos

1. Verifique saldo atual do usuário
2. Adicione créditos
3. Verifique se saldo atualizou
4. Crie um novo cliente
5. Verifique se créditos foram deduzidos
6. Verifique histórico de transações

### Teste de Socket.io

1. Ative o app com um MAC address
2. No painel, faça alterações no cliente
3. Verifique se o app recebe atualizações em tempo real
4. Verifique logs do console para confirmação

## 🔍 Troubleshooting

### Backend não inicia
- Verifique se PostgreSQL está rodando
- Confirme credenciais no .env
- Verifique se a porta 3001 está livre
- Consulte logs no terminal

### Frontend não conecta
- Verifique se backend está rodando
- Confirme NEXT_PUBLIC_API_URL
- Verifique console do navegador
- Limpe cache do navegador

### App não ativa
- Verifique se backend está acessível
- Confirme MAC address correto
- Verifique logs do Expo
- Teste com curl a API de configuração

### Socket não conecta
- Verifique se SOCKET_PORT está correta
- Confirme se CORS está configurado
- Verifique logs do backend
- Teste com Socket.io client tool

## 📊 Checklist de Testes

- [ ] Backend inicia sem erros
- [ ] Frontend carrega corretamente
- [ ] Login funciona com admin padrão
- [ ] Criação de usuário funciona
- [ ] Criação de cliente funciona
- [ ] Listagem de clientes funciona
- [ ] Edição de cliente funciona
- [ ] Exclusão de cliente funciona
- [ ] Suspensão/ativação funciona
- [ ] Bloqueio de dispositivo funciona
- [ ] Sistema de créditos funciona
- [ ] Expiração automática funciona
- [ ] App mobile instala
- [ ] App ativa com MAC
- [ ] App carrega canais
- [ ] App reproduz vídeo
- [ ] Comunicação em tempo real funciona
- [ ] Controle parental funciona
- [ ] Busca de canais funciona
- [ ] Filtro por grupo funciona

## 🎯 Próximos Passos

Após concluir os testes:

1. **Personalizar branding**
   - Alterar cores e logos
   - Personalizar nome do app

2. **Configurar produção**
   - Configurar banco de dados em nuvem
   - Configurar domínio e SSL
   - Otimizar performance

3. **Adicionar recursos extras**
   - EPG completo
   - Gravação de programas
   - Multi-dispositivo
   - Analytics

4. **Documentação final**
   - Manual do usuário
   - Manual do administrador
   - API documentation
