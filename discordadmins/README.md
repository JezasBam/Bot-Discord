# 🛡️ Discord Admins - Moderare

Sistem de moderare Discord cu Mute, Kick, Ban și forum integration.

## 🎯 Ce Face

Modul de moderare cu:
- **User Context Menus** pentru acțiuni rapide
- **Forum integration** cu tracking complet
- **Tag-uri colorate** pentru organizare vizuală
- **Auto-renewal** pentru ban-uri permanente
- **Verificare automată** a tag-urilor

## 🚀 Quick Start

### **Integrare**
Acest modul este integrat în `ticketbot` și se încarcă automat.

### **Setup**
```bash
# Asigură-te că discordadmins este în ticketbot/
# Modul se încarcă automat la pornirea ticketbot
npm run ticketbot:start
```

## 📋 Comenzi & Acțiuni

### **Context Menu (Click Dreapta)**
| Acțiune | Descriere | Permisiuni |
|---------|-----------|------------|
| 🔇 Mute User | Mute temporar (1-1440 min) | Support Role |
| 👢 Kick User | Kick utilizator | Owner Only |
| 🔨 Ban User | Ban permanent cu auto-renewal | Owner Only |

### **Slash Commands**
| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-uri forum | Manage Guild |

## 🎯 Workflow Moderare

1. **Support** click dreapta → 🔇 Mute User → modal durată
2. **Owner** click dreapta → 👢 Kick / 🔨 Ban User
3. **Forum tracking** → thread automat cu tag 🟠 Support
4. **Unmute/Unban** → butoane direct din forum
5. **Auto-renewal** → ban permanent se reînnoiește la 6 zile

## 🎨 Tag-uri Colorate

- **🔵 INFO** - Informații generale (albastru)
- **🟠 Support** - Acțiuni de moderare (portocaliu)
- **🟢 Rezolvat** - Acțiuni rezolvate (verde)

## ⚙️ Configurare

### **Roluri Support (config/index.js)**
```javascript
moderation: {
  adminRoles: ['Support'],  // Doar rolul Support
  muteDuration: 5           // minute default
}
```

### **Permisiuni**
- **Support Role** - Doar pentru mute
- **Owner Only** - Pentru kick/ban
- **Manage Guild** - Pentru comenzi admin

## 📁 Structură

```
discordadmins/
├── commands/
│   ├── moderation.js          # Mute, Kick, Ban
│   ├── check-support-tag.js   # Verificare tag-uri
│   └── ensure-info-tag.js     # Creare INFO tag
├── utils/
│   ├── moderation-forum.js   # Forum management + tracking
│   └── permissions.js        # Verificări permisiuni
├── config/
│   └── index.js             # Configurare moderare
├── index.js                  # Punct de intrare
└── README.md                # Acest fișier
```

## 🔧 Integrare în Ticket Bot

### **1. Import comenzi**
```javascript
import { executeMute, executeBan, executeKick, handleMuteModal } 
from '../../../discordadmins/commands/moderation.js';
```

### **2. Adaugă în interactionCreate.js**
```javascript
// Context menu commands
case '🔇 Mute User':
  await executeMute(interaction, context);
  break;
case 'Kick User':
  await executeKick(interaction, context);
  break;
case 'Ban User':
  await executeBan(interaction, context);
  break;

// Modal submit
if (interaction.customId.startsWith('mute_')) {
  await handleMuteModal(interaction, context);
  return;
}
```

## 🔒 Securitate

- Verificare ierarhie roluri
- Protecție auto-acțiuni (kick/ban self)
- Validare permisiuni multiple
- Logare completă acțiuni
- Auto-renewal securizat pentru ban-uri

## 📝 Caracteristici

### **Moderare**
- **Support Mute**: Doar rolul Support poate mute
- **Durată personalizabilă**: 1-1440 minute
- **Motiv opțional**: Posibilitatea de a adăuga motiv
- **Owner Kick/Ban**: Doar owner-ul poate folosi
- **Auto-unmute**: Ridicare automată după durată
- **Auto-renewal**: Ban permanent cu reînnoire la 6 zile

### **Forum Integration**
- **Thread-uri private**: Fiecare acțiune creează thread
- **Tag-uri colorate**: Organizare vizuală cu buline
- **Buton de acțiune**: Unmute/Unban direct din forum
- **Tracking complet**: Istoric complet al tuturor acțiunilor
- **Embed-uri detaliate**: Informații complete despre acțiuni

### **Management Tag-uri**
- **Verificare automată**: Detectează tag-uri fără buline
- **Reparare automată**: Înlocuiește tag-uri vechi
- **Eliminare duplicate**: Curăță tag-uri redundante
- **Creare automată**: Adaugă tag-uri lipsă

## 📦 Tech Stack

- **Discord.js v14** - API Discord
- **Node.js 18+** - Runtime

---

**Part of:** Discord Bot Monorepo  
**Integrated in:** ticketbot  
**Version:** 1.0.0
