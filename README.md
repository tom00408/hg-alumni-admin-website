# 🛡️ Alumni-Admin-Website des Hainberg-Gymnasiums

Eine moderne, sichere Vue.js-Administrationsanwendung für die Verwaltung des Alumni-Vereins des Hainberg-Gymnasiums Göttingen e.V. Diese Admin-Website ermöglicht es Vereinsadministratoren, Mitglieder zu verwalten, Veranstaltungen zu organisieren, News zu erstellen und die Galerie zu pflegen.

**⚠️ Hinweis:** Diese README geht davon aus, dass die Haupt-Alumni-Website bereits erstellt und konfiguriert wurde. Diese Admin-Website nutzt dieselbe Firebase-Konfiguration und erweitert das bestehende System um Verwaltungsfunktionen.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.18-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=flat&logo=firebase)
![Pinia](https://img.shields.io/badge/Pinia-2.1.7-FFD859?style=flat&logo=pinia)

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Entwicklung](#-entwicklung)
- [Admin-Funktionen](#-admin-funktionen)
- [Projektstruktur](#-projektstruktur)
- [Build & Deployment](#-build--deployment)
- [Sicherheit](#-sicherheit)
- [Technologie-Stack](#-technologie-stack)

## 🔍 Überblick

Die Alumni-Admin-Website ist eine spezialisierte Verwaltungsanwendung, die folgende Hauptfunktionen bietet:

### **🎯 Kernfunktionen:**
- **👥 Mitgliederverwaltung** - Vollständige CRUD-Operationen für Vereinsmitglieder
- **📝 Mitgliedsanträge** - Bearbeitung und Genehmigung neuer Anträge  
- **📅 Terminverwaltung** - Erstellen und Verwalten von Vereinsveranstaltungen
- **📰 News-Management** - Erstellen und Bearbeiten von Nachrichtenartikeln
- **🖼️ Galerie-Verwaltung** - Upload und Organisation von Bildern in Ordnern
- **📊 Dashboard** - Übersicht über wichtige Kennzahlen und aktuelle Aktivitäten
- **📤 CSV-Export** - Export von Mitgliederdaten für externe Verwendung

### **🔐 Sicherheitsfeatures:**
- Firebase Authentication mit Admin-Berechtigung
- Rollenbasierte Zugriffskontrolle
- Sichere API-Kommunikation über Firestore Security Rules
- Session-Management und automatische Abmeldung

## ✅ Voraussetzungen

**⚠️ Wichtig:** Diese Admin-Website setzt voraus, dass bereits eine funktionsfähige Alumni-Website existiert mit:
- ✅ Firebase-Projekt konfiguriert
- ✅ Firestore-Datenbank eingerichtet  
- ✅ Firebase Authentication aktiviert
- ✅ Storage-Bucket konfiguriert
- ✅ Security Rules implementiert
- ✅ Admin-Benutzer in der `admins` Collection angelegt

### 📋 Systemvoraussetzungen

1. **Node.js** (Version 18.x oder höher)
   ```bash
   # Überprüfen der installierten Version
   node --version
   
   # Installation:
   # macOS: https://nodejs.org/ oder via Homebrew:
   brew install node
   
   # Windows: https://nodejs.org/
   # Linux (Ubuntu/Debian):
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **npm** (wird automatisch mit Node.js installiert)
   ```bash
   npm --version
   npm install -g npm@latest
   ```

3. **Git** (für Versionskontrolle)
   ```bash
   git --version
   ```

## 📦 Installation

### 1. Repository klonen

```bash
# HTTPS
git clone https://github.com/your-username/alumni-admin-website.git
cd alumni-admin-website

# oder SSH
git clone git@github.com:your-username/alumni-admin-website.git
cd alumni-admin-website
```

### 2. Dependencies installieren

```bash
# Alle Abhängigkeiten installieren
npm install
```

**Was wird installiert:**

**🚀 Dependencies (Laufzeit):**
- `vue@^3.5.18` - Vue.js Framework
- `vue-router@^4.2.5` - Client-side Routing  
- `pinia@^2.1.7` - State Management
- `firebase@^12.2.1` - Backend-as-a-Service
- `@heroicons/vue@^2.2.0` - Icon-Bibliothek

**🔧 DevDependencies (Entwicklung):**
- `vite@^7.1.2` - Build-Tool und Dev-Server
- `typescript@~5.8.3` - TypeScript Compiler
- `vue-tsc@^3.0.5` - Vue TypeScript Compiler
- `@vitejs/plugin-vue@^6.0.1` - Vue Plugin für Vite
- `tsx@^4.20.5` - TypeScript Script Runner

## ⚙️ Konfiguration

### 1. Firebase-Konfiguration übernehmen
```bash
# src/lib/firebase.ts
cd src/lib/
cp firebase-example.ts firebase.ts
```

```js
//Anpassen
const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId"
}
````


**Erforderliche Umgebungsvariablen:**

```bash
# .env Datei erstellen (nutze dieselbe Konfiguration wie die Haupt-Website)
cp .env.example .env
```


```bash
# Admin-spezifische Konfiguration
VITE_APP_NAME="Alumni Admin"
VITE_VERSION="v1.0.0"

#Deployment
SFTP_HOST="xxx"
SFTP_KEY="xxx"
SFTP_USERNAME="xxxx"
```

### 2. Admin-Benutzer konfigurieren

**⚠️ Wichtiger Schritt:** Stellen Sie sicher, dass Ihr Admin-Benutzer in der Firestore `admins` Collection existiert:

```javascript
// Firestore Collection: /admins/{userId}
{
  isAdmin: true,
  email: "admin@example.com",
  createdAt: /* Timestamp */
}
```

### 3. Firestore Security Rules überprüfen

Die Admin-Website benötigt erweiterte Berechtigungen. Stellen Sie sicher, dass Ihre Firestore Rules Admins vollständigen Zugriff gewähren:

```javascript
// Beispiel einer Admin-Regel in Firestore Rules
function isAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
}

// Admins dürfen alles
match /{document=**} {
  allow read, write: if isAdmin();
}
```

## 🚀 Entwicklung

### Entwicklungsserver starten

```bash
# Standard-Entwicklungsserver (Port 5173)
npm run dev

# Server läuft auf: http://localhost:5173
```

**🔧 Entwicklungsfeatures:**
- ⚡ Vite Dev Server mit Hot Module Replacement
- 🔍 TypeScript-Unterstützung mit Live-Typprüfung
- 🎨 CSS Hot Reload
- 🐛 Vue DevTools Integration
- 📱 Responsive Design Testing

### Entwicklungsworkflow

1. **Admin-Login testen:**
   - Navigieren Sie zu `/login`
   - Melden Sie sich mit Admin-Credentials an
   - Überprüfen Sie die Weiterleitung zum Dashboard

2. **Funktionen entwickeln:**
   ```bash
   # TypeScript prüfen
   npm run type-check
   
   # Build testen  
   npm run build
   npm run preview
   ```

3. **Code-Qualität:**
   ```bash
   # Linting
   npm run lint
   
   # Formatierung
   npm run format
   ```

## 👑 Admin-Funktionen

### **📊 Dashboard**
- Übersicht über Mitgliederstatistiken
- Aktuelle Anträge und Aktivitäten
- Schnellzugriff auf wichtige Funktionen
- System-Gesundheitsstatus

### **👥 Mitgliederverwaltung**
- **Mitglieder-Tabelle** mit Sortierung und Filterung
- **Detailansicht** für jeden Mitglied
- **Bulk-Operationen** (Mehrfachauswahl)
- **CSV-Export** mit konfigurierbaren Feldern
- **Status-Management** (Aktiv, Inaktiv, Gesperrt)
- **Mitgliedsnummer-Generierung**

### **📝 Mitgliedsanträge**
- **Antrags-Pipeline** (Neu → In Bearbeitung → Genehmigt/Abgelehnt)
- **Detailprüfung** aller Antragsdaten
- **Ein-Klick-Genehmigung** mit automatischer Mitgliedserstellung
- **Kommentarfunktion** für interne Notizen
- **E-Mail-Benachrichtigungen** (geplant)

### **📅 Terminverwaltung**
- **Event-Kalender** mit Monats-/Listenansicht
- **Event-Editor** mit Rich-Text-Beschreibung
- **Kategorisierung** und Tagging
- **Teilnehmerverwaltung** (geplant)
- **Automatische Erinnerungen** (geplant)

### **📰 News-Management**
- **WYSIWYG-Editor** für Artikel
- **Bild-Upload** mit automatischer Optimierung
- **SEO-Optimierung** (Meta-Tags, Slugs)
- **Veröffentlichungsplanung**
- **Kategorien und Tags**

### **🖼️ Galerie-Verwaltung**
- **Ordner-basierte Organisation**
- **Bulk-Upload** mit Drag & Drop
- **Bild-Metadaten** (Titel, Beschreibung, Tags)
- **Thumbnail-Generierung**
- **Bildkomprimierung**

## 📁 Projektstruktur

```
AdminWebsite/
├── public/                    # Statische Assets
│   ├── hglogo.png            # Favicon und Logo
│   └── index.html            # HTML Template
├── src/
│   ├── components/           # Vue Komponenten
│   │   ├── AppHeader.vue     # Haupt-Navigation
│   │   ├── AppSidebar.vue    # Seitenleiste
│   │   ├── HgCard.vue        # Wiederverwendbare Card
│   │   ├── dashboard/        # Dashboard-Komponenten
│   │   ├── galerie/          # Galerie-Komponenten
│   │   │   ├── AddImagesModal.vue
│   │   │   ├── FolderModal.vue
│   │   │   └── ImageGrid.vue
│   │   ├── mitglieder/       # Mitglieder-Komponenten
│   │   │   ├── ExportModal.vue
│   │   │   └── ApplicationDetailModal.vue
│   │   ├── news/             # News-Komponenten
│   │   └── termine/          # Event-Komponenten
│   ├── layouts/              # Layout-Templates
│   │   └── DefaultLayout.vue
│   ├── pages/                # Hauptseiten
│   │   ├── Dashboard.vue     # Admin-Dashboard
│   │   ├── Login.vue         # Anmelde-Seite
│   │   ├── Mitglieder.vue    # Mitgliederverwaltung
│   │   ├── Mitgliedsantraege.vue # Antragsverwaltung
│   │   ├── Termine.vue       # Event-Management
│   │   ├── News.vue          # News-Management
│   │   ├── Galerie.vue       # Galerie-Management
│   │   └── NotFound.vue      # 404-Seite
│   ├── services/             # API Services
│   │   ├── auth.ts           # Authentifizierung
│   │   ├── membership.ts     # Mitgliederverwaltung
│   │   ├── events.ts         # Event-Management
│   │   ├── news.ts           # News-Management
│   │   ├── gallery.ts        # Galerie-Management
│   │   ├── folders.ts        # Ordner-Management
│   │   ├── imageUpload.ts    # Bild-Upload
│   │   └── csvExport.ts      # CSV-Export
│   ├── stores/               # Pinia State Management
│   │   ├── auth.ts           # Auth-State
│   │   ├── members.ts        # Mitglieder-State
│   │   ├── membership.ts     # Antrags-State
│   │   ├── events.ts         # Event-State
│   │   ├── news.ts           # News-State
│   │   └── gallery.ts        # Galerie-State
│   ├── lib/                  # Utilities und Konfiguration
│   │   ├── firebase.ts       # Firebase-Konfiguration
│   │   ├── types.ts          # TypeScript-Typen
│   │   └── firebase-example.ts # Konfigurationsvorlage
│   ├── styles/               # Globale Styles
│   │   ├── style.css         # Haupt-Stylesheet
│   │   └── theme.css         # Design-System
│   ├── tomponents/           # Custom UI-Komponenten
│   │   └── TomButton.vue     # Wiederverwendbarer Button
│   ├── router/               # Vue Router
│   │   └── index.ts          # Route-Definitionen
│   ├── App.vue              # Root-Komponente
│   └── main.ts              # Entry Point
├── scripts/                  # Build/Deploy Scripts
│   ├── check-css.ts         # CSS-Analyse
│   ├── check-file-sizes.ts  # Bundle-Analyse
│   └── deploy.ts            # Deployment-Script
├── dist/                     # Build Output
├── .env.example             # Umgebungsvariablen Template
├── package.json             # Dependencies & Scripts
├── tsconfig.json            # TypeScript Config
├── vite.config.ts           # Vite Config
└── README.md                # Diese Datei
```

## 🔨 Build & Deployment

### Development Build
```bash
# Entwicklungsserver mit HMR
npm run dev

# Auf spezifischem Port
npm run dev -- --port 3000
```

### Production Build
```bash
# Optimierten Build erstellen
npm run build

# Build lokal testen
npm run preview
```

### Deployment Scripts
```bash
# CSS-Analyse
npm run check:css

# Bundle-Größe prüfen
npm run check:file-sizes

# TypeScript-Typen prüfen
npm run type-check
```

### Verfügbare Scripts

```bash
# 🚀 Entwicklung
npm run dev              # Dev-Server starten
npm run build            # Production Build
npm run preview          # Build lokal testen

# 🔍 Code-Qualität  
npm run type-check       # TypeScript prüfen
npm run check:css        # CSS analysieren
npm run check:file-sizes # Bundle-Größe prüfen


npm run deploy    #Deployment
```

## 🔐 Sicherheit

### **Authentication Flow:**
1. **Login-Prozess:**
   - E-Mail/Passwort-Authentifizierung über Firebase Auth
   - Überprüfung der Admin-Berechtigung in Firestore
   - Session-Management mit automatischer Verlängerung

2. **Autorisierung:**
   - Rollenbasierte Zugriffskontrolle (RBAC)
   - Route Guards für geschützte Bereiche
   - API-Level-Sicherheit über Firestore Rules

3. **Datenschutz:**
   - Sichere Übertragung aller Daten (HTTPS)
   - Minimale Datenspeicherung im Browser
   - Automatische Session-Bereinigung

### **Sicherheits-Best-Practices:**

```typescript
// Beispiel: Route Guard Implementation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/unauthorized')
  } else {
    next()
  }
})
```

## 🛠️ Technologie-Stack

### **🎨 Frontend-Framework**
- **Vue.js 3** - Progressive JavaScript Framework mit Composition API
- **TypeScript** - Statische Typisierung für bessere Entwicklererfahrung
- **Vue Router 4** - Client-side Routing mit Navigation Guards
- **Pinia** - Modernes State Management für Vue

### **🔧 Build & Development Tools**
- **Vite** - Next-generation Frontend Build Tool
- **Vue SFC** - Single File Components mit `<script setup>`
- **PostCSS** - CSS-Transformationen und Optimierungen
- **TypeScript Compiler** - Typ-Checking und Transpilation

### **☁️ Backend & Services**
- **Firebase Authentication** - Sichere Benutzerauthentifizierung
- **Cloud Firestore** - NoSQL-Datenbank mit Real-time Updates
- **Firebase Storage** - Datei-Upload und -verwaltung
- **Firebase Security Rules** - Server-side Zugriffskontrolle

### **🎨 UI & Styling**
- **CSS Custom Properties** - Konsistentes Design-System
- **CSS Grid & Flexbox** - Moderne, responsive Layouts
- **Heroicons** - Professionelle Icon-Bibliothek
- **Mobile-First Design** - Optimiert für alle Bildschirmgrößen

### **📊 Features & Funktionalitäten**
- **CSV Export** - Datenexport mit konfigurierbaren Feldern
- **Image Upload** - Drag & Drop mit Komprimierung
- **Rich Text Editor** - WYSIWYG für News-Artikel
- **Real-time Updates** - Live-Synchronisation mit Firestore
- **Bulk Operations** - Mehrfachauswahl und -bearbeitung

## 🔧 Entwicklungshinweise

### **📝 Code-Standards:**
- **TypeScript First:** Alle neuen Dateien in TypeScript
- **Composition API:** Vue 3 `<script setup>` Syntax verwenden
- **Pinia Stores:** Für globales State Management
- **Semantic HTML:** Für bessere Barrierefreiheit

### **🏷️ Naming Conventions:**
```typescript
// Komponenten: PascalCase
AppHeader.vue
ExportModal.vue

// Variablen/Funktionen: camelCase
const exportSelectedMembers = () => {}
const isAuthenticated = ref(false)

// CSS-Klassen: kebab-case
.nav-item
.export-modal

// Konstanten: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_FILE_SIZE = 5 * 1024 * 1024
```

### **🔄 Git Workflow:**
```bash
# Feature entwickeln
git checkout -b feature/member-export
git add .
git commit -m "feat(members): add CSV export functionality"

# Code Review
git push origin feature/member-export
# → Pull Request erstellen

# Nach Review mergen
git checkout main
git pull origin main
git branch -d feature/member-export
```

## 🐛 Troubleshooting

### **❌ Häufige Probleme & Lösungen:**

1. **🔐 Login-Probleme:**
   ```bash
   # Admin-Status in Firestore prüfen
   # Collection: /admins/{userId}
   # Field: isAdmin: true
   ```

2. **🔥 Firebase-Verbindung:**
   ```bash
   # .env Datei überprüfen
   # Firebase-Konfiguration validieren
   # Network-Tab in DevTools prüfen
   ```

3. **📦 Build-Fehler:**
   ```bash
   # Cache leeren
   rm -rf node_modules dist
   npm install
   npm run build
   ```

4. **🎨 Styling-Probleme:**
   ```bash
   # CSS-Analyse ausführen
   npm run check:css
   
   # Browser-Cache leeren
   # Hard Refresh (Ctrl+F5)
   ```

5. **⚡ Performance-Probleme:**
   ```bash
   # Bundle-Größe prüfen
   npm run check:file-sizes
   
   # Lighthouse-Audit ausführen
   # Vue DevTools Performance Tab nutzen
   ```

### **🔍 Debug-Tipps:**

```typescript
// Vue DevTools aktivieren
app.config.devtools = true

// Console-Logging für Entwicklung
if (import.meta.env.DEV) {
  console.log('Debug Info:', data)
}

// Error Boundary für Production
app.config.errorHandler = (err, vm, info) => {
  console.error('Global Error:', err, info)
}
```

## 📞 Support & Kontakt

Bei Fragen oder Problemen:

**👨‍💻 Entwickler-Support:**
- **E-Mail:** tom00408@aol.com
- **Team:** HG Alumni IT-Team

**📚 Weitere Ressourcen:**
- **Haupt-Website Repository:** [Alumni-Website](https://github.com/your-username/alumni-website)
- **Firebase Console:** [Firebase Project](https://console.firebase.google.com/)
- **Vue.js Dokumentation:** [Vue 3 Guide](https://vuejs.org/guide/)
- **TypeScript Handbuch:** [TS Handbook](https://www.typescriptlang.org/docs/)

**🚨 Notfall-Kontakt:**
- Bei kritischen Sicherheitsproblemen sofort melden
- System-Ausfälle über den Admin-Chat melden
- Datenbank-Probleme nicht selbst beheben, sondern eskalieren

---

**🎓 Entwickelt für den Alumni-Verein des Hainberg-Gymnasiums Göttingen e.V.**

*Diese Admin-Website ist Teil des Alumni-Ökosystems und arbeitet nahtlos mit der Haupt-Website zusammen.*
