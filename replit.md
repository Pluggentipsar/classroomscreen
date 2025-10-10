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
- Host: Skapar LiveSyncClient vid rum-start, disconnectar vid stängning
- Viewer: Ansluter automatiskt om aktivt rum finns i localStorage
- BroadcastChannel behålls som fallback för same-device synk
- Viewer Lock Overlay: Visar "🔒 Styrs av läraren" när elevstyrning är av
- CSS för .widget-viewer-lock: Semi-transparent overlay med blur-effekt

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
