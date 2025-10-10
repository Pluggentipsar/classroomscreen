# Classroomscreen - Interactive Classroom Display

## Overview
An interactive classroom management tool that helps teachers create engaging learning environments. Teachers can use various widgets like timers, polls, randomizers, background customization, and more to facilitate classroom activities.

## Purpose
- Display interactive classroom tools on a shared screen
- Manage live sessions with students joining remotely
- Provide widgets for timers, polls, work symbols, traffic lights, and more
- Enable real-time collaboration between teachers and students

## Current State
The application is fully functional and running on Replit. It consists of:
- Main classroom screen (index.html) - Teacher view
- Join page (join.html) - Student entry point
- Viewer page (viewer.html) - Student view
- Comprehensive JavaScript application (app.js)
- Responsive CSS styling

## Project Architecture

### Technology Stack
- **Frontend**: Pure JavaScript (no framework)
- **Styling**: CSS with custom properties
- **Server**: Node.js HTTP + WebSocket server
- **Storage**: LocalStorage for persistence
- **Real-time Sync**: WebSocket for cross-device synchronization (with BroadcastChannel fallback)

### Directory Structure
```
.
├── src/
│   ├── index.html          # Main teacher interface
│   ├── join.html           # Student join page
│   ├── viewer.html         # Student viewer page
│   ├── app.js              # Main application logic (~5400 lines)
│   ├── styles.css          # Application styles (~3100 lines)
│   └── Musik/              # Built-in music tracks
│       ├── Lugn studiemusik, piano.mp3
│       └── Lugn studiemusik.mp3
├── server.js               # Node.js static file server
├── package.json            # Node.js project configuration
└── .gitignore             # Git ignore rules
```

### Key Features
1. **Widget System**: Timer, Clock, Poll, Randomizer, Sound Level, Music, Image, Text, Work Symbols, Traffic Light, Timetable
2. **Live Rooms**: Teachers can create rooms with codes for students to join
3. **Background Customization**: Custom images or URLs
4. **Symbol Library**: Educational symbols for classroom activities
5. **Screen Management**: Save and load different classroom screens
6. **Student Hand Raise**: Students can raise hands in viewer mode
7. **Real-time Sync**: Widget states sync between teacher and students

### Recent Changes (2025-10-10)

#### Initial Setup
- Set up Node.js HTTP server to serve static files
- Configured server to run on port 5000 with 0.0.0.0 host
- Added Cache-Control headers to prevent caching issues
- Created package.json for Node.js project
- Added .gitignore for Node.js projects
- Configured Replit workflow to run the server

#### Widget Design Improvements (Projektorvänligt)
**CSS Förbättringar:**
- Uppdaterad glass card-effekt med bättre transparens (70% opacity)
- Förbättrad backdrop-filter med 20px blur
- Större border-radius (24px) för modernare look
- Bättre box-shadows för djup
- High-contrast mode CSS med 95% opacity för ljusa rum
- CSS-variabler för färger: success (#10b981), warning (#f59e0b), danger (#ef4444)

**Typografi:**
- Stora, tydliga siffror (72px för klocka, 64px för big-digits)
- Tabular-nums för jämn sifferbredd
- Mindre, diskreta rubriker (12px, uppercase, med blå prick)
- Förbättrad hierarki med tydliga nivåer

**Timer Widget - Totalrenoverad:**
- SVG progressring som visuellt visar återstående tid
- +/- knappar istället för slider för bättre kontroll
- Modern toggle-switch design för ljud/visuell puls
- Progressringen ändrar färg vid varning (sista 10 sek)
- Ikoner på knappar (▶ Starta, ⏸ Pausa, ↻ Återställ)

**High-Contrast Mode:**
- Toggle-knapp (◐) i header för snabb åtkomst
- Sparas i localStorage
- Ökar kontrast och opacitet för ljusa klassrum
- Perfekt för projektorer i dagsljus

**Knappar & Kontroller:**
- Större klickytor (min-height 44px)
- Förbättrade hover-effekter med transform
- Tydligare states (primary, ghost, danger)
- Ikoner + text för bättre förståelse

**Traffic Light Widget:**
- Större lampor (64px diameter)
- Förbättrad glow-effekt vid aktivering
- Skala-animation när aktiv
- Bättre färger från CSS-variabler

**UI/UX Förbättringar - Diskreta ikoner:**
- Ersatt "Elevstyrning av/på" text med diskret ikon (👥)
- Klickbar toggle med tydlig visuell feedback:
  - Grå bakgrund när AV (60% opacity på ikon)
  - Blå bakgrund när PÅ (100% opacity på ikon)
- Custom tooltips med fade-in animation vid hover
- Hover-effekt med scale(1.1) för bättre användbarhet
- Genomgående diskret design som inte distraherar från innehållet

**Live-rum routing fix:**
- Fixat 404-fel när elever försöker ansluta till Live-rum
- Servern hanterar nu query parameters korrekt
- Alla URL:er använder nu absoluta sökvägar (börjar med /)
- Redirects mellan join.html och viewer.html fungerar felfritt

**WebSocket Cross-Device Synkning (2025-10-10):**
- Implementerad WebSocket-server (ws package) för cross-device real-time synk
- LiveSyncClient i app.js hanterar anslutning, reconnect med exponential backoff
- Rum-baserad routing: host och viewers kopplas via rumskod
- Meddelandetyper: join, sync-request, widget-control, widget-update, widgets-sync, screen-change, layout-reset, hand-raise
- Automatisk roomCode/role injection i alla meddelanden

**Host (Lärare):**
- Skapar LiveSyncClient vid rum-start
- Broadcast:ar widgets när 'joined' meddelande tas emot
- Pending broadcast buffer: Widgets som ändras under connection flushas när 'joined' triggas
- Disconnectar vid stängning av rum

**Viewer (Elev):**
- viewer.html sparar active room till localStorage FÖRE app.js laddar
- join.html validerar INTE mot localStorage (tillåter inkognito/cross-device joins)
- app.js initierar LiveSyncClient som viewer när active room finns
- Skickar sync-request när 'joined', får widgets-sync som svar
- Viewer Lock Overlay: Visar "🔒 Styrs av läraren" när elevstyrning är av

**Synk-mekanismer:**
- Initial sync: Host broadcast:ar när den får 'joined' + flush av pending changes
- Viewer sync: Viewer skickar sync-request, host svarar med widgets-sync
- Widget updates: persist() broadcast:ar direkt om connected, annars sätts pendingBroadcast flagga
- BroadcastChannel behålls som fallback för same-device synk

**Robusthet:**
- Pending broadcast buffer förhindrar dataförlust under LiveSync connection handshake
- Exponential backoff vid reconnect (max 5 försök)
- Omfattande console.log för debugging av WebSocket events och widget broadcasts

#### Real-time Sync Förbättringar (2025-10-10 Eftermiddag)

**Kritiska Bugfixar:**
1. **sendWidgetsSync() undefined-bugg** - Fixad fatal bugg där position, size, minimized, data skickades som undefined, vilket kraschade WebSocket. Nu läses data korrekt från DOM och widget save() funktioner.

2. **Ping/pong keep-alive** - Implementerad WebSocket heartbeat (30 sek) för att förhindra prematura connection drops.

3. **Real-time widget creation** - syncAllWidgets() skapar nu NYA widgets i viewer om de inte finns, inte bara uppdaterar befintliga. Widgets dyker upp hos elever i realtid utan F5-refresh.

4. **Student list UI** - Implementerat student management:
   - addStudentToRoom() - Lägger till elever i localStorage när de ansluter
   - removeStudentFromRoomById() - Tar bort elever när de disconnectar
   - updateStudentHandRaise() - Uppdaterar hand raise status
   - window.updateStudentListGlobal - Global funktion för UI-uppdatering

5. **Viewer-joined & hand-raise** - WebSocket event handlers uppdaterar nu student list UI:
   - viewer-joined: Lärare ser när elever ansluter
   - viewer-left: Lärare ser när elever lämnar
   - hand-raise: Lärare ser när elever räcker upp hand

6. **Låssymbol fix** - viewerControlEnabled default ändrat från false → true:
   - Nya widgets visar INTE låssymbol som default
   - Elever kan interagera med widgets (flytta, se innehåll)
   - Lärare kan stänga av elevstyrning per widget med 👥 knappen

**Widget Sync Förbättringar:**
- syncAllWidgets() uppdaterar nu position, size, minimized, data för befintliga widgets
- Använder hasOwnProperty check för viewerControlEnabled med true som fallback
- Widgets synkar nu korrekt både initial load OCH real-time updates

#### Elevbehörigheter (2025-10-10 Kväll)

**Viewer Mode Behörigheter:**
- Elever kan flytta och resiza widgets temporärt för att organisera sin egen vy
- Position och storlek sparas INTE och återställs vid nästa sync från läraren
- makeDraggable och makeResizable skippar persist() när window.isViewerMode = true
- Detta tillåter tillfällig organisation utan att påverka lärarens layout

**Innehållskontroll:**
- När viewerControlEnabled = false (👥 knapp AV):
  - Viewer lock overlay visas och täcker widget-innehållet
  - Alla knappar och inputs är disabled
  - Elever kan INTE ändra widget-innehåll
  
- När viewerControlEnabled = true (👥 knapp PÅ):
  - Ingen lock overlay visas
  - Elever KAN ändra widget-innehåll (t.ex. timer knappar, poll-svar)
  - Ändringar broadcast:as till läraren via WebSocket
  - persist() anropas normalt för innehållsändringar (inte position/size)

#### Bugfixar (2025-10-10 Eftermiddag/Kväll)

**Elevstyrning-knappen (👥) fix:**
- Problem: Knappen var inte klickbar eftersom drag-event startade när man klickade på <span> ikonen inuti knappen
- Lösning: Uppdaterad makeDraggable() för att kolla event.target.closest("button") förutom tagName check
- Nu fungerar alla knappar i widget-header även när de innehåller child elements

**Timer widget broadcast fix:**
- Timer broadcaster nu när den STARTAR (inte bara pausa/reset)
- save() sparar nu running state och remaining time för korrekt synkning
- onChange() anropas vid: start, pausa, reset, minuter ändras, ljudinställningar ändras
- Elever ser timer-ändringar i realtid

**Presentation widget broadcast fix:**
- Presentation broadcaster nu vid ALL slide-navigering:
  - Prev/Next knappar i presentation mode
  - Arrow keys i presentation mode (ArrowLeft/ArrowRight)
  - Ctrl/Cmd+Arrow keys i edit mode
- Elever ser vilken slide läraren visar i realtid

**Viewer-lock overlay fix:**
- Tog bort overlay som täckte hela widgeten när den var låst
- Elever kan nu SE widget-innehåll (t.ex. timer tickar ner) även när låst
- Knappar/inputs är disabled när viewerControlEnabled = false
- Elever kan INTE klicka på knappar eller redigera innehåll när låst
- Läraren kontrollerar via 👥-knappen om elever kan interagera eller bara se

**Timer real-time sync fix (2025-10-10):**
- Lagt till load() funktion i timer widget för att synka running state via WebSocket
- När läraren startar timer broadcast:as `running=true` och `remaining` tid
- Elever får synk-data och startar sin egen lokala timer-interval
- Timer tickar nu i realtid på elevers skärmar!
- När läraren pausar/reset:ar broadcast:as det och elevers timers uppdateras
- Elever som joinar mitt i får korrekt återstående tid och timer fortsätter ticka

**Timer load() bugfix (2025-10-10 Eftermiddag):**
- Problem: Timer load() anropades för befintliga widgets men INTE för nya widgets i syncAllWidgets()
- När elever joinade och fick en pågående timer skapades widgeten med createWidget() men load() anropades aldrig
- Lösning: syncAllWidgets() anropar nu load() efter createWidget() för nya widgets
- Fixad guard: Använder hasOwnProperty("data") && data != null istället för bara truthiness check
- Detta säkerställer att load() anropas även när data är ett tomt objekt
- Console.log tillagt i timer load() för debugging (kan tas bort senare)
- Timer startar nu korrekt på elevers skärmar när de joinar mitt i en pågående timer!

#### Smart Dock - Widget-meny (2025-10-10)

**Kompakt Dock-design:**
- Ersatt gammal toolbar med modern Smart Dock längst ner
- Kompakt rundad design med bara favoritikoner (ingen text)
- 5 favorit-widgets som standard: Bakgrund, Omröstning, Namnslumpare, Musikspelare, Timer
- "Mer" knapp med text för att öppna launcher
- Glasmorfism-effekt med backdrop-blur och skuggor
- Responsiv design för mobil och desktop

**Launcher-panel (sökbar widget-palett):**
- Öppnas via "Mer" knapp eller Ctrl/Cmd+K snabbtangent
- Sökfält med realtidsfiltrering av widgets
- Svenska namn på alla widgets genomgående:
  - Bakgrund, Omröstning, Namnslumpare, Ljudnivå, Musikspelare
  - Bild, Instruktioner, Arbetssätt, Trafikljus, Schema, Timer, Klocka
  - Presentation, Lektionsprogress, Gruppmakare, Poängtavla, Handuppräckning
  - YouTube, QR-kod, Stegvis instruktion, Källkritik-kort, och mer
- Snabbval-sektion med favoritwidgets (som chips/badges)
- Senaste-sektion som visar de 5 senast använda widgets
- Grid med alla tillgängliga widgets (ikoner + svenska namn)
- Escape-tangent stänger launcher
- Backdrop-overlay med blur-effekt

**Funktionalitet:**
- Favoritikoner i dock för snabb åtkomst (1-klick)
- Launcher för alla widgets med sök och filtrering
- Recent widgets sparas automatiskt när widgets skapas
- Svenska tooltips på dock-ikoner
- Keyboard shortcuts: Ctrl/Cmd+K öppnar, Escape stänger
- Responsiv: mobil-anpassad layout med mindre ikoner

**Teknisk implementation:**
- `widgetNamesSwedish` objekt mappar widget-typer till svenska namn
- `getWidgetName()` hämtar svenska namn för visning
- `getWidgetIcon()` hämtar emoji-ikoner för widgets
- `renderLauncherGrid()` skapar widget-kort dynamiskt
- `renderLauncherQuickAccess()` visar favoriter och senaste
- `launchWidget()` skapar widget och lägger till i recent

## Running the Project

### Development
The server is configured to run automatically via Replit workflow:
- Runs on port 5000
- Serves files from `/src` directory
- Hot reload: refresh browser to see changes

### Local Development (if needed)
```bash
node server.js
```

## User Preferences
- Language: Swedish (sv)
- Interface in Swedish
