# Como Gerar APK para Android TV, Celulares e Fire Stick

## 📱 Opções de Build para Android

Existem 3 formas principais de gerar o APK:

### 1. Expo Go (Desenvolvimento - Mais Fácil)
**Ideal para testes rápidos**

1. Instale o app **Expo Go** no seu dispositivo Android
2. Inicie o projeto: `cd mobile && npm start`
3. Escaneie o QR code com o app Expo Go
4. O app vai rodar diretamente no seu dispositivo

**Vantagens:**
- Não precisa buildar APK
- Atualizações em tempo real
- Funciona em qualquer dispositivo Android

**Desvantagens:**
- Requer app Expo Go instalado
- Não é um APK standalone

### 2. EAS Build (Recomendado para Produção)
**Ideal para distribuição real**

#### Pré-requisitos:
- Conta no Expo (https://expo.dev)
- Projeto configurado no EAS

#### Passos:

1. **Login no EAS:**
```bash
cd mobile
npx eas login
```

2. **Configurar o projeto:**
```bash
npx eas build:configure
```

3. **Gerar APK para Android:**
```bash
npx eas build --platform android --profile preview
```

4. **Ou gerar AAB para Google Play:**
```bash
npx eas build --platform android --profile production
```

**Vantagens:**
- APK standalone (não precisa Expo Go)
- Otimizado para produção
- Pode ser publicado na Google Play

**Desvantagens:**
- Requer conta Expo
- Demora para buildar (10-30 minutos)
- Pode ter custos (builds gratuitos limitados)

### 3. Development Build (Intermediário)
**Ideal para testes sem Expo Go**

```bash
npx expo run:android
```

**Vantagens:**
- APK standalone sem Expo Go
- Build local mais rápido
- Debug nativo

**Desvantagens:**
- Requer Android Studio e SDK
- Mais complexo de configurar

## 🚀 Recomendação para Teste Atual

Para testar imediatamente com sua lista M3U:

### Opção Mais Rápida (Expo Go):

1. **Iniciar o projeto:**
```bash
cd mobile
npm start
```

2. **No seu dispositivo Android:**
   - Instale o app "Expo Go" da Play Store
   - Abra o app e escaneie o QR code
   - O app vai carregar automaticamente

3. **Para testar:**
   - Use o MAC address: `AA:BB:CC:DD:EE:FF`
   - O app vai carregar sua lista M3U real

### Opção APK Standalone (EAS Build):

1. **Criar conta Expo:** https://expo.dev/signup

2. **Configurar EAS:**
```bash
cd mobile
npx eas login
npx eas build:configure
```

3. **Build do APK:**
```bash
npx eas build --platform android --profile preview
```

4. **Após o build:**
   - O APK estará disponível para download
   - Instale diretamente no dispositivo
   - Funciona sem Expo Go

## 📦 Instalação em Diferentes Dispositivos

### Android TV:
- Copie o APK para USB
- Conecte USB na TV
- Use File Commander ou similar para instalar
- Ou use ADB: `adb install app.apk`

### Fire TV Stick:
- Ative "Apps from Unknown Sources"
- Use Apps2Fire ou Downloader
- Envie o APK para o Fire Stick

### Celulares Android:
- Transferir APK via USB, Bluetooth ou download
- Instale normalmente
- Pode precisar permitir "Instalação de fontes desconhecidas"

## 🔧 Configuração do App para Produção

Quando for gerar o APK definitivo, altere em `mobile/app.json`:

```json
{
  "expo": {
    "name": "Seu Nome do App",
    "slug": "seu-nome-app",
    "version": "1.0.0",
    "android": {
      "package": "com.seudominio.app",
      "permissions": [...]
    }
  }
}
```

## 🧪 Teste Imediato com Expo Go

Para testar agora mesmo:

1. O backend está rodando em: http://localhost:5000
2. O frontend está rodando em: http://localhost:3000
3. Já criei um cliente de teste com sua lista M3U
4. MAC address para teste: `AA:BB:CC:DD:EE:FF`

Execute:
```bash
cd mobile
npm start
```

Escaneie o QR code com o app Expo Go e use o MAC acima!
