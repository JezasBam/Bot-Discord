# 🤖 Discord Bot Monorepo

Sistem complet de moderare și tickete pentru Discord cu 4 module integrate.

## 🎯 Ce Face Proiectul

Acesta este un **bot Discord complet** cu următoarele componente:

- **🎫 Ticket Bot** - Sistem tickete cu thread-uri private și forum integration
- **🛡️ Discord Admins** - Moderare (Mute, Kick, Ban) cu tracking în forum
- **🔧 Discord Hooks** - API web pentru webhook-uri și integrări externe  
- **🌐 Frontend** - Interfață web React pentru management

## ✨ Features Principale

### **🎫 Sistem Tickete**
- Thread-uri private pentru fiecare ticket
- Forum integration cu tag-uri colorate
- Buton de închidere cu tag Rezolvat
- Transcript automat și arhivare fișiere
- Suport bilingv (Română/Engleză)

### **🛡️ Sistem Moderare**
- Mute temporar cu durată personalizabilă
- Kick și Ban permanent cu auto-renewal
- Forum tracking pentru toate acțiunile
- Tag-uri colorate: 🔵 INFO, 🟠 Support, 🟢 Rezolvat
- Verificare automată și reparare tag-uri

### **🎨 Tag-uri Colorate**
- **🔵 INFO** - Informații generale (albastru)
- **🟠 Support** - Acțiuni de moderare (portocaliu)
- **🟢 Rezolvat** - Acțiuni rezolvate (verde)
- Verificare automată a tag-urilor fără buline
- Eliminare tag-uri duplicate

## 🚀 Comenzi Importante

### **Setup Rapid**
```bash
npm install                    # Instalează toate dependențele
npm run deploy                 # Deploy comenzi globale (~1h)
npm run deploy:guild           # Deploy doar pe server (instant)
npm start                      # Pornește toate serviciile
```

### **Development**
```bash
npm run dev                    # Pornește toate modulele în development
npm run dev:minimal            # Doar ticketbot + discordadmins
npm run frontend:dev           # Doar frontend React
npm run test                   # Rulează toate testele
npm run lint                   # Verifică codul
```

### **Module Specifice**
```bash
npm run ticketbot:start        # Doar botul de tickete
npm run hooks:start            # Doar API webhooks
npm run frontend:build         # Build frontend
```

## 📋 Comenzi Discord

### **Ticket System**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/ticketsetup` | Configurează sistem tickete | Manage Guild |
| `/ping` | Test connectivity | - |

### **Moderare (Context Menu)**
| Acțiune | Descriere | Permisiuni |
|---------|-----------|------------|
| 🔇 Mute User | Mute temporar (1-1440 min) | Support Role |
| 👢 Kick User | Kick utilizator | Owner Only |
| 🔨 Ban User | Ban permanent cu auto-renewal | Owner Only |

### **Admin Commands**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-uri forum | Manage Guild |

## ⚙️ Configurare

### **Environment Variables (.env)**
```env
# Required
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id
DISCORD_CLIENT_SECRET=your_application_client_secret
DISCORD_REDIRECT_URI=http://localhost:3001/auth/callback

# Optional
GUILD_ID=                    # Pentru deploy rapid pe un singur server
LOG_LEVEL=warn               # error/warn/info/debug
```

### **Structură Proiect**
```
Bot-Discord/
├── ticketbot/          # 🎫 Bot principal tickete + moderare
├── discordadmins/      # 🛡️ Modul moderare integrat
├── discordhooks/       # 🔧 API webhooks (Express + Socket.io)
├── frontend/           # 🌐 Interfață React (Vite + TypeScript)
├── shared/             # 📦 Utilități comune
└── callback-server.js  # 🔄 OAuth callback handler
```

## 🔧 Troubleshooting

### **Probleme Comune**
- **Bot nu pornește?** → Verifică `.env` și permisiunile botului
- **Comenzile nu apar?** → Rulează `npm run deploy` (așteaptă 1h pentru global)
- **Erori tickete?** → Verifică permisiunile botului în canale
- **Tag-uri problemă?** → Rulează `/check-support-tag`

### **Permisiuni Bot Necesar**
- Manage Channels, Manage Roles
- View Channels, Send Messages  
- Create Private Threads, Manage Threads
- Attach Files, Embed Links, Read Message History

## 📚 Documentație Detaliată

- **[Ticket Bot](./ticketbot/README.md)** - Documentație completă sistem tickete
- **[Discord Admins](./discordadmins/README.md)** - Documentație sistem moderare  
- **[Refactoring Analysis](./discordadmins/REFACTOR_ANALYSIS.md)** - Analiză cod și recomandări

## 🔒 Securitate & Performanță

### **Securitate**
- Verificări permisiuni multiple niveluri
- Protecție auto-acțiuni (kick/ban self)
- Logging complet al tuturor acțiunilor
- Auto-renewal securizat pentru ban-uri

### **Performanță**
- Logging eficient cu Pino
- Error handling robust
- Memory management automat
- Architecture modulară pentru scalabilitate

## � Tech Stack

- **Backend**: Node.js 22+, Discord.js v14
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **API**: Express, Socket.io, CORS
- **Testing**: Vitest, Testing Library
- **Tools**: ESLint, Prettier, Pino Logger

---
