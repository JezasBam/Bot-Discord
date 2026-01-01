# 🌐 Frontend - Discord Bot Interface

Interfață web React pentru managementul botului Discord cu real-time updates.

## 🎯 Ce Face

Frontend-ul oferă:
- **Dashboard** pentru management bot
- **Embed Editor** pentru mesaje personalizate
- **Auth System** cu OAuth2 Discord
- **Real-time updates** via Socket.io
- **Project Management** integrat

## 🚀 Quick Start

### **Instalare & Pornire**
```bash
npm install
npm run dev          # Development server (localhost:5173)
npm run build        # Build pentru production
npm run preview      # Preview build
```

### **Development**
```bash
npm run test         # Rulează teste
npm run test:watch   # Teste în watch mode
npm run test:ui      # Test UI interface
npm run lint         # Verifică codul
npm run format       # Formatează codul
```

## 📱 Features Principale

### **🔐 Authentication**
- OAuth2 Discord integration
- Token management securizat
- User profile și permissions

### **📝 Embed Editor**
- Visual editor pentru Discord embeds
- Real-time preview
- Export/import configurații
- Template management

### **🎛️ Dashboard**
- Bot status și statistics
- Server management
- Real-time events display
- Configuration panel

### **🔄 Real-time Updates**
- Socket.io integration
- Live Discord events
- Channel updates
- Message tracking

## 🛠 Tech Stack

### **Core**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### **Styling**
- **TailwindCSS** - Utility-first CSS
- **PostCSS** - CSS processing
- **Lucide React** - Icon library

### **State & Data**
- **Dexie** - IndexedDB wrapper
- **Zod** - Schema validation
- **React Hooks** - State management

### **Communication**
- **Socket.io Client** - Real-time events
- **Axios** - HTTP requests

### **Testing**
- **Vitest** - Unit testing
- **Testing Library** - Component testing
- **MSW** - API mocking

## 📁 Structură

```
frontend/
├── src/
│   ├── api/              # API calls și endpoints
│   ├── app/              # App shell și routing
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature modules
│   │   ├── auth/         # Authentication system
│   │   ├── discord/      # Discord integration
│   │   ├── embedEditor/  # Embed editor
│   │   └── projects/     # Project management
│   ├── hooks/            # Custom React hooks
│   ├── shared/           # Shared utilities
│   └── test/             # Test utilities
├── public/               # Static assets
└── dist/                 # Build output
```

## 🔧 Configurare

### **Environment Variables**
```env
VITE_API_URL=http://localhost:4000
VITE_DISCORD_CLIENT_ID=your_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### **Vite Config**
- **Dev Server**: localhost:5173
- **Build Output**: dist/
- **Proxy**: API server pe localhost:4000

## 🎨 Component Structure

### **Feature-based Architecture**
Fiecare feature are propriul său director:
- `components/` - UI components specifice
- `hooks/` - Custom hooks
- `types/` - TypeScript definitions
- `utils/` - Feature utilities

### **Shared Components**
- `components/ui/` - Reusable UI components
- `shared/styles/` - Global styles
- `shared/utils/` - Common utilities

## 🔌 Integrare

### **Cu Discord Hooks API**
```typescript
// Socket.io connection
import io from 'socket.io-client';

const socket = io('http://localhost:4000');
socket.on('channelUpdate', handleUpdate);
```

### **Cu Discord Auth**
```typescript
// OAuth2 flow
const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
```

## 📊 Performance

### **Optimizări**
- **Code splitting** - Lazy loading per feature
- **Tree shaking** - Elimină codul nefolosit
- **IndexedDB** - Local storage caching
- **Virtual scrolling** - Liste mari eficiente

### **Bundle Analysis**
```bash
npm run build
npm run preview
# Deschide http://localhost:4173
```

## 🧪 Testing

### **Unit Tests**
```bash
npm run test              # Rulează toate testele
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### **Component Testing**
- Testing Library pentru React components
- MSW pentru API mocking
- Vitest pentru runner

## 🔒 Securitate

- **OAuth2** - Authentication securizat
- **Environment variables** - Secrete protejate
- **CORS** - Cross-origin requests
- **Input validation** - Zod schemas

---

**Part of:** Discord Bot Monorepo  
**Version:** 1.0.0
