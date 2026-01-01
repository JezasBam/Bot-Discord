# 🤖 Discord Bot Monorepo

Sistem complet de moderare și tickete pentru Discord cu multiple module integrate.

## 🎯 Overview

Acest proiect conține un sistem complet de moderare și management tickete pentru servere Discord, cu următoarele componente:

- **🎫 Ticket Bot** - Sistem de tickete cu thread-uri private și forum integration
- **🛡️ Discord Admins** - Sistem de moderare cu mute, kick, ban și forum tracking
- **🔧 Discord Hooks** - Webhooks și integrări externe
- **🌐 Frontend** - Interfață web pentru management și configurare

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

## 🚀 Quick Start

### 1. Instalare
```bash
npm install
```

### 2. Configurare `.env`
```env
DISCORD_TOKEN=token_bot_aici
CLIENT_ID=client_id_aici
GUILD_ID=guild_id_pentru_dev    # opțional
LOG_LEVEL=info                   # opțional: error/warn/info/debug
```

### 3. Deploy comenzi
```bash
npm run deploy        # global (durează ~1h)
npm run deploy:guild  # doar pe guild (instant)
```

### 4. Pornire
```bash
npm start
```

## 📁 Structură Proiect

```
discord-bot-monorepo/
├── ticketbot/                 # 🎫 Sistem de tickete
│   ├── src/
│   │   ├── commands/          # Slash commands
│   │   ├── features/tickets/  # Logică tickete
│   │   ├── events/            # Event handlers
│   │   └── config/            # Configurare
│   └── README.md              # Documentație ticketbot
├── discordadmins/             # 🛡️ Sistem moderare
│   ├── commands/              # Moderare commands
│   ├── utils/                 # Permisiuni și forum
│   └── README.md              # Documentație moderare
├── discordhooks/              # 🔧 Webhooks și integrări
│   ├── src/                   # API endpoints
│   └── README.md              # Documentație hooks
├── frontend/                  # 🌐 Interfață web
│   ├── src/                   # React components
│   └── README.md              # Documentație frontend
├── shared/                    # 📦 Utilități comune
└── package.json               # Configurare monorepo
```

## 📋 Comenzi Principale

### **Ticket Bot**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/ticketsetup` | Configurează sistemul de tickete | Manage Guild |
| `/ping` | Test - verifică că botul răspunde | - |

### **Discord Admins**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-urile forum | Manage Guild |

### **Context Menu (Discord Admins)**
| Acțiune | Descriere | Permisiuni |
|---------|-----------|------------|
| 🔇 Mute User | Mute temporar | Support Role |
| 👢 Kick User | Kick utilizator | Owner Only |
| 🔨 Ban User | Ban permanent | Owner Only |

## 🎯 Workflow-uri

### **Workflow Tickete:**
1. **Admin** rulează `/ticketsetup` → creează panel + tag-uri
2. **User** apasă buton → completează formular → thread privat
3. **Support** vede notificare → apasă Join → intră în thread
4. **Închidere normală** → Close → transcript salvat
5. **Închidere forum** → Buton Închide → tag 🟢 Rezolvat

### **Workflow Moderare:**
1. **Support** click dreapta → 🔇 Mute User → modal durată
2. **Owner** click dreapta → 👢 Kick User / 🔨 Ban User
3. **Forum tracking** → thread automat cu tag 🟠 Support
4. **Unmute/Unban** → butoane direct din forum
5. **Auto-renewal** → ban permanent se reînnoiește

## 🛠 Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Tests
npm test
```

### **Module Specifice:**
```bash
# Ticket bot
npm run ticketbot:dev
npm run ticketbot:build

# Discord admins
npm run discordadmins:dev
npm run discordadmins:build

# Frontend
npm run frontend:dev
npm run frontend:build
```

## ⚙️ Configurare

### **Environment Variables:**
```env
DISCORD_TOKEN=token_bot_aici
CLIENT_ID=client_id_aici
GUILD_ID=guild_id_pentru_dev
LOG_LEVEL=info
```

### **Configurare Moderare:**
```javascript
// ticketbot/src/config/index.js
moderation: {
  adminRoles: ['Support'],
  muteDuration: 5
}
```

## 🔧 Troubleshooting

### **Bot nu pornește?**
- Verifică `.env` - token valid?
- Verifică permisiunile botului pe server

### **Comenzile nu apar?**
- Rulează `npm run deploy`
- Așteaptă ~1h pentru comenzi globale

### **Erori la tickete?**
- Verifică permisiunile botului în categorii/canale
- Rulează `/check-support-tag` pentru verificare tag-uri

### **Probleme moderare?**
- Verifică rolul Support este configurat corect
- Owner-ul are permisiuni necesare
- Forum-ul de moderare există

## 📚 Documentație

- **[Ticket Bot](./ticketbot/README.md)** - Documentație completă sistem tickete
- **[Discord Admins](./discordadmins/README.md)** - Documentație sistem moderare
- **[Refactoring Analysis](./discordadmins/REFACTOR_ANALYSIS.md)** - Analiză cod și recomandări

## 🔒 Securitate

- **Verificări permisiuni** - Multiple niveluri de securitate
- **Protecție auto-acțiuni** - Previne kick/ban self
- **Logging complet** - Toate acțiunile sunt logate
- **Role hierarchy** - Verificare ierarhie roluri
- **Auto-renewal securizat** - Ban permanent cu reînnoire automată

## 📦 Dependențe

- **Discord.js** v14+ - API Discord
- **Node.js** 18+ - Runtime
- **React** - Frontend interface
- **Pino** - Logging
- **Vitest** - Testing

## 🎨 Caracteristici Unice

### **Tag-uri Colorate cu Buline:**
- Sistem unic de organizare vizuală
- Verificare automată a tag-urilor
- Eliminare duplicate și reparare automată

### **Forum Integration:**
- Tracking complet al tuturor acțiunilor
- Thread-uri private pentru tickete și moderare
- Butoane de acțiune direct din forum

### **Auto-renewal System:**
- Ban permanent cu reînnoire la fiecare 6 zile
- Sistem robust împotriva expirării
- Logging complet al reînnoirilor

## 📊 Performance

- **Logging eficient** - Pino pentru performanță
- **Error handling** - Gestionare robustă a erorilor
- **Memory management** - Curățare automată a resurselor
- **Scalable architecture** - Design modular pentru extensibilitate

## 🚀 Future Features

- [ ] Dashboard web pentru management
- [ ] Sistem de raportare avansat
- [ ] Integrări cu platforme externe
- [ ] Sistem de notificări personalizate
- [ ] Backup automat al configurațiilor

---

**Autor:** Cascading AI Assistant  
**Versiune:** 1.0.0  
**Licență:** MIT
