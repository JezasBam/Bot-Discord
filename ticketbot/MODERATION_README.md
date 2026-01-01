# Sistem de Moderare Discord

Acest sistem oferă comenzi de moderare accesibile prin User Context Menus (clic dreapta pe un utilizator).

> **Notă:** Funcționalitățile de moderare sunt acum localizate în folderul `discordadmins/` pentru o mai bună organizare și mentenanță.

## 📁 Structură Nouă

```
discordadmins/
├── commands/moderation.js  # Toate comenzile de moderare
├── utils/permissions.js    # Sistem permisiuni
├── config/index.js         # Configurare specifică
├── index.js               # Loader și exporturi
└── README.md              # Documentație detaliată
```

## 🚀 Funcționalități

### **Mute/Unmute User** 🔇/🔊
- **Smart Detection**: Verifică automat dacă utilizatorul are mute
- **Dacă NU are mute**: Aplică mute cu durată configurabilă
- **Dacă ARE mute**: Scoate mute-ul imediat
- Restricții complete: nu poate scrie, vorbi sau crea thread-uri
- Timer automat cu anunț de timp rămas
- Auto-unmute la expirare (doar pentru mute manual)

### **Ban User** 🔨
- Elimină permanent un utilizator din server
- Blocare reconectare
- Logare automată a acțiunii

### **Kick User** 👢
- Elimină temporar un utilizator
- Permite reconectarea
- Logare automată a acțiunii

## 📋 Configurare

### Variabile de mediu (.env)
```env
# Moderation settings
ADMIN_ROLES=Admin,Moderator,Staff
MUTE_DURATION_MINUTES=5
MOD_LOG_CHANNEL=mod-logs
```

### Permisiuni necesare
Bot-ul necesită următoarele permisiuni:
- `Administrator` sau `ManageGuild`
- `KickMembers`
- `BanMembers`
- `ModerateMembers`

## 🔧 Utilizare

1. **Clic dreapta** pe un utilizator în Discord
2. **Aplicații** → **Numele Bot-ului**
3. Alege una dintre opțiuni:
   - **Mute User** - Mută temporar
   - **Ban User** - Ban permanent
   - **Kick User** - Elimină temporar

## 🛡️ Sistem de Permisiuni

Utilizatorii pot folosi comenzile dacă au:
- Permisiuni Discord: `Administrator`, `ManageGuild`, `KickMembers`, sau `BanMembers`
- SAU un rol configurat în `ADMIN_ROLES` (ex: "Admin", "Moderator", "Staff")

## 📊 Embed-uri de Confirmare

Fiecare acțiune generează un embed informativ cu:
- Utilizatorul vizat
- Tipul acțiunii
- Admin-ul care a executat
- Timp/durată (pentru mute)
- Timestamp

## 🔧 Instalare

1. Asigură-te că ai variabilele de mediu configurate
2. Rulează `npm run deploy` pentru a încărca comenzile
3. Pornește bot-ul cu `npm start`

## ⚠️ Note Importante

- Bot-ul trebuie să aibă rol superior utilizatorilor vizate
- Verifică permisiunile bot-ului în server settings
- Durata mute-ului este configurabilă prin variabila `MUTE_DURATION_MINUTES`
- Acțiunile sunt logate automat în consola bot-ului
