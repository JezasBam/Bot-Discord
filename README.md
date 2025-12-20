# 🎫 Discord Ticket Bot

Bot Discord pentru sistem de tickete cu thread-uri private.

## ✨ Features

- **Bilingv** - Română și Engleză
- **Thread-uri private** - fiecare ticket e un thread privat
- **Rol Support** - echipa de support dedicată
- **Transcript automat** - salvat la închidere
- **Arhivare fișiere** - attachments salvate automat
- **Forum support** - log în canal forum

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

## 🎯 Cum funcționează

1. **Admin** rulează `/ticketsetup` → creează panel + rol Support
2. **User** apasă butonul → completează formular → se creează thread privat
3. **Support** vede notificare → apasă Join → intră în thread
4. **Oricine** apasă Close → transcript salvat → thread șters

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

## 🔧 Troubleshooting

**Bot nu pornește?**
- Verifică `.env` - token valid?
- Verifică permisiunile botului pe server

**Comenzile nu apar?**
- Rulează `npm run deploy`
- Așteaptă ~1h pentru comenzi globale

**Erori la tickete?**
- Verifică că botul are permisiuni în categoria/canalul respectiv
