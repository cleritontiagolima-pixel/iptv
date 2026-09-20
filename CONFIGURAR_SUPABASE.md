# 🚀 Configuração Manual do Supabase

Como as credenciais API não têm permissão para criação automática de tabelas, siga estes passos:

## 📋 Passo 1: Acessar o SQL Editor

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/ejoaqiagngmzewyguhib
2. Clique em **SQL Editor** no menu lateral
3. Clique em **New Query**

## 📝 Passo 2: Copiar e Executar o Schema

1. Abra o arquivo: `backend/database/supabase-schema.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

## 👤 Passo 3: Criar Usuário Admin

No SQL Editor, execute este comando:

```sql
INSERT INTO users (name, email, password, role, credits) 
VALUES ('Admin', 'admin@iptv.com', '$2a$10$y1D/GN66yqnKy5vHMAdgse3P89MdQjzFOUO/u0UzHLG9aLmylP7nu', 'admin', 10000) 
ON CONFLICT (email) DO UPDATE SET password = '$2a$10$y1D/GN66yqnKy5vHMAdgse3P89MdQjzFOUO/u0UzHLG9aLmylP7nu';
```

## 🔧 Passo 4: Ativar Supabase no Backend

1. Abra o arquivo: `backend/.env`
2. Altere a linha:
   ```
   DATABASE_TYPE=sqlite
   ```
   Para:
   ```
   DATABASE_TYPE=supabase
   ```

## 🚀 Passo 5: Iniciar o Backend

```bash
cd backend
npm run dev
```

## ✅ Verificação

Se tudo estiver correto, você verá:
```
🗄️  Usando banco de dados: SUPABASE
Conexão Supabase estabelecida com sucesso
Banco de dados Supabase inicializado com sucesso
Usuário admin criado: admin@iptv.com / admin123
```

## 🔐 Credenciais do Admin

- **Email**: admin@iptv.com
- **Senha**: admin123

## ⚠️ Importante

- A chave service_role foi exposta anteriormente - **revogue e crie uma nova** no dashboard do Supabase
- Atualize a nova chave no arquivo `backend/.env`
- Nunca commite chaves reais no GitHub