# 🔧 Discord Hooks - API & Webhooks

Modul API pentru webhook-uri și integrări externe cu real-time events.

## 🎯 Ce Face

Acest modul oferă:
- **API REST** pentru integrări externe
- **Socket.io** pentru real-time events
- **Webhook management** pentru Discord events
- **Event broadcasting** către frontend

## 🚀 Quick Start

### **Instalare & Pornire**
```bash
npm install
npm run dev        # Development mode
npm start          # Production mode
```

### **API Endpoints**
- Server rulează pe portul **4000**
- Socket.io pentru real-time communication
- REST API pentru webhook management

## 📡 API Features

### **Real-time Events**
```javascript
// Channel events
channelCreate, channelDelete, channelUpdate

// Message events  
messageCreate, messageDelete, messageUpdate
```

### **Socket.io Events**
```javascript
// Frontend poate asculta:
io.on("channelUpdate", (data) => {
  // { type: "create|delete|update", guildId }
});

io.on("messageUpdate", (data) => {
  // { type: "create|delete|update", channelId }
});
```

## 🛠 Development

```bash
npm run dev          # Development
npm run test         # Rulează teste
npm run test:watch   # Teste în watch mode
npm run lint         # Verifică codul
npm run format       # Formatează codul
```

## 📁 Structură

```
discordhooks/
├── src/
│   ├── api/             # API server și routes
│   ├── config/          # Configurare
│   ├── core/            # Logger și utilities
│   └── index.js         # Entry point
├── tests/               # Test files
└── package.json
```

## 🔧 Configurare

### **Environment Variables**
```env
DISCORD_TOKEN=token_bot
CLIENT_ID=client_id
DISCORD_CLIENT_SECRET=client_secret
```

### **API Server**
- **Port**: 4000
- **CORS**: Enabled pentru frontend
- **Socket.io**: Real-time events

## 📦 Tech Stack

- **Express** - API server
- **Socket.io** - Real-time communication
- **Discord.js** - Discord events
- **Axios** - HTTP requests
- **Pino** - Logging
- **Vitest** - Testing

## 🔌 Integrare

### **Cu Frontend**
```javascript
// Conectare la real-time events
import io from 'socket.io-client';

const socket = io('http://localhost:4000');
socket.on('channelUpdate', handleChannelUpdate);
```

### **Cu Ticket Bot**
- Primește events de la Discord client
- Broadcasts către frontend conectat
- Handlează network errors cu retry logic

## 🔒 Securitate

- Environment variables pentru secrete
- CORS configuration pentru frontend
- Error handling pentru network issues
- Login retry cu exponential backoff

---

**Part of:** Discord Bot Monorepo  
**Version:** 1.0.0
