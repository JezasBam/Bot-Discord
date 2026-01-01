# 🎫 Discord Ticket Bot

Bot Discord pentru sistem de tickete cu thread-uri private și forum integration.

## ✨ Features

- **Bilingv** - Română și Engleză
- **Thread-uri private** - fiecare ticket e un thread privat
- **Rol Support** - echipa de support dedicată
- **Transcript automat** - salvat la închidere
- **Arhivare fișiere** - attachments salvate automat
- **Forum support** - log în canal forum cu tag-uri colorate
- **Buton Închide** - închidere ticket cu tag Rezolvat
- **Tag-uri colorate** - 🔵 INFO, 🟠 Support, 🟢 Rezolvat
- **Verificare automată** - reparare tag-uri fără buline

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

## 📋 Comenzi

| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/ticketsetup` | Configurează sistemul de tickete (RO/EN) | Manage Guild |
| `/ping` | Test - verifică că botul răspunde | - |

**Comenzi Admin (discordadmins):**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-urile forum | Manage Guild |

## 🎯 Cum funcționează

### **Workflow Ticket:**
1. **Admin** rulează `/ticketsetup` → creează panel + rol Support + tag-uri
2. **User** apasă butonul → completează formular → se creează thread privat
3. **Support** vede notificare → apasă Join → intră în thread
4. **Închidere normală** → Close → transcript salvat → thread șters
5. **Închidere din forum** → Buton Închide → aplică tag 🟢 Rezolvat

### **Sistem de Tag-uri:**
- **🔵 INFO** - Informații generale (albastru)
- **🟠 Support** - Tickete active (portocaliu)  
- **🟢 Rezolvat** - Tickete închise (verde)

### **Verificare Automată:**
- La fiecare click pe butonul "Închide"
- Bot verifică tag-urile forum-ului
- Repară automat tag-uri fără buline
- Elimină tag-uri duplicate

## 🛠 Development

```bash
npm run dev          # watch mode
npm run lint         # verifică cod
npm run format       # formatează cod
npm test             # rulează teste
```

> La `npm start` se rulează automat: lint → format check → tests → start

## 📁 Structură

```
src/
├── index.js              # Entry point
├── bot.js                # Inițializare bot
├── config/               # Configurare + constante
├── core/                 # Logger, errors, retry, shutdown
├── commands/             # Slash commands
├── events/               # Event handlers
├── features/tickets/     # Logică tickete (handlers, ui, i18n)
├── storage/              # Database + repositories
└── util/                 # Helpers (paths, preflight)

discordadmins/
├── commands/
│   ├── moderation.js     # Mute, Kick, Ban
│   ├── check-support-tag.js  # Verificare tag-uri
│   └── ensure-info-tag.js     # Creare INFO tag
├── utils/
│   ├── moderation-forum.js   # Forum management
│   └── permissions.js        # Verificări permisiuni
└── config/
    └── index.js              # Configurare moderare
```

## ⚙️ Permisiuni Bot

Botul are nevoie de:
- Manage Channels, Manage Roles
- View Channels, Send Messages
- Create Private Threads, Manage Threads
- Attach Files, Embed Links, Read Message History

## 📝 Fișiere importante

| Fișier | Scop |
|--------|------|
| `.env` | Variabile secrete (NU se urcă pe git) |
| `.env.example` | Template pentru `.env` |
| `data/db.json` | Baza de date (auto-creată) |
| `REFACTOR_ANALYSIS.md` | Analiză cod discordadmins |

## 🔧 Troubleshooting

**Bot nu pornește?**
- Verifică `.env` - token valid?
- Verifică permisiunile botului pe server

**Comenzile nu apar?**
- Rulează `npm run deploy`
- Așteaptă ~1h pentru comenzi globale

**Erori la tickete?**
- Verifică că botul are permisiuni în categoria/canalul respectiv

**Probleme tag-uri?**
- Rulează `/check-support-tag` pentru verificare
- Bot-ul repară automat tag-urile la utilizare

## 🎨 Caracteristici Noi

### **Tag-uri Colorate cu Buline:**
- **🔵 INFO** - Albastru cu borduri albastre
- **🟠 Support** - Portocaliu cu borduri portocalii
- **🟢 Rezolvat** - Verde cu borduri verzi

### **Buton Închide în Forum:**
- Postări în forum cu buton "Închide"
- Aplică automat tag-ul "Rezolvat"
- Rămâne vizibil după închidere

### **Verificare Automată:**
- Detectează tag-uri vechi fără buline
- Le înlocuiește automat cu tag-uri corecte
- Elimină tag-uri duplicate

### **Forum Integration:**
- Thread-uri private pentru tickete
- Postări în forum pentru tracking
- Tag-uri colorate pentru organizare
- Buton de închidere în postări
