# Discord Admins - Moderare

Sistem de moderare pentru Discord cu funcționalități esențiale: Mute, Kick, Ban, și forum integration.

## 🚀 Funcționalități

### **User Context Menus**
- **🔇 Mute User** - Mute temporar cu durată personalizabilă (doar rolul Support)
- **👢 Kick User** - Kick utilizator (doar owner)
- **🔨 Ban User** - Ban permanent cu auto-renewal (doar owner)

### **Forum Integration**
- **Thread-uri de moderare** - Tracking în forum pentru toate acțiunile
- **Tag-uri colorate** - 🔵 INFO, 🟠 Support, 🟢 Rezolvat
- **Buton de acțiune** - Unmute/Unban direct din forum
- **Auto-renewal** - Ban permanent cu reînnoire automată

### **Management Tag-uri**
- **Verificare automată** - Detectează și repară tag-uri
- **Eliminare duplicate** - Curăță tag-uri vechi
- **Creare automată** - Adaugă tag-uri lipsă cu buline

## 📋 Structură

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

## 🔧 Integrare

### 1. Import comenzi în interaction handler:
```javascript
import { executeMute, executeBan, executeKick, handleMuteModal } from '../../../discordadmins/commands/moderation.js';
```

### 2. Adaugă în interactionCreate.js:
```javascript
// Pentru context menu commands
case '🔇 Mute User':
  await executeMute(interaction, context);
  break;
case 'Kick User':
  await executeKick(interaction, context);
  break;
case 'Ban User':
  await executeBan(interaction, context);
  break;

// Pentru modal submit
if (interaction.customId.startsWith('mute_')) {
  await handleMuteModal(interaction, context);
  return;
}
```

## 🛡️ Permisiuni

### Support Role Required (pentru mute):
- Doar utilizatorii cu rolul **Support** pot mute alți utilizatori
- Rolul este verificat direct (nu necesită permisiuni Discord)

### Owner Only (pentru kick/ban):
- Doar owner-ul serverului poate folosi aceste comenzi

## ⚙️ Configurare

### Roluri Support (config/index.js):
```javascript
moderation: {
  adminRoles: ['Support'],  // Doar rolul Support
  muteDuration: 5           // minute
}
```

## 📝 Caracteristici

### **Moderare:**
- **Support Mute**: Doar rolul Support poate mute alți utilizatori
- **Durată personalizabilă**: Mute cu durată aleasă de utilizator (1-1440 minute)
- **Motiv opțional**: Posibilitatea de a adăuga motiv pentru mute
- **Owner Kick/Ban**: Doar owner-ul poate kick/ban
- **Auto-unmute**: Mute-ul se ridică automat după durata setată
- **Auto-renewal**: Ban permanent cu reînnoire la fiecare 6 zile

### **Forum Integration:**
- **Thread-uri private**: Fiecare acțiune creează thread în forum
- **Tag-uri colorate**: Organizare vizuală cu buline colorate
- **Buton de acțiune**: Unmute/Unban direct din forum
- **Tracking complet**: Istoric complet al tuturor acțiunilor
- **Embed-uri detaliate**: Informații complete despre acțiuni

### **Management Tag-uri:**
- **Verificare automată**: Detectează tag-uri fără buline
- **Reparare automată**: Înlocuiește tag-uri vechi
- **Eliminare duplicate**: Curăță tag-uri redundante
- **Creare automată**: Adaugă tag-uri lipsă

### **UI/UX:**
- **Modal Interface**: Interfață prietenoasă pentru introducere date
- **Embed messages**: Răspunsuri vizuale cu detalii complete
- **Logging**: Toate acțiunile sunt logate
- **Error handling**: Mesaje clare pentru erori
- **Permission checks**: Verificări multiple de securitate

## 🔒 Securitate

- Verificare ierarhie roluri
- Protecție auto-acțiuni (kick/ban self)
- Validare permisiuni multiple
- Logare completă acțiuni
- Auto-renewal securizat pentru ban-uri

## 📦 Dependențe

- `discord.js` v14+
- Node.js 18+

## 🚀 Utilizare

### **Mute cu durată personalizabilă:**
1. Click dreapta pe utilizator
2. Selectează **🔇 Mute User**
3. Completează modal-ul care apare:
   - **Durata**: Introdu numărul de minute (1-1440)
   - **Motiv**: Opțional, descrie motivul mute-ului
4. Apasă **Submit**

### **Kick/Ban:**
1. Click dreapta pe utilizator
2. Selectează comanda dorită (Kick/Ban)
3. Confirmă acțiunea

### **Forum Management:**
1. **Verificare tag-uri**: Rulează `/check-support-tag`
2. **Tracking automat**: Acțiunile se loghează automat în forum
3. **Unmute/Unban**: Folosește butoanele din thread-urile de moderare

## 🎨 Tag-uri Colorate

### **Sistem de Tag-uri:**
- **🔵 INFO** - Informații generale (albastru)
- **🟠 Support** - Acțiuni de moderare (portocaliu)
- **🟢 Rezolvat** - Acțiuni rezolvate (verde)

### **Verificare Automată:**
- La fiecare acțiune de moderare
- Bot verifică tag-urile forum-ului
- Repară automat tag-uri fără buline
- Elimină tag-uri duplicate

## 🔧 Comenzi Admin

| Comandă | Descriere | Permisiuni |
|---------|-----------|------------|
| `/check-support-tag` | Verifică și repară tag-urile forum | Manage Guild |

**Note importante:**
- **Mute**: Doar utilizatorii cu rolul **Support** pot mute alți utilizatori
- **Kick/Ban**: Doar owner-ul serverului poate folosi aceste comenzi
- **Durate maxime**: Mute maxim 1440 minute (24 ore)
- **Ban permanent**: Se reînnoiește automat la fiecare 6 zile
- **Forum tracking**: Toate acțiunile sunt salvate în forum pentru audit

## 📋 Fișiere Importante

| Fișier | Scop |
|--------|------|
| `REFACTOR_ANALYSIS.md` | Analiză completă a codului și recomandări |
| `moderation.js` | Logică principală de moderare |
| `moderation-forum.js` | Management forum și tracking |
| `check-support-tag.js` | Verificare și reparare tag-uri |
