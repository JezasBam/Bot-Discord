# 🎫 Ticket Bot - Sistem Tickete Discord

Bot Discord pentru sistem de tickete cu thread-uri private și forum integration.

## 🎯 Ce Face

Sistem complet de tickete cu:
- **Thread-uri private** pentru fiecare ticket
- **Forum integration** cu tag-uri colorate
- **Rol Support** dedicat pentru echipă
- **Transcript automat** la închidere
- **Suport bilingv** (Română/Engleză)

## 🚀 Quick Start

### **Setup Rapid**
```bash
npm install
npm run deploy        # Comenzi globale (~1h)
npm run deploy:guild  # Doar pe server (instant)
npm start             # Pornește botul
```

### **Development**
```bash
npm run dev           # Development mode
npm run lint          # Verifică cod
npm run format        # Formatează cod
npm test              # Rulează teste
```

## 📋 Comenzi Discord

### **Ticket System**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/ticketsetup` | Configurează sistem tickete (RO/EN) | Manage Guild |
| `/ping` | Test connectivity | - |

### **Moderare (Integrat)**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-uri forum | Manage Guild |

### **Context Menu**
| Acțiune | Descriere | Permisiuni |
|---------|-----------|------------|
| 🔇 Mute User | Mute temporar (1-1440 min) | Support Role |
| 👢 Kick User | Kick utilizator | Owner Only |
| 🔨 Ban User | Ban permanent cu auto-renewal | Owner Only |

## 🎯 Workflow Tickete

1. **Admin** rulează `/ticketsetup` → creează panel + rol Support + tag-uri
2. **User** apasă buton → completează formular → thread privat creat
3. **Support** primește notificare → apasă Join → intră în thread
4. **Închidere normală** → Close → transcript salvat → thread șters
5. **Închidere forum** → Buton Închide → aplică tag 🟢 Rezolvat

## 🎨 Tag-uri Colorate

- **🔵 INFO** - Informații generale (albastru)
- **🟠 Support** - Tickete active (portocaliu)  
- **🟢 Rezolvat** - Tickete închise (verde)

## ⚙️ Configurare

### **Environment Variables (.env)**
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=guild_id_for_dev    # Optional
LOG_LEVEL=info               # error/warn/info/debug
```

### **Permisiuni Bot Necesar**
- Manage Channels, Manage Roles
- View Channels, Send Messages
- Create Private Threads, Manage Threads
- Attach Files, Embed Links, Read Message History

## 📁 Structură

```
ticketbot/
├── src/
│   ├── index.js              # Entry point
│   ├── bot.js                # Bot initialization
│   ├── commands/             # Slash commands
│   ├── events/               # Event handlers
│   ├── features/tickets/     # Ticket logic
│   ├── config/               # Configuration
│   ├── core/                 # Logger, errors, retry
│   └── storage/              # Database layer
├── discordadmins/            # Moderare module
└── data/                     # Database files
```

## 🔧 Troubleshooting

### **Probleme Comune**
- **Bot nu pornește?** → Verifică `.env` token și permisiuni bot
- **Comenzile nu apar?** → Rulează `npm run deploy` (așteaptă 1h pentru global)
- **Erori tickete?** → Verifică permisiunile botului în canale/categorii
- **Tag-uri problemă?** → Rulează `/check-support-tag` pentru reparare

## 📦 Tech Stack

- **Discord.js v14** - API Discord
- **Node.js 22+** - Runtime
- **Pino** - Logging performant
- **Vitest** - Testing framework

---

**Part of:** Discord Bot Monorepo  
**Version:** 1.0.0
